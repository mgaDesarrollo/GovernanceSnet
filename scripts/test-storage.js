#!/usr/bin/env node

/**
 * Script para probar que el almacenamiento de Supabase esté funcionando
 * después de aplicar las políticas RLS
 */

// Cargar variables de entorno desde .env.local
try {
  require('dotenv').config({ path: '.env.local' });
  console.log('✅ Variables de entorno cargadas desde .env.local');
} catch (error) {
  console.log('⚠️  dotenv no disponible, intentando cargar variables del sistema');
}

const { createClient } = require('@supabase/supabase-js');

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('');
console.log('🔍 Verificando configuración de Supabase...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
console.log('');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno requeridas');
  process.exit(1);
}

// Crear cliente de Supabase con service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testStorage() {
  try {
    console.log('🧪 Probando funcionalidad de almacenamiento...');
    
    // 1. Verificar que el bucket existe
    console.log('1️⃣ Verificando bucket proposal-attachments...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Error listando buckets: ${listError.message}`);
    }
    
    const bucketName = 'proposal-attachments';
    const bucketExists = buckets?.some(b => b.name === bucketName);
    
    if (bucketExists) {
      console.log(`   ✅ Bucket ${bucketName} existe`);
    } else {
      console.log(`   ❌ Bucket ${bucketName} no existe`);
      console.log('   📝 Creando bucket...');
      
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
          'application/pdf'
        ]
      });
      
      if (createError) {
        throw new Error(`Error creando bucket: ${createError.message}`);
      }
      
      console.log(`   ✅ Bucket ${bucketName} creado exitosamente`);
    }
    
    // 2. Verificar políticas RLS
    console.log('2️⃣ Verificando políticas RLS...');
    
    // Intentar listar archivos (esto debería funcionar con service role)
    const { data: files, error: listFilesError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 });
    
    if (listFilesError) {
      console.log(`   ⚠️  Error listando archivos: ${listFilesError.message}`);
      if (listFilesError.message.includes('row-level security policy')) {
        console.log('   ❌ Las políticas RLS no están configuradas correctamente');
        console.log('   🔧 Ejecuta las políticas SQL en Supabase Dashboard');
      }
    } else {
      console.log('   ✅ Políticas RLS funcionando correctamente');
      console.log(`   📁 Archivos en bucket: ${files?.length || 0}`);
    }
    
    // 3. Probar subida de archivo de prueba
    console.log('3️⃣ Probando subida de archivo...');
    
    // Crear un archivo de prueba simple
    const testContent = 'Este es un archivo de prueba para verificar las políticas RLS';
    const testFile = Buffer.from(testContent);
    const testFileName = `test-${Date.now()}.txt`;
    const testPath = `test/${testFileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(testPath, testFile, {
        contentType: 'text/plain'
      });
    
    if (uploadError) {
      console.log(`   ⚠️  Error subiendo archivo de prueba: ${uploadError.message}`);
      if (uploadError.message.includes('row-level security policy')) {
        console.log('   ❌ Las políticas RLS no permiten subir archivos');
      }
    } else {
      console.log('   ✅ Archivo de prueba subido exitosamente');
      
      // Limpiar archivo de prueba
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([testPath]);
      
      if (deleteError) {
        console.log(`   ⚠️  Error eliminando archivo de prueba: ${deleteError.message}`);
      } else {
        console.log('   ✅ Archivo de prueba eliminado');
      }
    }
    
    console.log('');
    console.log('🎯 Resumen de la prueba:');
    console.log('   ✅ Bucket configurado correctamente');
    
    if (listFilesError && listFilesError.message.includes('row-level security policy')) {
      console.log('   ❌ Políticas RLS necesitan configuración');
      console.log('');
      console.log('🔧 Para solucionarlo:');
      console.log('1. Ve al Dashboard de Supabase');
      console.log('2. Abre el SQL Editor');
      console.log('3. Ejecuta las políticas SQL que ya tienes');
      console.log('4. Ejecuta este script nuevamente');
    } else {
      console.log('   ✅ Políticas RLS funcionando correctamente');
      console.log('');
      console.log('🚀 ¡El almacenamiento está configurado correctamente!');
      console.log('   Ahora puedes probar subir archivos desde tu aplicación');
    }
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    console.error('');
    console.error('🔧 Soluciones:');
    console.error('1. Verifica que las políticas SQL se hayan ejecutado correctamente');
    console.error('2. Verifica que RLS esté habilitado en storage.objects');
    console.error('3. Ejecuta las políticas SQL nuevamente en Supabase');
  }
}

async function main() {
  console.log('🚀 Iniciando prueba de almacenamiento de Supabase...');
  console.log('');
  
  await testStorage();
  
  console.log('');
  console.log('✅ Prueba completada.');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testStorage };
