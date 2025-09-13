const fs = require('fs')
const path = require('path')

console.log('🔍 Verificando configuración de variables de entorno...\n')

// Verificar si existe .env.local
const envPath = path.join(process.cwd(), '.env.local')
const envExists = fs.existsSync(envPath)

if (!envExists) {
  console.log('❌ No se encontró el archivo .env.local')
  console.log('📝 Creando archivo .env.local con variables necesarias...\n')
  
  const envContent = `# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Discord OAuth Configuration
DISCORD_CLIENT_ID=1372614140572729445
DISCORD_CLIENT_SECRET=your-discord-client-secret-here

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/your-database-name"

# Environment
NODE_ENV=development
`
  
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Archivo .env.local creado')
  console.log('⚠️  IMPORTANTE: Debes configurar las siguientes variables:')
  console.log('   - NEXTAUTH_SECRET: Genera una clave secreta aleatoria')
  console.log('   - DISCORD_CLIENT_SECRET: Obtén esto del Portal de Desarrolladores de Discord')
  console.log('   - DATABASE_URL: Configura tu URL de base de datos PostgreSQL')
} else {
  console.log('✅ Archivo .env.local encontrado')
  
  // Leer y verificar variables
  const envContent = fs.readFileSync(envPath, 'utf8')
  const envVars = {}
  
  envContent.split('\n').forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, value] = line.split('=', 2)
      envVars[key.trim()] = value.trim()
    }
  })
  
  const requiredVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET', 
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET',
    'DATABASE_URL'
  ]
  
  console.log('\n📋 Estado de las variables requeridas:')
  
  requiredVars.forEach(varName => {
    const value = envVars[varName]
    if (value && value !== 'your-' + varName.toLowerCase().replace(/_/g, '-') + '-here') {
      console.log(`✅ ${varName}: Configurado`)
    } else {
      console.log(`❌ ${varName}: No configurado o valor por defecto`)
    }
  })
  
  console.log('\n🔧 Instrucciones para configurar variables faltantes:')
  
  if (!envVars.NEXTAUTH_SECRET || envVars.NEXTAUTH_SECRET.includes('your-nextauth-secret')) {
    console.log('\n1. NEXTAUTH_SECRET:')
    console.log('   - Genera una clave secreta aleatoria:')
    console.log('   - Puedes usar: openssl rand -base64 32')
    console.log('   - O visita: https://generate-secret.vercel.app/32')
  }
  
  if (!envVars.DISCORD_CLIENT_SECRET || envVars.DISCORD_CLIENT_SECRET.includes('your-discord-client-secret')) {
    console.log('\n2. DISCORD_CLIENT_SECRET:')
    console.log('   - Ve a: https://discord.com/developers/applications')
    console.log('   - Selecciona tu aplicación (ID: 1372614140572729445)')
    console.log('   - Ve a OAuth2 > General')
    console.log('   - Copia el "Client Secret"')
  }
  
  if (!envVars.DATABASE_URL || envVars.DATABASE_URL.includes('your-database-name')) {
    console.log('\n3. DATABASE_URL:')
    console.log('   - Formato: postgresql://username:password@localhost:5432/database-name')
    console.log('   - Si usas Vercel, configura la variable en el dashboard de Vercel')
  }
}

console.log('\n🌐 URLs de Discord OAuth que debes configurar:')
console.log('   - http://localhost:3000/api/auth/callback/discord')
console.log('   - https://governance-dashboard-2.vercel.app/api/auth/callback/discord')
console.log('\n📖 Portal de Discord: https://discord.com/developers/applications/1372614140572729445/oauth2/general')

console.log('\n🚀 Después de configurar las variables:')
console.log('   1. Reinicia el servidor de desarrollo')
console.log('   2. Ve a: http://localhost:3000/test-auth')
console.log('   3. Prueba la autenticación con Discord') 