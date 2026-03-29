"use client";

import { MessageCircle, Users, Zap, ExternalLink, Heart, MessageSquare, Share2, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function CommunityPage() {
  const feedItems = [
    {
      id: 1,
      user: { name: "AI 艺术家", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Art", role: "Expert" },
      content: "刚刚发布了针对 Midjourney v6 的光影控制提示词包，欢迎大家尝试并给出反馈！",
      likes: 42,
      comments: 12,
      time: "10分钟前",
      tag: "资源分享"
    },
    {
      id: 2,
      user: { name: "全栈开发者", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev", role: "Contributor" },
      content: "Cursor 的 Cline 插件实在是太强大了，配合合适的规则文件，编码速度提升了不仅一个量级。有人想看配置教程吗？",
      likes: 89,
      comments: 34,
      time: "1小时前",
      tag: "技术探讨"
    },
    {
      id: 3,
      user: { name: "提示词工程师", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Prompt", role: "Member" },
      content: "请教大家，如何在 Claude 3.5 中更精准地控制代码重构的输出格式？",
      likes: 15,
      comments: 28,
      time: "3小时前",
      tag: "求助问答"
    }
  ];

  return (
    <div className="container mx-auto px-6 md:px-12 lg:px-20 py-12 md:py-20 max-w-7xl flex-1 space-y-20">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="px-4 py-1 border-primary/20 text-primary">官方交流社区</Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">与 10,000+ AI 探索者同行</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          这里是 Skill-Share 的核心枢纽。获取每日灵感、解决技术难题、分享你的 AI 创作。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" /> 社区动态
            </h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              查看全部 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-4">
            {feedItems.map((item) => (
              <Card key={item.id} className="hover:border-primary/20 transition-colors">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Avatar className="w-12 h-12 border">
                      <AvatarImage src={item.user.avatar} />
                      <AvatarFallback>{item.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base">{item.user.name}</span>
                          {item.user.role === "Expert" && (
                            <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none px-1.5 py-0">
                               <Award className="w-3 h-3 mr-1" /> 专家
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">• {item.time}</span>
                        </div>
                        <Badge variant="secondary" className="font-normal text-xs">{item.tag}</Badge>
                      </div>
                      <p className="text-foreground/90 leading-relaxed">
                        {item.content}
                      </p>
                      <div className="flex items-center gap-6 pt-2">
                        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Heart className="w-4 h-4" /> {item.likes}
                        </button>
                        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <MessageSquare className="w-4 h-4" /> {item.comments}
                        </button>
                        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors ml-auto">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Channels */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold mb-2">交流通道</h2>
          
          <div className="grid grid-cols-1 gap-6">
            {/* WeChat */}
            <Card className="group relative overflow-hidden hover:shadow-lg transition-all border-green-500/10">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">微信交流群</CardTitle>
                  <CardDescription className="text-xs">即时解答交流</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-square bg-muted/30 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer border border-dashed">
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm opacity-100 group-hover:opacity-0 transition-all duration-500 z-10 p-6 text-center">
                    <MessageCircle className="w-8 h-8 text-green-500 mb-3" />
                    <span className="font-bold text-sm">扫码加入微信群</span>
                    <span className="text-[10px] text-muted-foreground mt-2">点击或悬停显示二维码</span>
                  </div>
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SkillShareWechat" 
                    alt="WeChat QR"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Other Channels */}
            <div className="space-y-4">
              <Card className="p-4 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">QQ 官方大群</div>
                    <div className="text-[10px] text-muted-foreground">群号：88888888</div>
                  </div>
                  <Button size="sm" variant="outline">加入</Button>
                </div>
              </Card>

              <Card className="p-4 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">精华知识库</div>
                    <div className="text-[10px] text-muted-foreground">沉淀 FAQ 与资源</div>
                  </div>
                  <Button size="sm" variant="outline">访问</Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);
