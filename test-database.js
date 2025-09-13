const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🔍 Testing Database Connection...\n');
  
  // Check DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  console.log('📋 DATABASE_URL Status:');
  if (databaseUrl) {
    if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
      console.log(`✅ DATABASE_URL: ${databaseUrl.substring(0, 50)}...`);
    } else {
      console.log(`❌ DATABASE_URL: Invalid format - ${databaseUrl}`);
    }
  } else {
    console.log('❌ DATABASE_URL: NOT SET');
  }
  
  // Test connection
  console.log('\n🔌 Testing Database Connection:');
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test user table
    const userCount = await prisma.user.count();
    console.log(`✅ Users table accessible (${userCount} users found)`);
    
    // Check for any users
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        take: 3,
        select: { id: true, name: true, role: true }
      });
      console.log('📋 Sample users:', users);
    }
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    
    if (error.message.includes('postgresql://')) {
      console.log('\n💡 Solution:');
      console.log('1. Set DATABASE_URL in Vercel environment variables');
      console.log('2. Use the exact format: postgresql://username:password@host:port/database');
      console.log('3. Redeploy the application');
    }
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n🔧 Vercel Environment Variables to Set:');
  console.log('DATABASE_URL=postgresql://neondb_owner:npg_iFLG7d4Aenfq@ep-dawn-star-acg9u59m-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
  console.log('DISCORD_CLIENT_ID=1372614140572729445');
  console.log('DISCORD_CLIENT_SECRET=your-discord-client-secret');
  console.log('NEXTAUTH_SECRET=VlzuxE1i/VQkRvN863U+gJTLOq3czRrK41S91ObG1Os=');
  console.log('NEXTAUTH_URL=https://governance-dashboard-2.vercel.app');
  console.log('NEXT_PUBLIC_SUPER_ADMIN_DISCORD_ID=760316620819136512');
}

testDatabase().catch(console.error); 