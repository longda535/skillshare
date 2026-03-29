"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2, 
  ExternalLink,
  Search,
  Filter
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function AdminBlogPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/blog");
    }
  }, [status, router]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/posts/admin`, {
        headers: {
          "x-user-role": session?.user?.role || ""
        }
      });
      if (!response.ok) throw new Error("无法获取文章列表");
      const data = await response.json();
      setPosts(data.data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchPosts();
    }
  }, [status]);

  const toggleVisibility = async (post: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/posts/${post.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "x-user-role": session?.user?.role || ""
        },
        body: JSON.stringify({ isPublished: !post.isPublished }),
      });

      if (!response.ok) throw new Error("状态更改失败");
      
      toast.success(post.isPublished ? "文章已隐藏" : "文章已发布");
      fetchPosts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("确定要永久删除这篇文章吗？此操作不可撤销。")) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/posts/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-role": session?.user?.role || ""
        }
      });

      if (!response.ok) throw new Error("删除失败");
      
      toast.success("文章已成功删除");
      setPosts(posts.filter(p => p.id !== id));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading" || (loading && posts.length === 0)) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">博客管理面板</h1>
          <p className="text-muted-foreground mt-1">管理、编辑和发布社区内容</p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> 撰写新文章
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="搜索文章标题或作者..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> 筛选
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[400px]">文章标题</TableHead>
              <TableHead>作者</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建日期</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <TableRow key={post.id} className="group transition-colors hover:bg-muted/30">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-base line-clamp-1">{post.title}</span>
                      <span className="text-xs text-muted-foreground font-mono mt-0.5">/{post.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">
                        {post.author?.name.charAt(0)}
                      </div>
                      <span className="text-sm">{post.author?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.isPublished ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1">
                        <Eye className="h-3 w-3" /> 已发布
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <EyeOff className="h-3 w-3" /> 草稿
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(post.createdAt), "yyyy-MM-dd", { locale: zhCN })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel>文章操作</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(`/admin/blog/${post.id}/edit`)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>编辑内容</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleVisibility(post)}>
                          {post.isPublished ? (
                            <><EyeOff className="mr-2 h-4 w-4" /><span>改为草稿</span></>
                          ) : (
                            <><Eye className="mr-2 h-4 w-4" /><span>立即发布</span></>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            <span>前往预览</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => deletePost(post.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>永久删除</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                  没有找到匹配的文章。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
