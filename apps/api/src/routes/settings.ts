import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { createAuditLog } from "../lib/audit.js";

const settingRoutes = new Hono();

// GET /api/settings — 获取所有系统设置 (公开)
settingRoutes.get("/", async (c) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    
    // 转换为键值对对象方便前端使用
    const config = settings.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return c.json({ data: config });
  } catch (error) {
    console.error("Fetch settings error:", error);
    return c.json({ error: "Failed to fetch settings" }, 500);
  }
});

// PATCH /api/settings — 批量更新系统设置 (管理员)
settingRoutes.patch("/", adminAuth(), async (c) => {
  try {
    const currentUserId = c.req.header("x-user-id");
    const body = await c.req.json();
    const updates = Object.entries(body);

    // 获取旧值用于审计
    const keys = updates.map(([k]) => k);
    const oldSettings = await prisma.systemSetting.findMany({
      where: { key: { in: keys } }
    });

    for (const [key, value] of updates) {
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { 
          key, 
          value: String(value),
          type: typeof value === "boolean" ? "boolean" : "text"
        },
      });
    }

    // 记录审计日志
    if (currentUserId) {
      createAuditLog({
        userId: currentUserId,
        action: "UPDATE_SYSTEM_SETTING",
        targetType: "SYSTEM_SETTING",
        details: {
          before: oldSettings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}),
          after: body
        },
        ip: c.req.header("x-forwarded-for") || "unknown"
      });
    }

    return c.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    console.error("Update settings error:", error);
    return c.json({ error: "Failed to update settings" }, 500);
  }
});

export default settingRoutes;
