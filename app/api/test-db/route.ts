import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Prueba simple de conexión
    const userCount = await prisma.user.count()
    
    return NextResponse.json({ 
      success: true, 
      message: "Database connection successful",
      userCount 
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
