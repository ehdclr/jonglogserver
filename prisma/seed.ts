// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.blogSettings.findUnique({
    where: { id: 'main_settings' },
  });

  if (!settings) {
    await prisma.blogSettings.create({
      data: {
        id: 'main_settings',
        blogName: 'JONG, DEV',
        blogDescription: 'JONG, DEV 블로그',
        isGithubPublic: false,
        isEmailPublic: false,
        isSnsPublic: false,
      },
    });
    console.log('블로그 설정이 초기화되었습니다.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
