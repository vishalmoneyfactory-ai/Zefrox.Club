import { prisma } from './prisma';

export async function notifyAdmins(type: string, message: string) {
  try {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const data = admins.map(admin => ({
        userId: admin.id,
        type,
        message,
      }));
      await prisma.notification.createMany({ data });
    }
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
}
