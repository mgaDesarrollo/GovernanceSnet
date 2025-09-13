export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      where: {
        // Opcional: podrías añadir un filtro para usuarios que han completado un mínimo de perfil
        // O un flag explícito de "mostrar en directorio" si lo implementas en el futuro.
      },
      select: {
        id: true,
        name: true, // Discord username
        fullname: true,
        image: true,
        country: true,
        languages: true,
        status: true,
        skills: true,
        professionalProfile: {
          select: {
            tagline: true,
            linkCv: true,
          },
        },
        workgroups: {
          select: {
            id: true,
            name: true,
          },
          take: 3, // Limitar a 3 workgroups para la tarjeta, por ejemplo
        },
        socialLinks: {
          select: {
            linkedin: true,
            github: true,
            x: true,
            facebook: true,
          },
        },
        // No incluir email u otra información sensible por defecto
      },
      orderBy: {
        name: "asc", // O por 'fullname', 'createdAt', etc.
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching public profiles:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
