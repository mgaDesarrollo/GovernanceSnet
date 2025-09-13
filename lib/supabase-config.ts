import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables');
}

// Cliente para operaciones del lado del cliente (browser)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Cliente para operaciones del lado del servidor (con service role)
// Initialize Supabase Admin client only on server side to avoid multiple client instances
import type { SupabaseClient } from '@supabase/supabase-js';
export let supabaseAdmin: SupabaseClient | null = null;
if (typeof window === 'undefined') {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Función helper para obtener el cliente apropiado según el contexto
export function getSupabaseClient(isServerSide: boolean = false) {
  return isServerSide ? supabaseAdmin : supabaseClient;
}

// Configuración del bucket de almacenamiento
export const STORAGE_CONFIG = {
  bucketName: 'proposal-attachments',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    document: ['application/pdf'],
    all: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf']
  }
};
