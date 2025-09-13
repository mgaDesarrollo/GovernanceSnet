import { BlobServiceClient, ContainerClient, BlobSASPermissions } from '@azure/storage-blob';

// Configuración
const containerName = 'proposal-attachments';
const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN || '';
const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT || '';

// URLs
const uploadUrl = `https://${storageAccountName}.blob.core.windows.net`;

// Cliente del servicio Blob
const blobServiceClient = new BlobServiceClient(`${uploadUrl}?${sasToken}`);

export class AzureStorageService {
  private containerClient: ContainerClient;

  constructor() {
    this.containerClient = blobServiceClient.getContainerClient(containerName);
  }

  /**
   * Sube un archivo a Azure Blob Storage
   */
  async uploadFile(file: Buffer, fileName: string, contentType: string): Promise<string> {
    try {
      // Crear un nombre único para el blob
      const timestamp = new Date().getTime();
      const blobName = `${timestamp}-${fileName}`;
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      // Subir el archivo
      await blockBlobClient.upload(file, file.length, {
        blobHTTPHeaders: {
          blobContentType: contentType
        }
      });

      // Devolver la URL del archivo
      return blockBlobClient.url;
    } catch (error) {
      console.error('Error uploading file to Azure:', error);
      throw new Error('Failed to upload file to storage');
    }
  }

  /**
   * Elimina un archivo de Azure Blob Storage
   */
  async deleteFile(blobUrl: string): Promise<void> {
    try {
      const blobName = blobUrl.split('/').pop();
      if (!blobName) throw new Error('Invalid blob URL');
      
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.delete();
    } catch (error) {
      console.error('Error deleting file from Azure:', error);
      throw new Error('Failed to delete file from storage');
    }
  }

  /**
   * Genera una URL firmada temporal para acceder al archivo
   */
  async getSignedUrl(blobUrl: string, expiryMinutes: number = 60): Promise<string> {
    try {
      const blobName = blobUrl.split('/').pop();
      if (!blobName) throw new Error('Invalid blob URL');
      
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      const startsOn = new Date();
      const expiresOn = new Date(startsOn);
      expiresOn.setMinutes(startsOn.getMinutes() + expiryMinutes);

      const sasUrl = await blockBlobClient.generateSasUrl({
        permissions: BlobSASPermissions.parse("r"),
        startsOn,
        expiresOn,
      });

      return sasUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate access URL');
    }
  }
}
