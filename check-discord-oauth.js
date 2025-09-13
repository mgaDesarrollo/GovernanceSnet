console.log('🔍 Checking Discord OAuth Configuration...\n');

// Check environment variables
const envVars = {
  'DISCORD_CLIENT_ID': process.env.DISCORD_CLIENT_ID,
  'DISCORD_CLIENT_SECRET': process.env.DISCORD_CLIENT_SECRET,
  'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET,
  'NEXTAUTH_URL': process.env.NEXTAUTH_URL,
};

console.log('📋 Current Environment Variables:');
Object.entries(envVars).forEach(([key, value]) => {
  if (value) {
    if (key.includes('SECRET')) {
      console.log(`✅ ${key}: ***SET*** (${value.length} chars)`);
    } else {
      console.log(`✅ ${key}: ${value}`);
    }
  } else {
    console.log(`❌ ${key}: NOT SET`);
  }
});

console.log('\n🔗 Discord OAuth Setup Instructions:');
console.log('1. Go to https://discord.com/developers/applications');
console.log('2. Select your application (or create a new one)');
console.log('3. Go to OAuth2 > General');
console.log('4. Copy the Client ID and Client Secret');
console.log('5. Go to OAuth2 > Redirects');
console.log('6. Add these redirect URLs:');

const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
console.log(`   - Development: http://localhost:3000/api/auth/callback/discord`);
console.log(`   - Production: ${nextAuthUrl}/api/auth/callback/discord`);

console.log('\n⚙️  OAuth2 Scopes Required:');
console.log('- identify (required)');
console.log('- email (required)');
console.log('- guilds (optional, for server info)');

console.log('\n🔧 Vercel Environment Variables to Set:');
console.log('DISCORD_CLIENT_ID=your-discord-client-id');
console.log('DISCORD_CLIENT_SECRET=your-discord-client-secret');
console.log('NEXTAUTH_SECRET=your-generated-secret');
console.log('NEXTAUTH_URL=https://your-domain.vercel.app');

console.log('\n🚨 Common Issues & Solutions:');
console.log('1. "OAuth link invalido" - Check redirect URLs in Discord');
console.log('2. "Configuration" error - Verify environment variables');
console.log('3. "AccessDenied" - Check Discord app permissions');
console.log('4. "Callback" error - Verify NEXTAUTH_URL matches deployment');

console.log('\n💡 Quick Fixes:');
console.log('1. Ensure all environment variables are set in Vercel');
console.log('2. Add correct redirect URLs to Discord OAuth2 settings');
console.log('3. Redeploy the application after setting variables');
console.log('4. Clear browser cookies and cache');
console.log('5. Check Discord app is not in "Bot" mode only');

console.log('\n🔍 Debug Steps:');
console.log('1. Visit /auth/signin to test login');
console.log('2. Click "Probar Configuración" button');
console.log('3. Check browser console for detailed logs');
console.log('4. Check Vercel function logs for server-side errors');

console.log('\n📞 If issues persist:');
console.log('1. Verify Discord app is properly configured');
console.log('2. Check that the app is not in "Bot" mode only');
console.log('3. Ensure redirect URLs are exactly correct');
console.log('4. Try with a fresh browser session'); 