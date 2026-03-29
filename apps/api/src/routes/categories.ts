import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";

export const categoryRoutes = new Hono();

// GET /api/categories — 分类列表
categoryRoutes.get("/categories", async (c) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { skills: true },
        },
      },
      orderBy: { order: "asc" },
    });

    const data = categories.map((cat) => ({
      ...cat,
      count: cat._count.skills,
    }));

    return c.json({ data });
  } catch (error) {
    console.error("Fetch categories error:", error);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

// GET /api/tags — 标签列表
categoryRoutes.get("/tags", async (c) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { skills: true },
        },
      },
      take: 20,
    });

    return c.json({ data: tags });
  } catch (error) {
    console.error("Fetch tags error:", error);
    return c.json({ error: "Failed to fetch tags" }, 500);
  }
});

