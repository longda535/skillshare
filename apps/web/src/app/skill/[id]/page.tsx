"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, Download, Eye, Share2, Star, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetcher } from "@/lib/api";
import type { Skill, Comment } from "@skill-share/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { AIAssistant } from "@/components/shared/AIAssistant";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

// --- 子组件: 相关技能 ---
function RelatedSkills({ categoryId, currentSkillId }: { categoryId: string, currentSkillId: string }) {
  const { data: skills } = useSWR<Skill[]>(`/skills?category=${categoryId}`, fetcher);
  const related = skills?.filter(s => s.id !== currentSkillId).slice(0, 4) || [];

  if (related.length === 0) return null;

  return (
    <div className="pt-12 border-t mt-12">
      <h3 className="text-xl font-bold mb-6">为你推荐</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {related.map(skill => (
          <Link key={skill.id} href={`/skill/${skill.id}`} className="group space-y-3">
            <div className="relative aspect-video rounded-lg overflow-hidden border">
              <Image 
                src={skill.coverImage || "https://placehold.co/600x400?text=No+Image"} 
                alt={skill.title} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {skill.title}
            </h4>
          </Link>
        ))}
      </div>
    </div>
  );
}

// --- 子组件: 评论区 ---
function CommentsSection({ skillId }: { skillId: string }) {
  const { data: comments, mutate } = useSWR<{ data: Comment[] }>(`/comments?skillId=${skillId}`, fetcher);
  const [newComment, setNewComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment, skillId }),
      });
      if (res.ok) {
        setNewComment("");
        mutate();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const commentList = comments?.data || [];

  return (
    <div className="pt-12 border-t mt-12 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          社区评价 <Badge variant="secondary">{commentList.length}</Badge>
        </h3>
      </div>

      {/* 发表评论 */}
      <div className="flex gap-4">
        <Avatar className="w-10 h-10 border">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <Textarea 
            placeholder="分享你的见解或提问..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] rounded-xl resize-none focus-visible:ring-primary"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !newComment.trim()}
              className="px-6"
            >
              提交评论
            </Button>
          </div>
        </div>
      </div>

      {/* 评论列表 */}
      <div className="space-y-6 pt-4">
        {commentList.length > 0 ? (
          commentList.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <Avatar className="w-10 h-10 border mt-1">
                <AvatarImage src={comment.user?.avatar || undefined} />
                <AvatarFallback>{comment.user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{comment.user?.name || "用户"}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {comment.content}
                </p>
                <div className="flex items-center gap-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:text-primary">
                    回复
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:text-primary">
                    赞同
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
            暂无评价，快来成为第一个评论的人吧！
          </div>
        )}
      </div>
    </div>
  );
}

export default function SkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  
  const { data: skill, isLoading, error } = useSWR<Skill>(`/skills/${id}`, fetcher);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-8 space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">技能未找到</h2>
        <p className="text-muted-foreground mb-8">抱歉，您访问的技能资源可能已被删除或不存在。</p>
        <Button asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 md:px-12 lg:px-20 py-8">
      {/* Breadcrumb & Back */}
      <div className="mb-6 flex items-center text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground flex items-center transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回大厅
        </Link>
        <span className="mx-2">/</span>
        <span className="hover:text-foreground cursor-pointer transition-colors">{skill.category?.name}</span>
        <span className="mx-2">/</span>
        <span className="truncate max-w-[200px] text-foreground font-medium">{skill.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Info */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              {skill.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {skill.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
              <div className="flex items-center">
                {!!skill.author?.avatar && (
                  <img 
                    src={skill.author.avatar} 
                    alt={skill.author.name || ""}
                    className="w-6 h-6 rounded-full mr-2 border bg-muted"
                  />
                )}
                <span className="font-medium text-foreground">{skill.author?.name || "未知作者"}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                {new Date(skill.updatedAt).toLocaleDateString()} 更新
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1.5" />
                {skill.viewCount} 次浏览
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border bg-muted">
            {!!skill.coverImage && (
              <Image
                src={skill.coverImage}
                alt={skill.title}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>

          {/* Content (Render as paragraphs for now) */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {skill.content ? skill.content.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            )) : <p>暂无详细内容</p>}
          </div>

          {/* Tags */}
          {skill.tags && skill.tags.length > 0 && (
            <div className="pt-6 border-t font-sans">
              <h3 className="text-sm font-semibold mb-3 font-sans">相关标签</h3>
              <div className="flex flex-wrap gap-2">
                {skill.tags.map(tag => (
                  <Badge key={tag.id} variant="secondary" className="px-3 py-1 text-sm font-normal">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Related Skills */}
          <RelatedSkills categoryId={skill.categoryId} currentSkillId={skill.id} />

          {/* Comments Section */}
          <CommentsSection skillId={skill.id} />
        </div>

        {/* Right Column: Sticky Sidebar actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card className="shadow-lg border-primary/10">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">价格</div>
                  <div className="text-3xl font-extrabold text-primary flex items-baseline gap-1">
                    {skill.price === 0 ? "免费" : `¥${skill.price.toFixed(2)}`}
                    {skill.price > 0 && <span className="text-sm text-muted-foreground font-normal line-through ml-2">¥{(skill.price * 1.5).toFixed(2)}</span>}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button size="lg" className="w-full text-base h-12 shadow-md">
                    <Download className="mr-2 h-5 w-5" />
                    立即获取资源
                  </Button>
                  <Button variant="outline" size="lg" className="w-full h-12">
                    <Share2 className="mr-2 h-4 w-4" />
                    分享给朋友
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    购买后永久有效
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    支持免费更新
                  </div>
                  <div className="flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    已有 {skill.downloadCount}+ 人下载
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                    4.9/5 星级评价
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Author Card Mini */}
            {skill.author && (
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <img 
                    src={skill.author.avatar || undefined} 
                    alt={skill.author.name || ""} 
                    className="w-16 h-16 rounded-full mb-3 border bg-muted"
                  />
                  <h4 className="font-semibold">{skill.author.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 px-4">
                    资深创作者，致力于分享高质量 AI 技能。
                  </p>
                  <Button variant="ghost" size="sm" className="mt-4 w-full text-primary">
                    查看主页
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

