const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugNextAuth() {
  console.log('🔍 Debugging NextAuth Configuration...\n');
  
  // Check all environment variables
  const envVars = {
    'DISCORD_CLIENT_ID': process.env.DISCORD_CLIENT_ID,
    'DISCORD_CLIENT_SECRET': process.env.DISCORD_CLIENT_SECRET,
    'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET,
    'NEXTAUTH_URL': process.env.NEXTAUTH_URL,
    'DATABASE_URL': process.env.DATABASE_URL,
    'VERCEL_URL': process.env.VERCEL_URL,
    'NODE_ENV': process.env.NODE_ENV
  };
  
  console.log('📋 Environment Variables Status:');
  Object.entries(envVars).forEach(([key, value]) => {
    if (value) {
      if (key.includes('SECRET') || key.includes('CLIENT_SECRET')) {
        console.log(`✅ ${key}: ***SET*** (${value.length} chars)`);
      } else {
        console.log(`✅ ${key}: ${value}`);
      }
    } else {
      console.log(`❌ ${key}: NOT SET`);
    }
  });
  
  // Check database connection
  console.log('\n📊 Database Connection Test:');
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
  } finally {
    await prisma.$disconnect();
  }
  
  // NextAuth URL detection
  console.log('\n🌐 NextAuth URL Detection:');
  const nextAuthUrl = process.env.NEXTAUTH_URL || 
                     (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  console.log(`Detected NEXTAUTH_URL: ${nextAuthUrl}`);
  
  // Discord OAuth URLs
  console.log('\n🔗 Discord OAuth URLs to configure:');
  console.log(`Development: http://localhost:3000/api/auth/callback/discord`);
  console.log(`Production: ${nextAuthUrl}/api/auth/callback/discord`);
  
  // Common issues
  console.log('\n🚨 Common NextAuth Issues:');
  console.log('1. Missing environment variables');
  console.log('2. Incorrect Discord OAuth redirect URLs');
  console.log('3. Mismatched NEXTAUTH_URL');
  console.log('4. Invalid NEXTAUTH_SECRET');
  console.log('5. Database connection issues');
  console.log('6. CORS issues in development');
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    console.log('❌ Set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET');
  }
  if (!process.env.NEXTAUTH_SECRET) {
    console.log('❌ Set NEXTAUTH_SECRET (use the generated one)');
  }
  if (!process.env.NEXTAUTH_URL) {
    console.log('⚠️  Consider setting NEXTAUTH_URL explicitly');
  }
  
  console.log('\n🔧 Quick Fixes:');
  console.log('1. Add all environment variables to Vercel');
  console.log('2. Update Discord OAuth redirect URLs');
  console.log('3. Redeploy the application');
  console.log('4. Clear browser cookies and cache');
}

debugNextAuth().catch(console.error); 