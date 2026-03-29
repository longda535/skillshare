"use client";

import { useEffect, useState } from "react";
import { 
  FileText, 
  Users, 
  Eye, 
  TrendingUp, 
  ArrowRight,
  Plus,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import useSWR from "swr";
import { useSession } from "next-auth/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const { data: result, error, isLoading, isValidating } = useSWR(
    session?.user?.role === "ADMIN" ? `${API_BASE}/admin/stats` : null,
    (url: string) => fetch(url, {
      headers: { "x-user-role": session?.user?.role || "" }
    }).then(res => res.json()),
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  const data = result?.data;
  const loading = isLoading;

  const StatCard = ({ title, value, icon: Icon, description, color, trend }: any) => (
    <Card className="overflow-hidden border-none shadow-xl bg-background/50 backdrop-blur-sm border border-border/50 group hover:shadow-2xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <div className={`p-2.5 rounded-xl ${color} shadow-lg shadow-${color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-10 w-24 mb-2" />
        ) : (
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold tracking-tight">{value}</div>
            {trend && <span className="text-xs font-medium text-emerald-500">{trend}</span>}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2 font-medium">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">状态总览</h1>
          <p className="text-muted-foreground font-medium">欢迎回来，这是您的全站内容与互动数据概览。</p>
        </div>
        <div className="flex gap-4">
          <Link href="/" target="_blank">
            <Button variant="outline" className="rounded-full px-6 border-primary/20 hover:bg-primary/5">
              查看站点
            </Button>
          </Link>
          <Link href="/admin/blog/new">
            <Button className="rounded-full px-6 gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> 撰写文章
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="文章总数" 
          value={data?.stats.posts.total || 0} 
          icon={FileText} 
          description={`${data?.stats.posts.published || 0} 已公开发布`}
          color="bg-indigo-600"
          trend="+12%"
        />
        <StatCard 
          title="技能资源" 
          value={data?.stats.skills.total || 0} 
          icon={TrendingUp} 
          description={`${data?.stats.skills.published || 0} 篇实战指南`}
          color="bg-rose-600"
          trend="+5%"
        />
        <StatCard 
          title="社区成员" 
          value={data?.stats.users || 0} 
          icon={Users} 
          description="注册并活跃的用户"
          color="bg-amber-600"
        />
        <StatCard 
          title="累计评论" 
          value={data?.stats.comments || 0} 
          icon={MessageSquare} 
          description="社区互动的深度体现"
          color="bg-teal-600"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Activity Section */}
        <Card className="lg:col-span-2 border-none shadow-xl bg-background/40 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">最近发布的文章</CardTitle>
              <CardDescription>快速查看并编辑您近期的创作</CardDescription>
            </div>
            <Link href="/admin/blog">
              <Button variant="ghost" size="sm" className="text-primary font-bold">查看全部</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border/50">
                      <th className="pb-4 font-bold">标题</th>
                      <th className="pb-4 font-bold">状态</th>
                      <th className="pb-4 font-bold">日期</th>
                      <th className="pb-4 font-bold text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {data?.recentPosts.map((post: any) => (
                      <tr key={post.id} className="group transition-colors hover:bg-muted/30">
                        <td className="py-4 font-bold max-w-[200px] truncate">{post.title}</td>
                        <td className="py-4">
                          <Badge variant={post.isPublished ? "secondary" : "outline"} className={post.isPublished ? "bg-emerald-500/10 text-emerald-500 border-none px-3" : "px-3"}>
                            {post.isPublished ? "已发布" : "草稿"}
                          </Badge>
                        </td>
                        <td className="py-4 text-muted-foreground">
                          {format(new Date(post.createdAt), "MM-dd HH:mm")}
                        </td>
                        <td className="py-4 text-right">
                          <Button variant="ghost" size="icon" asChild className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/blog/${post.id}/edit`}><ArrowRight className="h-4 w-4" /></Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {error && (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-destructive italic">
                          加载失败，请检查网络连接或稍后重试
                        </td>
                      </tr>
                    )}
                    {!loading && !error && (!data || data.recentPosts.length === 0) && (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-muted-foreground italic">
                          暂无近期文章
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & System Info */}
        <div className="space-y-8">
          <Card className="border-none shadow-xl bg-indigo-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <CardHeader>
              <CardTitle className="text-xl font-bold">快捷入口</CardTitle>
              <CardDescription className="text-indigo-100">高频管理操作一键开启</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link href="/admin/blog">
                <Button className="w-full justify-between bg-white/10 hover:bg-white/20 border-white/10 text-white">
                  文章全生命周期管理
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button disabled variant="outline" className="w-full justify-between bg-transparent border-white/20 text-white/50">
                技能资源库管理 (即将上线)
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button disabled variant="outline" className="w-full justify-between bg-transparent border-white/20 text-white/50">
                社区评论全量审核
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-muted/20">
            <CardHeader>
              <CardTitle className="text-lg font-bold">系统版本</CardTitle>
              <CardDescription>当前运行版本 V0.1.5 (Beta)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-xs font-bold">已集成核心博客模块</p>
                    <p className="text-[10px] text-muted-foreground">完整支持 Markdown、图片上传与 SEO 优化。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-xs font-bold">权限系统稳定运行</p>
                    <p className="text-[10px] text-muted-foreground">多层中间件确保后台数据安全。</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
