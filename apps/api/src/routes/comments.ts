import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";

const commentRoutes = new Hono();

// GET /comments - 获取评论列表 (支持 skillId 或 postId 过滤)
commentRoutes.get("/", async (c) => {
  const skillId = c.req.query("skillId");
  const postId = c.req.query("postId");
  const limit = Number(c.req.query("limit")) || 20;

  const where: any = {};
  if (skillId) where.skillId = skillId;
  if (postId) where.postId = postId;

  try {
    const comments = await prisma.comment.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return c.json({ data: comments });
  } catch (error) {
    console.error("Fetch comments error:", error);
    return c.json({ error: "Failed to fetch comments" }, 500);
  }
});

// POST /comments - 发表新评论
commentRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { content, skillId, postId, authorId } = body;

    if (!content) {
      return c.json({ error: "Content is required" }, 400);
    }

    // 在没有真实 Auth 的情况下，使用传入的 authorId 或默认一个
    const finalAuthorId = authorId || (await prisma.user.findFirst())?.id;

    if (!finalAuthorId) {
      return c.json({ error: "No user found to assign as author" }, 400);
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: finalAuthorId,
        skillId: skillId || null,
        postId: postId || null,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return c.json({ data: comment });
  } catch (error) {
    console.error("Create comment error:", error);
    return c.json({ error: "Failed to create comment" }, 500);
  }
});

export default commentRoutes;
