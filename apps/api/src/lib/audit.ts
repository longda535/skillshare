import { prisma } from "./prisma.js";

export type AuditAction = 
  | "UPDATE_USER_ROLE" 
  | "UPDATE_USER_STATUS" 
  | "UPDATE_USER_PASSWORD"
  | "DELETE_USER" 
  | "UPDATE_SYSTEM_SETTING" 
  | "PUBLISH_BLOG_POST" 
  | "UNPUBLISH_BLOG_POST" 
  | "DELETE_BLOG_POST";

export interface AuditDetails {
  before?: any;
  after?: any;
  message?: string;
  [key: string]: any;
}

/**
 * 创建审计日志 (非阻塞)
 */
export async function createAuditLog(params: {
  userId: string;
  action: AuditAction | string;
  targetType: "USER" | "SYSTEM_SETTING" | "BLOG_POST" | "SKILL";
  targetId?: string;
  details?: AuditDetails;
  ip?: string;
}) {
  const { userId, action, targetType, targetId, details, ip } = params;

  // 异步记录，不阻塞主流程
  prisma.auditLog.create({
    data: {
      userId,
      action,
      targetType,
      targetId,
      details: details ? JSON.stringify(details) : null,
      ip
    }
  }).catch((err: any) => {
    console.error("Failed to create audit log:", err);
  });
}
