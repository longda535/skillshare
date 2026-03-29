// ========================
// 共享 TypeScript 类型
// ========================

/** 用户角色 */
export type Role = "USER" | "ADMIN";

/** 用户 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

/** 技能分类 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
}

/** 标签 */
export interface Tag {
  id: string;
  name: string;
  slug: string;
}

/** 技能资源 */
export interface Skill {
  id: string;
  title: string;
  description: string;
  content: string | null;
  coverImage: string | null;
  price: number;
  downloadCount: number;
  viewCount: number;
  isPublished: boolean;
  categoryId: string;
  category?: Category;
  authorId: string;
  author?: User;
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
}

/** 博客文章 */
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  authorId: string;
  author?: User;
  tags?: Tag[];
  createdAt: string;
  updatedAt: string;
}

/** 上传文件 */
export interface FileRecord {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  skillId: string | null;
  createdAt: string;
}

/** 评论 */
export interface Comment {
  id: string;
  content: string;
  skillId: string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

/** 通用分页响应 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** API 响应 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** API 错误响应 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
