import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Connecting to DB...');
    await prisma.$connect();
    console.log('Connected successfully!');
    const count = await prisma.usuario.count();
    console.log(`User count: ${count}`);
    await prisma.$disconnect();
  } catch (e) {
    console.error('Connection failed:', e);
    process.exit(1);
  }
}

main();
