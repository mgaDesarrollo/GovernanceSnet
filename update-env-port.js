const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env.local')

if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8')
  
  // Reemplazar el puerto 3002 por 3000
  envContent = envContent.replace(/NEXTAUTH_URL=http:\/\/localhost:3002/g, 'NEXTAUTH_URL=http://localhost:3000')
  
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Archivo .env.local actualizado para usar puerto 3000')
} else {
  console.log('❌ No se encontró el archivo .env.local')
} 