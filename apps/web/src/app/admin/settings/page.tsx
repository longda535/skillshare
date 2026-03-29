"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Save, Loader2, Globe, Shield, Layout, Search, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const { data, error, mutate, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/settings`,
    fetcher
  );

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data?.data) {
      setFormData(data.data);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/settings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": session?.user?.role || "",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("保存失败");

      toast.success("系统设置已更新");
      mutate(); // 重新加载数据
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">系统全局设置</h1>
        <p className="text-muted-foreground text-lg">
          配置站点的全局显示内容、SEO 信息及维护状态。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* 基础信息 */}
          <Card className="overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-primary/5 pb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>站点基础信息</CardTitle>
                  <CardDescription>定义网站的公开名称与基本描述</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">网站名称 (site_name)</label>
                <Input 
                  name="site_name" 
                  value={formData.site_name || ""} 
                  onChange={handleChange}
                  placeholder="例如: Skill-Share"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">网站描述 (site_description)</label>
                <Textarea 
                  name="site_description" 
                  value={formData.site_description || ""} 
                  onChange={handleChange}
                  placeholder="例如: 领先的 AI 技能分享与资源交易平台"
                  className="min-h-[100px] resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO 设置 */}
          <Card className="overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-primary/5 pb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>SEO 优化 (元数据)</CardTitle>
                  <CardDescription>配置搜索引擎抓取所需的关键词与描述</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">SEO 关键词 (seo_keywords)</label>
                <Input 
                  name="seo_keywords" 
                  value={formData.seo_keywords || ""} 
                  onChange={handleChange}
                  placeholder="用逗号隔开，例如: AI, 提示词, 教程"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">关键词将帮助您的站点在搜索引擎中获得更好的排名。</p>
              </div>
            </CardContent>
          </Card>

          {/* 页脚设置 */}
          <Card className="overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-primary/5 pb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Layout className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>页脚设置</CardTitle>
                  <CardDescription>管理页面底部显示的信息</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">页脚版权文字 (footer_text)</label>
                <Input 
                  name="footer_text" 
                  value={formData.footer_text || ""} 
                  onChange={handleChange}
                  placeholder="例如: © 2026 Skill-Share. All rights reserved."
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* 状态控制 */}
          <Card className="overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm sticky top-8">
            <CardHeader className="bg-primary/5 pb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>安全与状态</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/20">
                <div className="space-y-0.5">
                  <label className="text-sm font-semibold">维护模式</label>
                  <p className="text-xs text-muted-foreground">开启后普通用户将无法访问站点</p>
                </div>
                <input 
                  type="checkbox"
                  name="maintenance_mode"
                  checked={formData.maintenance_mode === "true"}
                  onChange={(e) => setFormData(prev => ({ ...prev, maintenance_mode: e.target.checked ? "true" : "false" }))}
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg gap-2 shadow-lg shadow-primary/20" 
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  保存更改
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-4 leading-relaxed">
                  警告: 更改全局设置可能需要刷新页面后才能完整显示。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
