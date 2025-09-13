import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[Update Role] Starting update for user: ${params.id}`)
    
    const session = await getServerSession(authOptions)
    console.log(`[Update Role] Session:`, session?.user?.email)
    
    // Verificar que el usuario actual sea super admin
    if (!session?.user?.email) {
      console.log(`[Update Role] No session or email`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await prisma.user.findFirst({
      where: { email: session.user.email }
    })

    console.log(`[Update Role] Current user:`, currentUser?.role)

    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
      console.log(`[Update Role] Insufficient permissions`)
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { role } = body
    console.log(`[Update Role] Requested role: ${role}`)

    if (!role || ["USER", "ADMIN", "SUPER_ADMIN"].indexOf(role) === -1) {
      console.log(`[Update Role] Invalid role: ${role}`)
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Verificar que no se esté intentando cambiar el rol de un SUPER_ADMIN
    const userToUpdate = await prisma.user.findUnique({
      where: { id: params.id },
    })

    console.log(`[Update Role] User to update:`, userToUpdate?.role)

    if (!userToUpdate) {
      console.log(`[Update Role] User not found`)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (userToUpdate.role === "SUPER_ADMIN") {
      console.log(`[Update Role] Cannot change Super Admin role`)
      return NextResponse.json({ error: "Cannot change the role of a Super Admin" }, { status: 403 })
    }

    // Actualizar el rol del usuario
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        image: true
      }
    })

    console.log(`[Update Role] User updated successfully:`, updatedUser.role)

    // Si el usuario actualizado es el mismo que está haciendo la petición,
    // devolver un flag para indicar que debe refrescar la sesión
    const shouldRefreshSession = currentUser.id === params.id

    console.log(`[Update Role] Current user: ${currentUser.id}, Target user: ${params.id}, Should refresh: ${shouldRefreshSession}`)

    return NextResponse.json({
      ...updatedUser,
      shouldRefreshSession
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 