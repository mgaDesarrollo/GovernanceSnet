import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await prisma.user.findFirst({
      where: { email: session.user.email }
    })

    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Buscar el usuario específico
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        image: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      targetUser,
      currentUser: {
        id: currentUser.id,
        role: currentUser.role,
        email: currentUser.email
      },
      canUpdate: currentUser.role === "SUPER_ADMIN" && targetUser.role !== "SUPER_ADMIN"
    })
  } catch (error) {
    console.error("Error debugging user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 