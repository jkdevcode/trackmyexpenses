import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Attempting to connect to the database...');
    // Only verify connection and perform a simple query that doesn't depend on schema
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    
    console.log('Database connection verified successfully.');
    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error('Database connection failed:', e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

void main();
