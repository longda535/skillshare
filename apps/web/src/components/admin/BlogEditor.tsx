"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Tag as TagIcon, X, Eye, FileText, HelpCircle, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BlogEditorProps {
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    isPublished: boolean;
    tags?: { name: string }[];
  };
  mode: "create" | "edit";
  authorId: string;
}

export function BlogEditor({ initialData, mode, authorId }: BlogEditorProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(initialData?.tags?.map(t => t.name) || []);
  const [tagInput, setTagInput] = useState("");

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    coverImage: initialData?.coverImage || "",
    isPublished: initialData?.isPublished ?? true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      slug: name === "title" && !prev.slug && mode === "create" 
        ? value.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") 
        : prev.slug
    }));
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/upload`, {
        method: "POST",
        headers: {
          "x-user-role": session?.user?.role || ""
        },
        body: formData,
      });

      if (!response.ok) throw new Error("上传识别");
      const result = await response.json();
      return result.data.url;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("图片上传失败，请稍后重试。");
      return null;
    }
  };

  const onCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const url = await handleImageUpload(file);
      if (url) {
        setFormData(prev => ({ ...prev, coverImage: url }));
        toast.success("封面上传成功！");
      }
      setIsLoading(false);
    }
  };

  const onInlineUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const url = await handleImageUpload(file);
      if (url) {
        const imageMarkdown = `\n![${file.name}](${url})\n`;
        setFormData(prev => ({ ...prev, content: prev.content + imageMarkdown }));
        toast.success("图片已插入正文！");
      }
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = mode === "create" 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/posts`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/posts/${initialData?.id}`;
      
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-role": session?.user?.role || ""
        },
        body: JSON.stringify({
          ...formData,
          authorId,
          tags,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "提交失败");
      }

      const result = await response.json();
      toast.success(mode === "create" ? "文章发布成功！" : "文章更新成功！");
      router.push(`/blog/${result.data.slug}`);
      router.refresh();
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "由于网络或服务器错误，提交失败。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 md:px-12 lg:px-20 py-12 max-w-5xl">
      <Link 
        href="/admin/blog" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> 返回管理详情
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            {mode === "create" ? "创作新文章" : "重置文章内容"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "create" ? "分享您的见解与 AI 实战技巧给社区" : `正在编辑: ${initialData?.title}`}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>取消</Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mode === "create" ? "立即发布" : "保存修改"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>文章内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">标题</label>
                <Input 
                  name="title" 
                  placeholder="好的标题是成功的一半..." 
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="text-lg font-semibold h-12"
                />
              </div>

              <Tabs defaultValue="edit" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="edit" className="gap-2">
                    <FileText className="h-4 w-4" /> 编辑内容
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye className="h-4 w-4" /> 实时预览
                  </TabsTrigger>
                </TabsList>
                <div className="flex gap-2 mb-2 p-1 bg-muted/30 rounded-md">
                  <label className="cursor-pointer">
                    <Button type="button" variant="ghost" size="sm" className="gap-2 h-8" asChild>
                      <span>
                        <ImageIcon className="h-3.5 w-3.5" /> 插入图片
                        <input type="file" className="hidden" accept="image/*" onChange={onInlineUpload} />
                      </span>
                    </Button>
                  </label>
                </div>
                <TabsContent value="edit" className="space-y-2 mt-0">
                  <label className="text-sm font-medium sr-only">正文</label>
                  <Textarea 
                    name="content" 
                    placeholder="使用 Markdown 编写您的内容..." 
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    className="min-h-[500px] font-mono leading-relaxed resize-y"
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-0">
                  <div className="min-h-[500px] p-6 border rounded-md bg-muted/10 prose prose-neutral dark:prose-invert max-w-none overflow-y-auto">
                    {formData.content ? (
                      <ReactMarkdown>{formData.content}</ReactMarkdown>
                    ) : (
                      <div className="text-muted-foreground italic h-full flex items-center justify-center py-20">
                        暂无预览内容
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>发布设置</CardTitle>
              <CardDescription>配置文章的基本元数据</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <span className="text-muted-foreground font-mono">/</span> 别名 (Slug)
                    <div className="group relative">
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-popover text-popover-foreground text-xs rounded-xl shadow-xl border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed">
                        <p className="font-bold mb-1">什么是别名 (Slug)？</p>
                        Slug 是文章在 URL 中的唯一标识。好的别名应简短且包含关键词（如：<code className="bg-muted px-1 rounded">ai-tips</code>），这能显著提升搜索引擎 (SEO) 排名并让链接更易读。
                      </div>
                    </div>
                  </label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-primary"
                    onClick={() => {
                      const newSlug = formData.title.toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^\w-]/g, "");
                      setFormData(prev => ({ ...prev, slug: newSlug }));
                      toast.success("已根据标题重新生成别名");
                    }}
                  >
                    <RefreshCcw className="h-3 w-3" /> 重新生成
                  </Button>
                </div>
                <Input 
                  name="slug" 
                  placeholder="例如: how-to-use-ai" 
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" /> 封面图 URL
                </label>
                <div className="flex gap-2">
                  <Input 
                    name="coverImage" 
                    placeholder="https://images.unsplash.com/..." 
                    value={formData.coverImage}
                    onChange={handleInputChange}
                    className="flex-1"
                  />
                  <label className="cursor-pointer">
                    <Button type="button" variant="secondary" size="icon" className="shrink-0" asChild>
                      <span>
                        <ImageIcon className="h-4 w-4" />
                        <input type="file" className="hidden" accept="image/*" onChange={onCoverUpload} />
                      </span>
                    </Button>
                  </label>
                </div>
                {formData.coverImage && (
                  <div className="mt-2 aspect-video relative rounded-lg overflow-hidden border bg-muted">
                    <img 
                      src={formData.coverImage} 
                      alt="Preview" 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+URL';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">摘要 (Excerpt)</label>
                <Textarea 
                  name="excerpt" 
                  placeholder="简述文章核心内容，用于列表展示..." 
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  className="h-24 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <TagIcon className="h-4 w-4 text-muted-foreground" /> 标签
                </label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="添加标签..." 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="secondary" onClick={addTag}>添加</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="pl-2 pr-1 gap-1">
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => removeTag(tag)}
                        className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" /> 
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <label className="text-sm font-medium">公开可见</label>
                <input 
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
