import { MiddlewareHandler } from "hono";

/**
 * 基础用户身份校验中间件
 * 在生产环境下，此中间件应校验 JWT Token。
 * 在当前开发模式下，我们通过 Header (x-user-id) 进行模拟。
 */
export const userAuth = (): MiddlewareHandler => {
  return async (c, next) => {
    const userId = c.req.header("x-user-id");
    
    if (!userId) {
      return c.json({
        success: false,
        error: "Unauthorized: 请先登录"
      }, 401);
    }

    // 校验通过
    await next();
  };
};
