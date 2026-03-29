import { MiddlewareHandler } from "hono";

/**
 * 核心行政管理权限校验中间件
 * 在生产环境下，此中间件应校验 JWT Token 或由网关透传的身份信息。
 * 在当前开发模式下，我们通过 Header 进行模拟校验以演示 RBAC 逻辑。
 */
export const adminAuth = (): MiddlewareHandler => {
  return async (c, next) => {
    // 1. 获取请求头中的角色信息 (由 Web 端前端或 Middleware 透传)
    const userRole = c.req.header("x-user-role");
    
    // 2. 严格校验管理员权限
    if (userRole !== "ADMIN") {
      console.warn(`[Security] 拦截到非管理员访问请求: ${c.req.path}`);
      return c.json({
        success: false,
        error: "Forbidden: 权限不足，仅管理员可访问此接口"
      }, 403);
    }

    // 3. 校验通过，继续后续流程
    await next();
  };
};
