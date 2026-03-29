import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { createAuditLog } from "../lib/audit.js";

const adminRoutes = new Hono();

// 应用行政管理权限中间件
adminRoutes.use("*", adminAuth());

adminRoutes.get("/stats", async (c) => {
  try {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalSkills,
      publishedSkills,
      totalUsers,
      totalComments,
      recentPosts
    ] = await Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { isPublished: true } }),
      prisma.blogPost.count({ where: { isPublished: false } }),
      prisma.skill.count(),
      prisma.skill.count({ where: { isPublished: true } }),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.blogPost.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { name: true, avatar: true }
          }
        }
      })
    ]);

    return c.json({
      success: true,
      data: {
        stats: {
          posts: { total: totalPosts, published: publishedPosts, draft: draftPosts },
          skills: { total: totalSkills, published: publishedSkills },
          users: totalUsers,
          comments: totalComments
        },
        recentPosts
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return c.json({ success: false, error: "Failed to fetch dashboard stats" }, 500);
  }
});

// 获取所有用户列表
adminRoutes.get("/users", async (c) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      }
    });

    return c.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Fetch users error:", error);
    return c.json({ success: false, error: "Failed to fetch users" }, 500);
  }
});

// 更新用户信息 (角色或状态)
adminRoutes.patch("/users/:id", async (c) => {
  const id = c.req.param("id");
  const currentUserId = c.req.header("x-user-id");
  const body = await c.req.json();
  const { role, status } = body;

  //禁止管理员修改自己的角色或状态，防止把自己锁在外面
  if (id === currentUserId && (role || status)) {
    return c.json({
      success: false,
      error: "禁止修改自己的角色或状态，请联系其他管理员进行此类操作"
    }, 400);
  }

  try {
    const userSnapshot = await prisma.user.findUnique({ where: { id } });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(status && { status })
      }
    });

    // 记录审计日志
    if (currentUserId) {
      createAuditLog({
        userId: currentUserId,
        action: role ? "UPDATE_USER_ROLE" : "UPDATE_USER_STATUS",
        targetType: "USER",
        targetId: id,
        details: {
          before: { role: userSnapshot?.role, status: userSnapshot?.status },
          after: { role: updatedUser.role, status: updatedUser.status },
          targetEmail: updatedUser.email
        },
        ip: c.req.header("x-forwarded-for") || "unknown"
      });
    }

    return c.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error("Update user error:", error);
    return c.json({ success: false, error: "Failed to update user" }, 500);
  }
});

// 删除用户
adminRoutes.delete("/users/:id", async (c) => {
  const id = c.req.param("id");
  const currentUserId = c.req.header("x-user-id");

  //禁止删除自己
  if (id === currentUserId) {
    return c.json({
      success: false,
      error: "禁止删除自己的账号"
    }, 400);
  }

  try {
    const userSnapshot = await prisma.user.findUnique({ where: { id } });
    
    await prisma.user.delete({
      where: { id }
    });

    // 记录审计日志
    if (currentUserId) {
      createAuditLog({
        userId: currentUserId,
        action: "DELETE_USER",
        targetType: "USER",
        targetId: id,
        details: {
          deletedUser: { email: userSnapshot?.email, name: userSnapshot?.name }
        },
        ip: c.req.header("x-forwarded-for") || "unknown"
      });
    }

    return c.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return c.json({ success: false, error: "Failed to delete user" }, 500);
  }
});

export default adminRoutes;
