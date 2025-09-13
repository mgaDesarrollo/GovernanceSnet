#!/usr/bin/env node

/**
 * Script para probar que las variables de entorno se estén leyendo correctamente
 */

console.log('🔍 Verificando variables de entorno...');
console.log('');

// Cargar dotenv si está disponible
try {
  require('dotenv').config({ path: '.env.local' });
  console.log('✅ dotenv cargado desde .env.local');
} catch (error) {
  console.log('⚠️  dotenv no disponible, usando variables del sistema');
}

console.log('');

// Verificar variables de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('📋 Variables de Supabase:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
if (supabaseUrl) {
  console.log('   Valor:', supabaseUrl.substring(0, 50) + '...');
}
console.log('');

console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
if (supabaseAnonKey) {
  console.log('   Valor:', supabaseAnonKey.substring(0, 50) + '...');
}
console.log('');

console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
if (supabaseServiceKey) {
  console.log('   Valor:', supabaseServiceKey.substring(0, 50) + '...');
}
console.log('');

// Verificar variables de NextAuth
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;

console.log('🔐 Variables de NextAuth:');
console.log('NEXTAUTH_SECRET:', nextAuthSecret ? '✅' : '❌');
if (nextAuthSecret) {
  console.log('   Valor:', nextAuthSecret.substring(0, 20) + '...');
}
console.log('');

console.log('NEXTAUTH_URL:', nextAuthUrl ? '✅' : '❌');
if (nextAuthUrl) {
  console.log('   Valor:', nextAuthUrl);
}
console.log('');

// Verificar otras variables importantes
const databaseUrl = process.env.DATABASE_URL;
const discordClientId = process.env.DISCORD_CLIENT_ID;
const discordClientSecret = process.env.DISCORD_CLIENT_SECRET;

console.log('🗄️  Otras variables importantes:');
console.log('DATABASE_URL:', databaseUrl ? '✅' : '❌');
console.log('DISCORD_CLIENT_ID:', discordClientId ? '✅' : '❌');
console.log('DISCORD_CLIENT_SECRET:', discordClientSecret ? '✅' : '❌');
console.log('');

// Resumen
const requiredVars = [supabaseUrl, supabaseAnonKey, supabaseServiceKey];
const missingVars = requiredVars.filter(v => !v).length;

if (missingVars === 0) {
  console.log('🎉 Todas las variables requeridas están configuradas correctamente!');
  console.log('');
  console.log('🚀 Ahora puedes ejecutar: npm run fix-policies');
} else {
  console.log(`❌ Faltan ${missingVars} variables requeridas`);
  console.log('');
  console.log('🔧 Para solucionarlo:');
  console.log('1. Verifica que el archivo .env.local esté en la raíz del proyecto');
  console.log('2. Verifica que no haya espacios alrededor del signo =');
  console.log('3. Reinicia el servidor después de modificar .env.local');
  console.log('4. Ejecuta este script nuevamente: node scripts/test-env.js');
}

console.log('');
console.log('📁 Ubicación actual del script:', __dirname);
console.log('📁 Directorio de trabajo:', process.cwd());
