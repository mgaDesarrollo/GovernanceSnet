#!/usr/bin/env node

/**
 * Script simple para aplicar políticas SQL directamente en Supabase
 * Este script ejecuta las consultas SQL necesarias para corregir el error RLS
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
console.log('🔍 Verificando variables de entorno...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
console.log('');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno requeridas');
  console.error('');
  console.error('🔧 Soluciones posibles:');
  console.error('1. Verifica que el archivo .env.local esté en la raíz del proyecto');
  console.error('2. Verifica que no haya espacios alrededor del signo =');
  console.error('3. Instala dotenv: npm install dotenv');
  console.error('4. Reinicia la terminal después de modificar .env.local');
  console.error('');
  console.error('📁 Ubicación actual:', __dirname);
  console.error('📁 Directorio de trabajo:', process.cwd());
  console.error('📁 Archivo .env.local esperado en:', process.cwd() + '\\.env.local');
  process.exit(1);
}

// Crear cliente de Supabase con service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixStoragePolicies() {
  try {
    console.log('🔧 Aplicando políticas de almacenamiento en Supabase...');
    
    // Políticas SQL que necesitamos aplicar
    const policies = [
      // Eliminar políticas existentes
      `DROP POLICY IF EXISTS "proposal_attachments_insert_policy" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Authenticated users can read files" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Authenticated users can update own files" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Authenticated users can delete own files" ON storage.objects;`,
      
      // Crear nuevas políticas
      `CREATE POLICY "Allow authenticated users to read files"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (bucket_id = 'proposal-attachments');`,
      
      `CREATE POLICY "Allow authenticated users to upload files"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'proposal-attachments');`,
      
      `CREATE POLICY "Allow authenticated users to update files"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'proposal-attachments');`,
      
      `CREATE POLICY "Allow authenticated users to delete files"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'proposal-attachments');`,
      
      `CREATE POLICY "Allow service role full access"
        ON storage.objects FOR ALL
        TO service_role
        USING (bucket_id = 'proposal-attachments')
        WITH CHECK (bucket_id = 'proposal-attachments');`
    ];
    
    console.log('📝 Aplicando políticas una por una...');
    
    for (let i = 0; i < policies.length; i++) {
      const policy = policies[i];
      console.log(`   Aplicando política ${i + 1}/${policies.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error) {
          console.warn(`   ⚠️  Política ${i + 1} no se pudo aplicar automáticamente`);
          console.warn(`   SQL: ${policy}`);
        } else {
          console.log(`   ✅ Política ${i + 1} aplicada exitosamente`);
        }
      } catch (execError) {
        console.warn(`   ⚠️  No se pudo ejecutar la función exec_sql`);
        console.warn(`   Esto es normal en algunos proyectos de Supabase`);
        break;
      }
    }
    
    console.log('');
    console.log('🎯 Si las políticas no se aplicaron automáticamente, ejecuta manualmente:');
    console.log('');
    console.log('1. Ve al Dashboard de Supabase');
    console.log('2. Abre el SQL Editor');
    console.log('3. Copia y pega este SQL:');
    console.log('');
    
    // Mostrar el SQL completo
    const fullSQL = policies.join('\n\n');
    console.log('```sql');
    console.log(fullSQL);
    console.log('```');
    
    console.log('');
    console.log('4. Ejecuta el SQL');
    console.log('5. Reinicia tu servidor de desarrollo: npm run dev');
    
  } catch (error) {
    console.error('❌ Error aplicando políticas:', error.message);
    console.error('');
    console.error('🔧 Solución manual:');
    console.error('1. Ve al Dashboard de Supabase');
    console.error('2. Abre el SQL Editor');
    console.error('3. Ejecuta las políticas SQL manualmente');
  }
}

async function main() {
  console.log('🚀 Iniciando corrección de políticas de Supabase...');
  console.log('');
  
  await fixStoragePolicies();
  
  console.log('');
  console.log('✅ Proceso completado. Verifica que las políticas se hayan aplicado correctamente.');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixStoragePolicies };
