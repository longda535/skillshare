import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Suspense } from "react";
import { MaintenanceGuard } from "@/components/layout/MaintenanceGuard";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });


export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/settings`, {
      next: { revalidate: 3600 } // 每小时刷新一次缓存
    });
    const data = await res.json();
    const settings = data.data || {};
    
    return {
      title: settings.site_name ? `${settings.site_name} | 发现与掌握 AI 生产力` : "Skill-Share | 发现与掌握 AI 生产力",
      description: settings.site_description || "高质量 AI 提示词、工作流模板与教程资源库",
      keywords: settings.seo_keywords || "AI, Prompt, 技能分享",
    };
  } catch (error) {
    return {
      title: "Skill-Share | 发现与掌握 AI 生产力",
      description: "高质量 AI 提示词、工作流模板与教程资源库",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  
  // 检查维护模式 (仅针对非管理员用户)
  let isMaintenance = false;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/settings`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3000) // 3秒超时
    });
    if (res.ok) {
      const data = await res.json();
      isMaintenance = data.data?.maintenance_mode === "true";
    }
  } catch (e) {
    console.warn("Maintenance check bypassed due to API error:", e);
  }

  const showMaintenance = isMaintenance && session?.user?.role !== "ADMIN";

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <Script id="theme-loader" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var theme = localStorage.getItem('theme') || 'system';
                var root = document.documentElement;
                if (theme === 'system') {
                  var dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  root.classList.add(dark ? 'dark' : 'light');
                } else {
                  root.classList.add(theme);
                }
              } catch (e) {}
            })();
          `}
        </Script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider
            defaultTheme="system"
            storageKey="theme"
          >
            <div className="relative flex min-h-screen flex-col" suppressHydrationWarning>
              <Suspense fallback={<div className="h-16 border-b bg-background" />}>
                <Navbar />
              </Suspense>
              <main className="flex-1 flex flex-col">
                <MaintenanceGuard isMaintenance={isMaintenance} userRole={session?.user?.role}>
                  {children}
                </MaintenanceGuard>
              </main>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
