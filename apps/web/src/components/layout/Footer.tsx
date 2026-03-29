"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function Footer() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: settingsData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/settings`,
    fetcher
  );

  const siteName = (mounted && settingsData?.data?.site_name) || "Skill-Share";
  const footerText = (mounted && settingsData?.data?.footer_text) || `© ${new Date().getFullYear()} Skill-Share. 保留所有权利。`;

  return (
    <footer className="border-t bg-background/95 mt-16 pb-8 pt-8 md:pt-16">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              {siteName}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              高质量的 AI 技能与知识分享平台。探索、学习并掌握最新的人工智能生产力工具与技术分享。
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold tracking-wide">导航</h4>
            <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">技能大厅</Link>
              <Link href="/blog" className="hover:text-foreground transition-colors">专家博客</Link>
              <Link href="/community" className="hover:text-foreground transition-colors">交流社区</Link>
              <Link href="/about" className="hover:text-foreground transition-colors">关于我们</Link>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-semibold tracking-wide">联系与支持</h4>
            <div className="flex space-x-4 text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
            {/* Optional QR Code Area */}
            <div className="mt-4 p-4 border rounded-lg bg-muted/30 max-w-[150px] aspect-square flex items-center justify-center text-xs text-muted-foreground text-center">
              [公众号二维码]
            </div>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>{footerText}</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-foreground transition-colors">隐私政策</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">服务条款</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
