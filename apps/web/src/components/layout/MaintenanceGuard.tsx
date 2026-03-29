"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface MaintenanceGuardProps {
  children: ReactNode;
  isMaintenance: boolean;
  userRole?: string;
}

export function MaintenanceGuard({ children, isMaintenance, userRole }: MaintenanceGuardProps) {
  const pathname = usePathname();
  
  // 豁免路径：登录页相关路径、管理员正在访问的路径 (如果已经登录)
  // 注意：管理员角色通过 session 判定
  const isExempt = pathname.startsWith("/auth") || userRole === "ADMIN";
  
  if (isMaintenance && !isExempt) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[60vh]">
        <div className="max-w-md space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h2 className="text-4xl font-black tracking-tight tracking-tighter">系统维护中</h2>
          <p className="text-muted-foreground font-medium text-lg">
            为了提供更好的服务，我们正在对 Skill-Share 平台进行系统维护与优化。
          </p>
          <div className="pt-4">
            <p className="text-sm font-bold text-primary/60 border border-primary/20 rounded-full px-6 py-2 inline-block bg-primary/5">
              预计恢复时间：请稍后访问
            </p>
          </div>
          <p className="text-xs text-muted-foreground opacity-50">管理员仍可通过登录后进入后台进行操作。</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
