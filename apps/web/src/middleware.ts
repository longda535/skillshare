import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin");

    if (isAdminPage) {
      if (!isAuth) {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
      
      // 增加角色判定逻辑
      if (token?.role !== "ADMIN") {
        console.warn(`[Security] 拦截到非管理员 (${token?.email}) 尝试访问管理路径: ${req.nextUrl.pathname}`);
        return NextResponse.redirect(new URL("/", req.url)); // 或者跳转至 403 页面
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
