import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Obtener el usuario actual de la base de datos
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        image: true
      }
    })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 })
    }

    console.log(`[Refresh Token] User ${dbUser.name} has role: ${dbUser.role}`)

    return NextResponse.json({
      success: true,
      user: dbUser,
      message: "Token should be refreshed with correct role"
    })
  } catch (error) {
    console.error("Error refreshing token:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 