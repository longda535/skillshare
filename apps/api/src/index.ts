import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { skillRoutes } from "./routes/skills.js";
import { categoryRoutes } from "./routes/categories.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import { healthRoutes } from "./routes/health.js";
import { swaggerUI } from "@hono/swagger-ui";
import uploadRoutes from "./routes/upload.js";
import adminRoutes from "./routes/admin.js";
import settingRoutes from "./routes/settings.js";
import userRoutes from "./routes/users.js";
import auditRoutes from "./routes/audit.js";
import { serveStatic } from "@hono/node-server/serve-static";

import { prisma } from "./lib/prisma.js";

const app = new Hono();

// --- Middleware ---
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization", "x-user-role", "x-user-id"],
    credentials: true,
  })
);

// --- Maintenance Mode Middleware ---
app.use("*", async (c, next) => {
  const path = c.req.path;
  const userRole = c.req.header("x-user-role");
  
  // 白名单路径：管理员接口、设置读取接口、健康检查、静态文件、根路径
  // 注意：管理员角色永远可以访问
  if (
    userRole === "ADMIN" || 
    path.startsWith("/api/admin") || 
    (path === "/api/settings" && c.req.method === "GET") || 
    path.startsWith("/api/auth") ||
    path.startsWith("/api/users") ||
    path === "/api/health" ||
    path === "/" ||
    path === "/api" ||
    path.startsWith("/uploads")
  ) {
    return await next();
  }

  try {
    const maintenance = await prisma.systemSetting.findUnique({
      where: { key: "maintenance_mode" }
    });

    if (maintenance?.value === "true") {
      return c.json({
        success: false,
        error: "系统正在维护中，请稍后再试。",
        maintenance: true
      }, 503);
    }
  } catch (error) {
    console.error("Maintenance check error:", error);
  }

  await next();
});

// --- Routes ---
app.route("/api", healthRoutes);
app.route("/api", skillRoutes);
app.route("/api", categoryRoutes);
app.route("/api/posts", postRoutes);
app.route("/api/comments", commentRoutes);
app.route("/api/upload", uploadRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/settings", settingRoutes);
app.route("/api/admin/audit-logs", auditRoutes);
app.route("/api/users", userRoutes);

// Serve static files from public/uploads
app.use("/uploads/*", serveStatic({ root: "./public" }));



// --- Swagger Documentation ---
app.get("/doc", swaggerUI({ url: "/api/doc" }));
app.get("/api/doc", (c) => {
  return c.json({
    openapi: "3.0.0",
    info: { title: "Skill-Share API", version: "0.1.0" },
    paths: {
      "/api/skills": {
        get: {
          summary: "获取技能列表",
          responses: { 200: { description: "成功返回技能列表" } },
        },
      },
      "/api/categories": {
        get: {
          summary: "获取分类列表",
          responses: { 200: { description: "成功返回分类列表" } },
        },
      },
    },
  });
});


// --- Root ---
app.get("/", (c) => {
  return c.json({
    name: "Skill-Share API",
    version: "0.1.0",
    status: "running",
  });
});

// --- Start Server ---
const port = Number(process.env.PORT) || 4000;

console.log(`🚀 Skill-Share API running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
