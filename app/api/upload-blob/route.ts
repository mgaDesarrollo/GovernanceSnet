export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { StorageService } from "@/lib/storage-service"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verificar que es ADMIN o SUPER_ADMIN
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const uploadType = formData.get("uploadType") as string || "proposal"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const storageService = new StorageService(session.user.id)

    // Configurar opciones según el tipo de subida
    const uploadOptions: {
      type: 'image' | 'document' | 'all'
      maxSize: number
      folder?: string
    } = {
      type: 'all',
      maxSize: 5 * 1024 * 1024 // 5MB por defecto
    }

    switch (uploadType) {
      case "avatar":
        uploadOptions.type = "image"
        uploadOptions.maxSize = 2 * 1024 * 1024 // 2MB para avatares
        uploadOptions.folder = `users/${session.user.id}/avatars`
        break
      case "cv":
        uploadOptions.type = "document"
        uploadOptions.maxSize = 10 * 1024 * 1024 // 10MB para CVs
        uploadOptions.folder = `users/${session.user.id}/documents`
        break
      case "proposal":
        uploadOptions.type = "all"
        uploadOptions.folder = `proposals/${session.user.id}`
        break
      default:
        return NextResponse.json({ error: "Invalid upload type" }, { status: 400 })
    }

    // Subir archivo
    const result = await storageService.uploadFile(file, uploadOptions)

    // Generar URL firmada para acceso inmediato
    const signedUrl = await storageService.getSignedUrl(result.path)

    return NextResponse.json({
      success: true,
      url: result.url,
      signedUrl,
      path: result.path
    })
  } catch (error: any) {
    console.error("Error uploading file:", {
      message: error.message,
      stack: error.stack,
      error
    });
    
    // Si es un error de Supabase, loguear los detalles
    if (error.error) {
      console.error("Supabase error details:", error.error);
    }
    
    return NextResponse.json({ 
      error: error.message || "Failed to upload file",
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        error: error.error
      } : undefined
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get("path")

    if (!filePath) {
      return NextResponse.json({ error: "No file path provided for deletion" }, { status: 400 })
    }

    const storageService = new StorageService()
    await storageService.deleteFile(filePath)

    return NextResponse.json({ 
      success: true, 
      message: "File deleted successfully" 
    })
  } catch (error: any) {
    console.error("Error deleting file:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to delete file" 
    }, { status: 500 })
  }
}
