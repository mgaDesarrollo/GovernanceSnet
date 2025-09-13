const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOAuthConfig() {
  console.log('🔍 Checking OAuth Configuration...\n');
  
  // Check environment variables
  const requiredEnvVars = [
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET', 
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'DATABASE_URL'
  ];
  
  console.log('📋 Environment Variables:');
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '***SET***' : value}`);
    } else {
      console.log(`❌ ${varName}: NOT SET`);
    }
  });
  
  console.log('\n🔗 Discord OAuth Configuration:');
  console.log('1. Go to https://discord.com/developers/applications');
  console.log('2. Select your application');
  console.log('3. Go to OAuth2 > General');
  console.log('4. Check these settings:');
  console.log('   - Client ID should match DISCORD_CLIENT_ID');
  console.log('   - Client Secret should match DISCORD_CLIENT_SECRET');
  console.log('5. Go to OAuth2 > Redirects');
  console.log('   - Add: http://localhost:3000/api/auth/callback/discord (for development)');
  console.log('   - Add: https://your-domain.vercel.app/api/auth/callback/discord (for production)');
  
  console.log('\n🌐 NextAuth URL Configuration:');
  console.log('- For development: NEXTAUTH_URL=http://localhost:3000');
  console.log('- For production: NEXTAUTH_URL=https://your-domain.vercel.app');
  
  console.log('\n🔐 NEXTAUTH_SECRET:');
  console.log('- Generate a random string for production');
  console.log('- Example: openssl rand -base64 32');
  
  console.log('\n📊 Database Connection:');
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if users table exists
    const userCount = await prisma.user.count();
    console.log(`✅ Users table accessible (${userCount} users found)`);
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n🚀 Common Solutions:');
  console.log('1. Ensure all environment variables are set in Vercel');
  console.log('2. Check Discord OAuth redirect URLs');
  console.log('3. Verify NEXTAUTH_URL matches your deployment URL');
  console.log('4. Make sure NEXTAUTH_SECRET is set and consistent');
  console.log('5. Clear browser cookies and try again');
}

checkOAuthConfig().catch(console.error); 