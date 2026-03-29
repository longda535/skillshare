import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";

export const skillRoutes = new Hono();

// GET /api/skills — 技能列表 (带过滤与分页)
skillRoutes.get("/skills", async (c) => {
  const categorySlug = c.req.query("category");
  const search = c.req.query("search");
  const page = Number(c.req.query("page") || 1);
  const limit = Number(c.req.query("limit") || 12);
  const skip = (page - 1) * limit;

  const where: any = { isPublished: true };

  if (categorySlug && categorySlug !== "all" && categorySlug !== "全部") {
    where.category = { slug: categorySlug };
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  try {
    const [skills, total] = await Promise.all([
      prisma.skill.findMany({
        where,
        include: {
          category: true,
          tags: true,
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.skill.count({ where }),
    ]);

    return c.json({ data: skills, total, page, limit });
  } catch (error) {
    console.error("Fetch skills error:", error);
    return c.json({ error: "Failed to fetch skills" }, 500);
  }
});

// GET /api/skills/:id — 技能详情
skillRoutes.get("/skills/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const skill = await prisma.skill.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
        author: {
          select: { id: true, name: true, avatar: true },
        },
        files: true,
      },
    });

    if (!skill) {
      return c.json({ error: "Skill not found" }, 404);
    }

    // 更新浏览量 (简单实现)
    await prisma.skill.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return c.json({ data: skill });
  } catch (error) {
    console.error("Fetch skill detail error:", error);
    return c.json({ error: "Failed to fetch skill detail" }, 500);
  }
});

