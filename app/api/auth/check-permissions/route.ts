export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Buscar el usuario actualizado en la base de datos
    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        image: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Devolver los datos del usuario con headers para evitar cache
    return NextResponse.json(user, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    })
  } catch (error) {
    console.error("Error checking permissions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 