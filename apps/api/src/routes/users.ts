import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { userAuth } from "../middleware/userAuth.js";

const userRoutes = new Hono();

// GET /profile - 获取当前登录用户信息
userRoutes.get("/profile", userAuth(), async (c) => {
  const userId = c.req.header("x-user-id");
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    if (!user) {
      return c.json({ success: false, error: "用户不存在" }, 404);
    }

    return c.json({ success: true, data: user });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return c.json({ success: false, error: "获取用户信息失败" }, 500);
  }
});

// PATCH /profile - 更新当前登录用户信息 (带原密码校验)
userRoutes.patch("/profile", userAuth(), async (c) => {
  const userId = c.req.header("x-user-id");
  const body = await c.req.json();
  const { name, avatar, password, currentPassword } = body;

  try {
    // 1. 获取当前用户，查验原密码
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return c.json({ success: false, error: "用户不存在" }, 404);
    }

    // 2. 只有在修改密码或关键信息时才强制要求原密码？
    // 或者任何修改都要求原密码以确保安全。这里我们规定修改密码时必须校验原密码。
    if (password && (!currentPassword || user.password !== currentPassword)) {
      return c.json({
        success: false,
        error: "当前密码错误，无法修改密码"
      }, 401);
    }

    // 3. 执行更新
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
        ...(password && { password }) 
      }
    });

    return c.json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        email: updatedUser.email
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return c.json({ success: false, error: "更新用户信息失败" }, 500);
  }
});

export default userRoutes;
