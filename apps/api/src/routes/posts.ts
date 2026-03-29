import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { adminAuth } from "../middleware/adminAuth.js";

const postRoutes = new Hono();

// GET /posts - 获取公开文章列表
postRoutes.get("/", async (c) => {
  const tag = c.req.query("tag");
  const search = c.req.query("search");
  const limit = Number(c.req.query("limit")) || 10;
  const page = Number(c.req.query("page")) || 1;

  const where: any = { isPublished: true };

  if (tag) {
    where.tags = { some: { slug: tag } };
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
    ];
  }

  try {
    const [total, posts] = await Promise.all([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          tags: true,
        },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return c.json({
      data: posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch posts error:", error);
    return c.json({ error: "Failed to fetch posts" }, 500);
  }
});

// GET /posts/admin - 获取所有文章列表 (管理员用)
postRoutes.get("/admin", adminAuth(), async (c) => {
  try {
    const posts = await prisma.blogPost.findMany({
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        tags: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json({ data: posts });
  } catch (error) {
    console.error("Fetch admin posts error:", error);
    return c.json({ error: "Failed to fetch admin posts" }, 500);
  }
});

// GET /posts/detail/:id - 获取文章详情 (通过 ID，管理员用)
postRoutes.get("/detail/:id", adminAuth(), async (c) => {
  const id = c.req.param("id");
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        tags: true,
      },
    });

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    return c.json({ data: post });
  } catch (error) {
    console.error("Fetch post by id error:", error);
    return c.json({ error: "Failed to fetch post" }, 500);
  }
});

// GET /posts/:slug - 获取文章详情 (通过 Slug)
postRoutes.get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        tags: true,
      },
    });

    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    return c.json({ data: post });
  } catch (error) {
    console.error("Fetch post error:", error);
    return c.json({ error: "Failed to fetch post" }, 500);
  }
});

// GET /tags - 获取所有博客标签
postRoutes.get("/metadata/tags", async (c) => {
  try {
    const tags = await prisma.tag.findMany({
      where: { posts: { some: {} } },
      select: { id: true, name: true, slug: true },
    });
    return c.json(tags);
  } catch (error) {
    return c.json({ error: "Failed to fetch tags" }, 500);
  }
});

// POST /posts - 创建/发布文章
postRoutes.post("/", adminAuth(), async (c) => {
  try {
    const body = await c.req.json();
    const { title, slug, excerpt, content, coverImage, isPublished, authorId, tags } = body;

    if (!title || !slug || !content || !authorId) {
      return c.json({ error: "Missing required fields: title, slug, content, authorId" }, 400);
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        isPublished: !!isPublished,
        publishedAt: isPublished ? new Date() : null,
        author: {
          connect: { id: authorId },
        },
        tags: tags && tags.length > 0 ? {
          connectOrCreate: tags.map((tagName: string) => ({
            where: { name: tagName },
            create: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, "-") },
          })),
        } : undefined,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        tags: true,
      },
    });

    return c.json({ data: post }, 201);
  } catch (error: any) {
    if (error.code === "P2002") {
      return c.json({ error: "Slug must be unique" }, 400);
    }
    console.error("Create post error:", error);
    return c.json({ error: "Failed to create post" }, 500);
  }
});

// PATCH /posts/:id - 更新文章 (包含发布状态切换)
postRoutes.patch("/:id", adminAuth(), async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const { title, slug, excerpt, content, coverImage, isPublished, tags } = body;

    const currentPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!currentPost) {
      return c.json({ error: "Post not found" }, 404);
    }

    let publishedAt = currentPost.publishedAt;
    if (isPublished === true && !currentPost.isPublished) {
      publishedAt = new Date();
    } else if (isPublished === false) {
      publishedAt = null;
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        isPublished,
        publishedAt,
        tags: tags ? {
          set: [],
          connectOrCreate: tags.map((tagName: string) => ({
            where: { name: tagName },
            create: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, "-") },
          })),
        } : undefined,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        tags: true,
      },
    });

    return c.json({ data: post });
  } catch (error: any) {
    if (error.code === "P2002") {
      return c.json({ error: "Slug must be unique" }, 400);
    }
    console.error("Update post error:", error);
    return c.json({ error: "Failed to update post" }, 500);
  }
});

// DELETE /posts/:id - 删除文章
postRoutes.delete("/:id", adminAuth(), async (c) => {
  const id = c.req.param("id");
  try {
    await prisma.blogPost.delete({
      where: { id },
    });
    return c.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    return c.json({ error: "Failed to delete post" }, 500);
  }
});

export default postRoutes;
