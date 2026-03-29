"use client";

import { use, Suspense, useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar, User, ArrowLeft, Share2, MessageSquare } from "lucide-react";
import { fetcher } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  publishedAt: string;
  author: {
    name: string;
    avatar: string;
  };
  tags: { name: string; slug: string }[];
}

function PostContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: post, isLoading, error } = useSWR<Post>(`/posts/${slug}`, fetcher);

  // Reading progress state
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      if (height > 0) {
        setProgress((scrolled / height) * 100);
      }
    };
    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          <Skeleton className="h-12 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="aspect-video w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
          <User className="h-10 w-10 text-muted-foreground/30" />
        </div>
        <h2 className="text-3xl font-bold mb-4">文章未找到</h2>
        <p className="text-muted-foreground mb-8 text-lg">抱歉，您访问的文章可能已被删除或移至他处。</p>
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/blog">返回探索更多</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-muted/30">
        <div 
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article className="pb-24">
        {/* Post Hero */}
        <header className="relative py-16 md:py-24 overflow-hidden bg-muted/10 border-b">
          <div className="container mx-auto px-6 max-w-4xl relative z-10">
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-10 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> 返回博客列表
            </Link>

            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <Badge key={tag.slug} variant="secondary" className="bg-primary/5 text-primary border-none px-4 py-1">
                  #{tag.name}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-10 leading-[1.15]">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-8 py-8 border-t border-border/50">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-lg leading-none mb-1">{post.author.name}</p>
                  <p className="text-sm text-muted-foreground">Skill-Share 认证专家</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground ml-auto sm:ml-0">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.publishedAt), "yyyy年MM月dd日", { locale: zhCN })}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <MessageSquare className="h-4 w-4" />
                  约 5 分钟阅读
                </span>
              </div>

              <div className="hidden md:flex items-center gap-2 ml-auto">
                <Button variant="outline" size="icon" className="rounded-full shadow-sm hover:bg-primary/5 hover:text-primary transition-all">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Post Cover Image */}
        {!!post.coverImage && (
          <div className="container mx-auto px-6 max-w-5xl -mt-12 md:-mt-16 mb-16">
            <div className="aspect-[21/9] relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-background bg-muted">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Post Content */}
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="prose dark:prose-invert prose-lg max-w-none 
            prose-headings:font-extrabold prose-headings:tracking-tight
            prose-p:leading-relaxed prose-p:text-foreground/80
            prose-a:text-primary prose-a:font-semibold hover:prose-a:underline
            prose-img:rounded-3xl prose-img:shadow-lg prose-img:border
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic
            prose-pre:bg-muted/50 prose-pre:border prose-pre:rounded-2xl prose-pre:p-6
            prose-strong:text-foreground prose-strong:font-bold
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          <footer className="mt-20 pt-16 border-t border-border/50">
            <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-[2.5rem] p-10 md:p-16 text-center border overflow-hidden relative">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] z-0" />
              
              <div className="relative z-10">
                <h3 className="text-3xl font-extrabold mb-4">对这个话题感兴趣？</h3>
                <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                  在 Skill-Share 社区，你可以与更多在这个领域的专家进行深度交流，并获取更多实战技能资源。
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild size="lg" className="rounded-full px-10 h-14 text-base shadow-lg shadow-primary/20">
                    <Link href="/community">加入专家社区</Link>
                  </Button>
                  <Button variant="outline" asChild size="lg" className="rounded-full px-10 h-14 text-base bg-background/50 backdrop-blur-sm">
                    <Link href="/">浏览相关技能</Link>
                  </Button>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </article>
    </div>
  );
}

export default function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-24 text-center">正在加载文章...</div>}>
      <PostContent params={params} />
    </Suspense>
  );
}
