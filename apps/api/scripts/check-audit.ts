import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkLogs() {
  try {
    const count = await prisma.auditLog.count();
    console.log(`Current audit log count: ${count}`);
    
    if (count > 0) {
      const latest = await prisma.auditLog.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } }
      });
      console.log('Latest log:', JSON.stringify(latest, null, 2));
    }
  } catch (err) {
    console.error('Error fetching logs:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkLogs();
