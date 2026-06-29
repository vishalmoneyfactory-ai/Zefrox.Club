import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.error('ERROR: ADMIN_EMAIL environment variable is not set.');
    process.exit(1);
  }

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
    },
    create: {
      fullName: 'Admin',
      email: adminEmail,
      phone: '0000000000',
      role: 'ADMIN',
    },
  });

  console.log(`✅ Admin user created/updated: ${admin.email} (ID: ${admin.id})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
