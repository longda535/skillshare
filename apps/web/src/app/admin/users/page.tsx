"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { 
  Users, 
  Shield, 
  User as UserIcon, 
  Lock, 
  Unlock, 
  Trash2, 
  MoreVertical,
  Search,
  Mail,
  Calendar,
  FileText,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();
  const { data: result, error, isLoading, mutate } = useSWR(
    session?.user?.role === "ADMIN" ? `${API_BASE}/admin/users` : null, 
    (url: string) => fetch(url, {
      headers: { 
        "x-user-role": session?.user?.role || "",
        "x-user-id": session?.user?.id || ""
      }
    }).then(res => res.json())
  );
  
  const users = result?.data || [];

  const handleUpdateUser = async (userId: string, data: any) => {
    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "x-user-role": session?.user?.role || "",
          "x-user-id": session?.user?.id || ""
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Update failed");
      
      toast.success("用户信息已更新");
      mutate();
    } catch (err) {
      toast.error("更新失败，请重试");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("确定要删除该用户吗？此操作不可逆。")) return;

    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { 
          "x-user-role": session?.user?.role || "",
          "x-user-id": session?.user?.id || ""
        },
      });

      if (!response.ok) throw new Error("Delete failed");
      
      toast.success("用户已删除");
      mutate();
    } catch (err) {
      toast.error("删除失败，请重试");
    }
  };

  const filteredUsers = users.filter((user: any) => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">用户管理</h1>
          <p className="text-muted-foreground font-medium">全方位监控与维护社区成员状态及权限。</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="搜索姓名或邮箱..." 
            className="pl-10 rounded-full border-primary/20 bg-background/50 backdrop-blur-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-border/50 rounded-2xl overflow-hidden bg-background/40 backdrop-blur-md shadow-xl">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="py-5 px-6 font-bold text-muted-foreground">用户</TableHead>
              <TableHead className="py-5 font-bold text-muted-foreground">角色</TableHead>
              <TableHead className="py-5 font-bold text-muted-foreground">状态</TableHead>
              <TableHead className="py-5 font-bold text-muted-foreground">活跃度</TableHead>
              <TableHead className="py-5 font-bold text-muted-foreground">注册日期</TableHead>
              <TableHead className="py-5 pr-6 text-right font-bold text-muted-foreground">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6 py-4"><Skeleton className="h-12 w-48 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-lg" /></TableCell>
                  <TableCell className="pr-6"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center text-muted-foreground italic">
                  未发现匹配的用户记录
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user: any) => (
                <TableRow key={user.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border-2 border-primary/10 group-hover:border-primary/30 transition-all">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                          {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight">{user.name || "未设置姓名"}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.role === "ADMIN" ? "secondary" : "outline"}
                      className={user.role === "ADMIN" ? "bg-indigo-500/10 text-indigo-500 border-none px-3 font-bold" : "px-3 font-medium opacity-70"}
                    >
                      {user.role === "ADMIN" ? (
                        <span className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> 管理员</span>
                      ) : (
                        <span className="flex items-center gap-1.5"><UserIcon className="h-3 w-3" /> 普通用户</span>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.status === "ACTIVE" ? "secondary" : "outline"}
                      className={user.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500 border-none px-3 font-bold" : "bg-rose-500/10 text-rose-500 border-none px-3 font-bold"}
                    >
                      {user.status === "ACTIVE" ? (
                        <span className="flex items-center gap-1.5"><Unlock className="h-3 w-3" /> 正常</span>
                      ) : (
                        <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> 已锁定</span>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold">{user._count?.posts || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold">{user._count?.comments || 0}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 opacity-60" />
                      {format(new Date(user.createdAt), "yyyy-MM-dd")}
                    </div>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl border-primary/20 shadow-2xl">
                        <DropdownMenuLabel className="text-xs font-bold opacity-50 px-2 py-1.5 uppercase tracking-widest">权限操作</DropdownMenuLabel>
                        <DropdownMenuItem 
                          className="rounded-lg gap-2 cursor-pointer font-medium"
                          onClick={() => handleUpdateUser(user.id, { role: user.role === "ADMIN" ? "USER" : "ADMIN" })}
                        >
                          <Shield className="h-4 w-4" /> 设为{user.role === "ADMIN" ? "用户" : "管理员"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="rounded-lg gap-2 cursor-pointer font-medium text-amber-500 focus:text-amber-500"
                          onClick={() => handleUpdateUser(user.id, { status: user.status === "ACTIVE" ? "BANNED" : "ACTIVE" })}
                        >
                          {user.status === "ACTIVE" ? (
                            <><Lock className="h-4 w-4" /> 锁定账号</>
                          ) : (
                            <><Unlock className="h-4 w-4" /> 解消锁定</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-primary/5" />
                        <DropdownMenuItem 
                          className="rounded-lg gap-2 cursor-pointer font-medium text-rose-500 focus:text-rose-500"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" /> 删除账号
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
