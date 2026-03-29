import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { adminAuth } from "../middleware/adminAuth.js";

const auditRoutes = new Hono();

// GET /api/admin/audit-logs - 获取审计日志列表 (仅限管理员)
auditRoutes.get("/", adminAuth(), async (c) => {
  try {
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true, avatar: true }
          }
        }
      }),
      prisma.auditLog.count()
    ]);

    return c.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Fetch audit logs error:", error);
    return c.json({ success: false, error: "Failed to fetch audit logs" }, 500);
  }
});

export default auditRoutes;
