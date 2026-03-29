"use client";

import { Suspense } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";

import { zhCN } from "date-fns/locale";
import { Calendar, User, ArrowRight, Tag as TagIcon } from "lucide-react";
import { fetcher } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  author: {
    name: string;
    avatar: string;
  };
  tags: { name: string; slug: string }[];
}

function BlogListContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  
  const postsUrl = `/posts?search=${searchQuery}`;
  const { data: posts, isLoading, error } = useSWR<Post[]>(postsUrl, fetcher);



  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden border-b bg-muted/20">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-primary/40 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-blue-500/40 rounded-full blur-[120px]" />
        </div>
        
        <div className="container relative z-10 mx-auto px-6 md:px-12 lg:px-20 text-center">
          <Badge variant="outline" className="mb-4 py-1 px-4 rounded-full bg-background/50 backdrop-blur-sm border-primary/20 text-primary">
            知识共享 · 灵感触达
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            专家博客 & 行业洞察
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            深入探索 AI 领域的最新实战技巧、行业趋势，与全球开发者共同成长。
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 md:px-12 lg:px-20 py-16">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-24 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 mb-6">
                !
              </div>
              <p className="text-muted-foreground">加载博客内容失败，请检查后端服务。</p>
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {posts.map((post) => (
                <Link 
                  key={post.id} 
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col h-full bg-card border border-border/50 rounded-3xl overflow-hidden hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                    {post.coverImage ? (
                      <img 
                        src={post.coverImage} 
                        alt={post.title}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20">
                        <User className="h-12 w-12 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                      <span className="text-white text-sm font-medium flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        立即阅读 <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-8 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      {post.tags.slice(0, 1).map(tag => (
                        <Badge key={tag.slug} variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 border-none px-3">
                          {tag.name}
                        </Badge>
                      ))}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.publishedAt && format(new Date(post.publishedAt), "MM月dd日", { locale: zhCN })}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-bold mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    
                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mb-6">
                      {post.excerpt}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 border">
                          <AvatarImage src={post.author.avatar} alt={post.author.name} />
                          <AvatarFallback className="text-[10px]">{post.author.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{post.author.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <TagIcon className="h-3 w-3" />
                        {post.tags.length} 标签
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground italic">目前还没有发布任何内容</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-24 text-center">正在加载博客...</div>}>
      <BlogListContent />
    </Suspense>
  );
}
