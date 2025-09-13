#!/usr/bin/env node

/**
 * Script para aplicar migraciones de Supabase y configurar el bucket de almacenamiento
 * Este script debe ejecutarse después de configurar las variables de entorno
 */

const { createClient } = require('@supabase/supabase-js');

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno requeridas');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

// Crear cliente de Supabase con service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  try {
    console.log('🚀 Configurando bucket de almacenamiento...');
    
    // Verificar si el bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      throw listError;
    }
    
    const bucketName = 'proposal-attachments';
    const bucketExists = buckets?.some(b => b.name === bucketName);
    
    if (!bucketExists) {
      console.log(`📦 Creando bucket: ${bucketName}`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
          'application/pdf'
        ]
      });
      
      if (createError) {
        throw createError;
      }
      console.log(`✅ Bucket ${bucketName} creado exitosamente`);
    } else {
      console.log(`✅ Bucket ${bucketName} ya existe`);
    }
    
    // Aplicar políticas de almacenamiento
    console.log('🔐 Aplicando políticas de almacenamiento...');
    
    // Leer y ejecutar la migración de políticas
    const fs = require('fs');
    const path = require('path');
    
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20241220_fix_storage_policies.sql');
    
    if (fs.existsSync(migrationPath)) {
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      console.log('📝 Ejecutando migración de políticas...');
      
      // Ejecutar las políticas SQL
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: migrationSQL });
      
      if (policyError) {
        console.warn('⚠️  No se pudo ejecutar la migración automáticamente. Ejecuta manualmente:');
        console.warn(`   ${migrationPath}`);
      } else {
        console.log('✅ Políticas de almacenamiento aplicadas exitosamente');
      }
    } else {
      console.warn('⚠️  Archivo de migración no encontrado. Ejecuta manualmente las políticas SQL.');
    }
    
    console.log('🎉 Configuración de almacenamiento completada');
    
  } catch (error) {
    console.error('❌ Error configurando almacenamiento:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  }
}

async function main() {
  console.log('🔧 Configurando Supabase Storage...');
  await setupStorage();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { setupStorage };
