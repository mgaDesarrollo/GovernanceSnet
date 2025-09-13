# Solución para Error RLS en Supabase Storage

## Problema
Al intentar adjuntar archivos a propuestas, se produce el error:
```
Upload failed: new row violates row-level security policy
```

## Causa
El problema se debe a que las políticas de Row Level Security (RLS) en Supabase están configuradas para usuarios autenticados de Supabase Auth, pero la aplicación usa NextAuth para la autenticación.

## Solución

### 1. Configurar Variables de Entorno
Asegúrate de tener estas variables en tu archivo `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio

# NextAuth
NEXTAUTH_SECRET=tu_secreto_de_nextauth
NEXTAUTH_URL=http://localhost:3000
```

### 2. Aplicar Migraciones de Supabase
Ejecuta el script de configuración:

```bash
node scripts/apply-supabase-migrations.js
```

### 3. Configuración Manual (Alternativa)
Si el script automático no funciona, ejecuta manualmente estas consultas SQL en el SQL Editor de Supabase:

```sql
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "proposal_attachments_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own files" ON storage.objects;

-- Crear nuevas políticas que funcionen con NextAuth
CREATE POLICY "Allow authenticated users to read files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'proposal-attachments');

CREATE POLICY "Allow authenticated users to upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'proposal-attachments');

CREATE POLICY "Allow authenticated users to update files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'proposal-attachments');

CREATE POLICY "Allow authenticated users to delete files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'proposal-attachments');

-- Política para el rol de servicio (operaciones administrativas)
CREATE POLICY "Allow service role full access"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'proposal-attachments')
  WITH CHECK (bucket_id = 'proposal-attachments');
```

### 4. Verificar Bucket
Asegúrate de que el bucket `proposal-attachments` existe en Supabase Storage:

1. Ve a **Storage** en el dashboard de Supabase
2. Verifica que existe el bucket `proposal-attachments`
3. Si no existe, créalo manualmente con estas configuraciones:
   - **Name**: `proposal-attachments`
   - **Public**: `false`
   - **File size limit**: `50MB`
   - **Allowed MIME types**: `image/*, application/pdf`

### 5. Configurar RLS
Asegúrate de que RLS esté habilitado en la tabla `storage.objects`:

1. Ve a **Authentication > Policies** en Supabase
2. Busca la tabla `storage.objects`
3. Verifica que RLS esté habilitado
4. Aplica las políticas mencionadas arriba

## Estructura de Archivos Modificados

### Nuevos Archivos
- `lib/supabase-config.ts` - Configuración centralizada de Supabase
- `supabase/migrations/20241220_fix_storage_policies.sql` - Migración de políticas
- `scripts/apply-supabase-migrations.js` - Script de configuración automática
- `supabase/config.toml` - Configuración del CLI de Supabase

### Archivos Modificados
- `lib/storage-service.ts` - Servicio de almacenamiento refactorizado

## Verificación

Después de aplicar la solución:

1. **Reinicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

2. **Intenta subir un archivo** a una propuesta

3. **Verifica los logs** en la consola del navegador y del servidor

4. **Comprueba en Supabase** que los archivos se suben correctamente

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Verifica que todas las variables de entorno estén configuradas
- Reinicia el servidor después de modificar `.env.local`

### Error: "Bucket not found"
- Ejecuta el script de configuración automática
- Crea el bucket manualmente en Supabase Storage

### Error: "Policy violation"
- Verifica que las políticas SQL se hayan aplicado correctamente
- Comprueba que RLS esté habilitado en `storage.objects`

### Error: "Service role key invalid"
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` sea correcta
- Regenera la clave de servicio en Supabase si es necesario

## Notas Importantes

- **Nunca expongas** `SUPABASE_SERVICE_ROLE_KEY` en el cliente
- **Siempre usa** `NEXT_PUBLIC_SUPABASE_ANON_KEY` para operaciones del cliente
- **Usa** `SUPABASE_SERVICE_ROLE_KEY` solo para operaciones del servidor
- **Reinicia el servidor** después de cambios en variables de entorno

## Soporte

Si el problema persiste:

1. Revisa los logs del servidor y del cliente
2. Verifica la configuración de Supabase
3. Comprueba que las políticas estén aplicadas correctamente
4. Consulta la documentación oficial de Supabase Storage
