import { z } from "zod";

// ========================
// Zod 验证 Schemas
// ========================

/** 技能查询参数 */
export const skillQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(["latest", "popular", "price"]).default("latest"),
});

export type SkillQuery = z.infer<typeof skillQuerySchema>;

/** 创建技能 */
export const createSkillSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  content: z.string().optional(),
  coverImage: z.string().url().optional(),
  price: z.number().min(0).default(0),
  categoryId: z.string(),
  tags: z.array(z.string()).default([]),
});

export type CreateSkill = z.infer<typeof createSkillSchema>;

/** 博客文章查询参数 */
export const postQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  tag: z.string().optional(),
  search: z.string().optional(),
});

export type PostQuery = z.infer<typeof postQuerySchema>;
