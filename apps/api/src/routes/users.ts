import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { userAuth } from "../middleware/userAuth.js";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";
import { createAuditLog } from "../lib/audit.js";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name is too short").max(50, "Name is too long").optional(),
  avatar: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  currentPassword: z.string().optional()
});

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
userRoutes.patch("/profile", userAuth(), zValidator("json", updateProfileSchema), async (c) => {
  const userId = c.req.header("x-user-id");
  if (!userId) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  const { name, avatar, password, currentPassword } = c.req.valid("json");

  try {
    // 1. 获取当前用户，查验原密码
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return c.json({ success: false, error: "用户不存在" }, 404);
    }

    let hashedPassword = undefined;

    // 2. 只有在修改密码或关键信息时才强制要求原密码
    if (password) {
      if (!currentPassword) {
        return c.json({ success: false, error: "当前密码不能为空" }, 400);
      }
      
      const isPasswordValid = user.password ? await bcrypt.compare(currentPassword, user.password) : false;
      
      if (!isPasswordValid) {
        return c.json({
          success: false,
          error: "当前密码错误，无法修改密码"
        }, 401);
      }
      
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // 3. 执行更新
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
        ...(hashedPassword && { password: hashedPassword }) 
      }
    });

    // 4. Record audit log if password was changed
    if (hashedPassword) {
      createAuditLog({
        userId: userId,
        action: "UPDATE_USER_PASSWORD",
        targetType: "USER",
        targetId: userId,
        ip: c.req.header("x-forwarded-for") || "unknown"
      });
    }

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
