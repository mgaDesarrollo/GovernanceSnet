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

    // Verificar si el usuario debería ser super admin
    const superAdminDiscordId = process.env.NEXT_PUBLIC_SUPER_ADMIN_DISCORD_ID
    const shouldBeSuperAdmin = dbUser.id === superAdminDiscordId

    let newRole = dbUser.role

    // Si el usuario es el super admin pero no tiene el rol correcto, corregirlo
    if (shouldBeSuperAdmin && dbUser.role !== "SUPER_ADMIN") {
      newRole = "SUPER_ADMIN"
    }
    // Si el usuario no es super admin pero tiene rol SUPER_ADMIN, cambiarlo a ADMIN
    else if (!shouldBeSuperAdmin && dbUser.role === "SUPER_ADMIN") {
      newRole = "ADMIN"
    }
    // Si el usuario no es super admin y no tiene rol ADMIN, asignarle ADMIN
    else if (!shouldBeSuperAdmin && dbUser.role !== "ADMIN") {
      newRole = "ADMIN"
    }

    // Solo actualizar si el rol necesita cambiar
    if (newRole !== dbUser.role) {
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: { role: newRole },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          image: true
        }
      })

      return NextResponse.json({
        success: true,
        message: `Role updated from ${dbUser.role} to ${newRole}`,
        previousRole: dbUser.role,
        newRole: updatedUser.role,
        shouldBeSuperAdmin,
        superAdminDiscordId
      })
    } else {
      return NextResponse.json({
        success: true,
        message: "Role is already correct",
        currentRole: dbUser.role,
        shouldBeSuperAdmin,
        superAdminDiscordId
      })
    }
  } catch (error) {
    console.error("Error fixing user role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 