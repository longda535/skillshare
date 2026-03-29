import { Mail, MapPin, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-24 max-w-4xl flex-1">
      <div className="space-y-12">
        {/* Header Section */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">关于 Skill-Share</h1>
          <p className="text-xl text-muted-foreground mx-auto max-w-2xl">
            连接 AI 创作者与学习者的桥梁，让知识创造更多价值。
          </p>
        </section>

        {/* Content Section */}
        <section className="prose prose-neutral dark:prose-invert max-w-none prose-lg">
          <h2>我们的愿景</h2>
          <p>
            在人工智能技术飞速发展的今天，掌握工具的使用往往比工具本身更重要。
            <strong>Skill-Share</strong> 致力于打造一个高质量的 AI 技能分享与商业流变现平台。
            在这里，你可以找到各类优质的提示词、自动化脚本、工作流模板以及深度实战文章。
          </p>
          
          <h2>我们提供什么？</h2>
          <ul>
            <li><strong>质量保证</strong>：所有上架的技能资源与教程均经过严格审核，确保开箱即用。</li>
            <li><strong>创作者激励</strong>：为优秀的 AI 使用者提供知识变现渠道，实现个人价值。</li>
            <li><strong>社区驱动</strong>：建立活跃的互助学习群组，让学习不再孤单。</li>
          </ul>

          <h2>平台起源</h2>
          <p>
            从一次日常工作中的效率瓶颈开始，我们发现许多人在不断地重复造轮子。
            好的 Prompt 和自动化工作流本可以节省大量时间。因此，我们创建了这个站点，
            希望能帮助更多人跨过 AI 的使用门槛。
          </p>
        </section>

        {/* Contact info grid */}
        <section className="pt-8 border-t">
          <h2 className="text-2xl font-bold mb-6">联系我们</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <Card className="bg-muted/30">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">官方邮箱</h4>
                  <p className="text-sm text-muted-foreground mt-1 text-blue-500 hover:underline cursor-pointer">
                    contact@skill-share.com
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">商务合作</h4>
                  <p className="text-sm text-muted-foreground mt-1 text-blue-500 hover:underline cursor-pointer">
                    bd@skill-share.com
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30 sm:col-span-2 md:col-span-1">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">办公地址</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    中国 • 上海市<br/>张江高科技园区
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
