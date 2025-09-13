export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
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

    // Verificar si el usuario debería ser super admin
    const superAdminDiscordId = process.env.NEXT_PUBLIC_SUPER_ADMIN_DISCORD_ID
    const shouldBeSuperAdmin = dbUser.id === superAdminDiscordId

    return NextResponse.json({
      session: {
        user: session.user,
        expires: session.expires
      },
      database: {
        user: dbUser,
        shouldBeSuperAdmin,
        superAdminDiscordId
      },
      environment: {
        NEXT_PUBLIC_SUPER_ADMIN_DISCORD_ID: superAdminDiscordId,
        NODE_ENV: process.env.NODE_ENV
      }
    })
  } catch (error) {
    console.error("Error debugging user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 