import { prisma } from "../src/lib/prisma.js";
import { createAuditLog } from "../src/lib/audit.js";

async function simulateAction() {
  const adminId = "creator_id"; // Replace with actual dev admin ID
  // Find an admin user
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    console.log("No admin user found to simulate log");
    return;
  }

  console.log(`Simulating maintenance toggle for admin: ${admin.email}`);
  
  // 模拟操作
  await createAuditLog({
    userId: admin.id,
    action: "UPDATE_SYSTEM_SETTING",
    targetType: "SYSTEM_SETTING",
    details: {
      before: { maintenance_mode: "false" },
      after: { maintenance_mode: "true" }
    },
    ip: "127.0.0.1"
  });

  // Wait for async log creation
  await new Promise(r => setTimeout(r, 1000));
  
  const count = await prisma.auditLog.count();
  console.log(`Audit log count after simulation: ${count}`);
  
  const latest = await prisma.auditLog.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true } } }
  });
  console.log('Latest log details:', JSON.stringify(latest, null, 2));
  
  await prisma.$disconnect();
}

simulateAction();
