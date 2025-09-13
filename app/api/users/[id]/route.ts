import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

// Obtener información completa de un usuario
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    // Obtener información completa del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true, // Discord username
        fullname: true,
        image: true,
        email: true,
        walletAddress: true,
        country: true,
        languages: true,
        status: true,
        skills: true,
        role: true,
        createdAt: true,
        professionalProfile: {
          select: {
            tagline: true,
            bio: true,
            experience: true,
            linkCv: true,
          },
        },
        socialLinks: {
          select: {
            facebook: true,
            linkedin: true,
            github: true,
            x: true,
          },
        },
        workgroups: {
          select: {
            id: true,
            name: true
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Actualizar el rol de un usuario
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: userId } = await params
    const body = await request.json()
    const { role, status } = body

    // Si se está actualizando el rol, verificar permisos de SUPER_ADMIN
    if (role && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verificar que no se está intentando cambiar el rol de un SUPER_ADMIN
    if (role) {
      const userToUpdate = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!userToUpdate) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      if (userToUpdate.role === "SUPER_ADMIN") {
        return NextResponse.json({ error: "Cannot change the role of a Super Admin" }, { status: 403 })
      }
    }

    // Preparar los datos a actualizar
    const updateData: any = {}
    if (role) updateData.role = role
    if (status !== undefined) updateData.status = status

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        role: true,
        status: true,
        image: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Eliminar un usuario
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const userId = params.id

    // Verificar que no se está intentando eliminar un SUPER_ADMIN
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (userToDelete.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "Cannot delete a Super Admin" }, { status: 403 })
    }

    // Eliminar el usuario
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
