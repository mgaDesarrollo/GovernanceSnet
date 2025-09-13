import { createClient } from '@supabase/supabase-js';

// Verificar y obtener las variables de entorno de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Inicializar el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export class StorageService {
  private bucketName = 'proposal-attachments';
  private userId?: string;

  constructor(userId?: string) {
    this.userId = userId;
    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      // Verificar si el bucket existe
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === this.bucketName);

      if (!bucketExists) {
        // Crear el bucket si no existe
        const { error: createError } = await supabase.storage.createBucket(this.bucketName, {
          public: false,
          allowedMimeTypes: this.allowedTypes.all
        });

        if (createError) throw createError;
      }

  // The policies are now managed through migrations, no need to create them here
  console.log('Bucket initialization completed');
    } catch (error) {
      console.error('Error initializing bucket:', error);
    }
  }
  
  private allowedTypes = {
    'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    'document': ['application/pdf'],
    'all': ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf']
  };

  /**
   * Valida el tipo de archivo
   */
  private validateFileType(file: File, type: 'image' | 'document' | 'all' = 'all'): void {
    if (!this.allowedTypes[type].includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${this.allowedTypes[type].join(', ')}`);
    }
  }

  /**
   * Valida el tamaño del archivo
   */
  private validateFileSize(file: File, maxSize: number = 5 * 1024 * 1024): void {
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
    }
  }

  /**
   * Sube un archivo a Supabase Storage
   */
  async uploadFile(file: File, options: {
    type?: 'image' | 'document' | 'all',
    maxSize?: number,
    folder?: string
  } = {}): Promise<{ url: string; path: string }> {
    try {
      let userId = this.userId;

      if (!userId) {
        // Check for client-side authentication if userId wasn't provided in constructor
        const { data: { user: currentUser }, error: sessionError } = await supabase.auth.getUser();
        
        if (sessionError) {
          console.error('Authentication error:', sessionError);
          throw new Error(`Authentication error: ${sessionError.message}`);
        }
        
        if (!currentUser) {
          console.error('No authenticated user found');
          throw new Error('No authenticated user found');
        }

        userId = currentUser.id;
      }

      console.log('Starting file upload with options:', { 
        type: options.type,
        maxSize: options.maxSize,
        folder: options.folder,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        userId
      });

      const { type = 'all', maxSize = 5 * 1024 * 1024, folder = '' } = options;
      
      // Validaciones
      this.validateFileType(file, type);
      this.validateFileSize(file, maxSize);

      // Crear un nombre único para el archivo
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const fileName = `${timestamp}-${sanitizedName}`;
      
      // Asegurar que la ruta del archivo incluya el ID del usuario
      const filePath = folder ? `${userId}/${folder}/${fileName}` : `${userId}/${fileName}`;
      
      // LOGS DE DEPURACIÓN
      console.log('Depuración Supabase Storage:');
      console.log('userId:', userId);
      console.log('filePath:', filePath);
      console.log('bucketName:', this.bucketName);
      console.log('fileName:', fileName);
      console.log('fileType:', file.type);
      console.log('fileSize:', file.size);

      // Subir el archivo
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file);

      if (error) throw error;

      // Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath
      };
    } catch (error: any) {
      console.error('Error uploading file:', {
        error,
        message: error.message,
        supabaseError: error.error,
        statusCode: error.statusCode
      });
      
      // Verificar las credenciales de Supabase
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase credentials');
      }

      // Propagar el mensaje de error específico
      if (error.message) {
        throw new Error(`Upload failed: ${error.message}`);
      } else {
        throw new Error('Failed to upload file');
      }
    }
  }

  /**
   * Elimina un archivo de Supabase Storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Obtiene una URL temporal firmada para un archivo
   */
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate access URL');
    }
  }
}
