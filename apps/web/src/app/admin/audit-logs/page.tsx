"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import { 
  History, 
  User as UserIcon, 
  Calendar, 
  Info, 
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const ACTION_MAP: Record<string, { label: string, color: string }> = {
  "UPDATE_USER_ROLE": { label: "角色变更", color: "bg-blue-500/10 text-blue-500" },
  "UPDATE_USER_STATUS": { label: "状态变更", color: "bg-orange-500/10 text-orange-500" },
  "DELETE_USER": { label: "删除用户", color: "bg-red-500/10 text-red-500" },
  "UPDATE_SYSTEM_SETTING": { label: "系统配置", color: "bg-purple-500/10 text-purple-500" },
  "PUBLISH_BLOG_POST": { label: "发布文章", color: "bg-green-500/10 text-green-500" },
  "UNPUBLISH_BLOG_POST": { label: "撤回文章", color: "bg-yellow-500/10 text-yellow-500" },
  "DELETE_BLOG_POST": { label: "删除文章", color: "bg-red-500/10 text-red-500" },
};

export default function AuditLogsPage() {
  const { data: session } = useSession();
  const { data: result, isLoading } = useSWR(
    session?.user?.role === "ADMIN" ? `${API_BASE}/admin/audit-logs` : null,
    (url: string) => fetch(url, {
      headers: { 
        "x-user-role": session?.user?.role || "",
        "x-user-id": session?.user?.id || "" 
      }
    }).then(res => res.json())
  );

  const logs = result?.data || [];

  const renderDetails = (detailsStr: string) => {
    try {
      const details = JSON.parse(detailsStr);
      if (details.before && details.after) {
        return (
          <div className="flex flex-col gap-1 text-[10px]">
            <div className="flex items-center gap-1 opacity-60">
              <Badge variant="outline" className="scale-75 origin-left">OLD</Badge>
              <span className="truncate max-w-[200px]">{JSON.stringify(details.before)}</span>
            </div>
            <ArrowRight className="h-3 w-3 rotate-90 mx-auto opacity-30" />
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="scale-75 origin-left">NEW</Badge>
              <span className="truncate max-w-[200px] font-medium text-primary">{JSON.stringify(details.after)}</span>
            </div>
          </div>
        );
      }
      return <span className="text-xs opacity-60">{detailsStr}</span>;
    } catch {
      return <span className="text-xs opacity-60">{detailsStr}</span>;
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <History className="h-8 w-8 text-primary" /> 操作审计日志
          </h1>
          <p className="text-muted-foreground font-medium">全量追踪管理员在系统中的行为记录。</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="搜索日志..." 
              className="pl-9 bg-background/50 border-border/50 rounded-xl"
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-xl border-border/50">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="border-border/50 bg-background/50 backdrop-blur-md shadow-2xl shadow-primary/5 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> 日志全览
          </CardTitle>
          <CardDescription>按时间倒序展示系统最近发生的敏感操作。</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[180px] font-bold">操作人</TableHead>
                <TableHead className="w-[120px] font-bold">行为</TableHead>
                <TableHead className="font-bold">操作详情</TableHead>
                <TableHead className="w-[120px] font-bold">IP 地址</TableHead>
                <TableHead className="w-[180px] font-bold">发生时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-32 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-12 w-full rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground font-medium italic">
                    暂无操作记录。
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: any) => (
                  <TableRow key={log.id} className="hover:bg-muted/30 border-border/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-border/50">
                          <AvatarImage src={log.user?.avatar} />
                          <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black uppercase">
                            {log.user?.name?.charAt(0) || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs truncate max-w-[100px]">{log.user?.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{log.user?.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`font-bold border-none ${ACTION_MAP[log.action]?.color || 'bg-muted'}`}>
                        {ACTION_MAP[log.action]?.label || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.details ? renderDetails(log.details) : <span className="text-xs opacity-40">-</span>}
                    </TableCell>
                    <TableCell>
                      <code className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-medium">
                        {log.ip || "Unknown"}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold">
                          {format(new Date(log.createdAt), "yyyy-MM-dd", { locale: zhCN })}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {format(new Date(log.createdAt), "HH:mm:ss", { locale: zhCN })}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
