import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("正在同步 Mock 数据到 SQLite 数据库...");

  // 1. 创建默认系统用户
  const admin = await prisma.user.upsert({
    where: { email: "admin@skillshare.com" },
    update: { password: "admin123" },
    create: {
      email: "admin@skillshare.com",
      name: "AI 视觉研究室",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
      password: "admin123",
      role: "ADMIN",
    },
  });

  const creator = await prisma.user.upsert({
    where: { email: "creator@skillshare.com" },
    update: { password: "admin123" },
    create: {
      email: "creator@skillshare.com",
      name: "Prompt 专家",
      avatar: "https://i.pravatar.cc/150?u=u2",
      password: "admin123",
      role: "USER",
    },
  });

  // 2. 创建分类
  const categories = [
    { name: "AI 绘画", slug: "ai-drawing", order: 1 },
    { name: "AI 视频", slug: "ai-video", order: 2 },
    { name: "AI 编程", slug: "ai-coding", order: 3 },
    { name: "AI 音频", slug: "ai-audio", order: 4 },
    { name: "AI 办公", slug: "ai-office", order: 5 },
    { name: "AI 设计", slug: "ai-design", order: 6 },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap[cat.name] = created.id;
  }

  // 3. 创建标签
  const tags = ["Midjourney", "Prompt", "Cursor", "Sora", "Runway", "ChatGPT", "Automation"];
  const tagIds = [];

  for (const tagName of tags) {
    const tag = await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName, slug: tagName.toLowerCase() },
    });
    tagIds.push(tag);
  }

  // 4. 创建初始技能
  const skillData = [
    {
      title: "Midjourney V6 商业级摄影提示词指南",
      slug: "mj-v6-photography-guide",
      description: "包含 500+ 高品质商业摄影级提示词模板，涵盖人像、产品、风光等主题。",
      content: "详细内容说明...",
      coverImage: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80",
      price: 0,
      downloadCount: 1254,
      viewCount: 3000,
      isPublished: true,
      categoryId: categoryMap["AI 绘画"],
      authorId: admin.id,
      tags: { connect: [{ name: "Midjourney" }, { name: "Prompt" }] },
    },
    {
      title: "Cursor & Cline AI 驱动的全栈开发工作流",
      slug: "cursor-cline-workflow",
      description: "如何使用 Cursor 和 Cline Agent 提升 10 倍前端与后端开发效率，包含真实项目实战。",
      content: "实战工作流教程...",
      coverImage: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=800&q=80",
      price: 19.9,
      downloadCount: 452,
      viewCount: 1500,
      isPublished: true,
      categoryId: categoryMap["AI 编程"],
      authorId: admin.id,
      tags: { connect: [{ name: "Cursor" }] },
    },
    {
      title: "Sora & Runway Gen-2 视频生成核心技巧",
      slug: "sora-runway-video-tips",
      description: "零基础掌握文本生成视频（Text-to-Video）的核心法则与镜头控制。",
      content: "镜头控制技巧...",
      coverImage: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
      price: 9.9,
      downloadCount: 890,
      viewCount: 2100,
      isPublished: true,
      categoryId: categoryMap["AI 视频"],
      authorId: creator.id,
      tags: { connect: [{ name: "Sora" }, { name: "Runway" }] },
    },
    {
      title: "ChatGPT 高效自动化办公脚本库",
      slug: "chatgpt-automation-scripts",
      description: "利用 ChatGPT 快速生成 Excel VBA、Python 自动化脚本，告别机械重复工作。",
      content: "办公脚本详解...",
      coverImage: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80",
      price: 0,
      downloadCount: 3210,
      viewCount: 5600,
      isPublished: true,
      categoryId: categoryMap["AI 办公"],
      authorId: creator.id,
      tags: { connect: [{ name: "ChatGPT" }, { name: "Automation" }] },
    },
  ];

  // 清理现有技能和帖子以避免冲突（开发环境）
  await prisma.comment.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.skill.deleteMany();

  for (const skill of skillData) {
    await prisma.skill.create({
      data: skill,
    });
  }

  // 5. 创建初始博客文章
  const posts = [
    {
      title: "2024年 AI 行业趋势深度报告",
      slug: "ai-trends-2024-report",
      excerpt: "从大语言模型到多模态生成，带你洞察 2024 年最值得关注的 AI 核心技术趋势。",
      content: "## 核心趋势一：大模型的小型化...\n\n随着手机和 PC 端算力的提升，本地大模型将成为主流...",
      coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
      isPublished: true,
      publishedAt: new Date(),
      authorId: admin.id,
      tags: { connect: [{ name: "ChatGPT" }, { name: "Automation" }] },
    },
    {
      title: "如何写出顶级的 Midjourney 提示词？",
      slug: "top-tier-mj-prompts",
      excerpt: "掌握这三个结构化模板，让你的 AI 绘画瞬间达到大师级水准。",
      content: "## 结构化提示词公式...\n\n1. 主体 (Subject)\n2. 风格 (Style)\n3. 光影 (Lighting)...",
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
      isPublished: true,
      publishedAt: new Date(),
      authorId: creator.id,
      tags: { connect: [{ name: "Midjourney" }, { name: "Prompt" }] },
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.create({
      data: post,
    });
  }

  // 6. 创建初始评论
  const allSkills = await prisma.skill.findMany();
  const allPosts = await prisma.blogPost.findMany();

  for (const skill of allSkills) {
    await prisma.comment.create({
      data: {
        content: `这是一条关于 ${skill.title} 的优质评论！内容非常有用。`,
        authorId: creator.id,
        skillId: skill.id,
      },
    });
    await prisma.comment.create({
      data: {
        content: `感谢分享，期待更多关于 ${skill.title} 的更新。`,
        authorId: admin.id,
        skillId: skill.id,
      },
    });
  }

  for (const post of allPosts) {
    await prisma.comment.create({
      data: {
        content: `读完这篇《${post.title}》，收获很大！`,
        authorId: creator.id,
        postId: post.id,
      },
    });
  }

  // 7. 初始化系统设置
  const settings = [
    { key: "site_name", value: "Skill-Share", type: "text", description: "网站名称" },
    { key: "site_description", value: "领先的 AI 技能分享与资源交易平台", type: "text", description: "网站描述/标语" },
    { key: "seo_keywords", value: "AI, Midjourney, ChatGPT, Prompt, 技能分享", type: "text", description: "SEO 关键词" },
    { key: "footer_text", value: "© 2026 Skill-Share. All rights reserved.", type: "text", description: "页脚版权文字" },
    { key: "maintenance_mode", value: "false", type: "boolean", description: "是否开启维护模式" },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {}, // 不覆盖已有值，仅初始化
      create: setting,
    });
  }

  console.log("数据同步完成！");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
