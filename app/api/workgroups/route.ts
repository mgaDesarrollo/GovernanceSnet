export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")

    let whereClause: any = {}

    // Filtro por búsqueda
    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive"
          }
        },
        {
          missionStatement: {
            contains: search,
            mode: "insensitive"
          }
        },
        {
          type: {
            contains: search,
            mode: "insensitive"
          }
        }
      ]
    }

    // Filtro por estado
    if (status) {
      whereClause.status = status
    }

    const workgroups = await prisma.workGroup.findMany({
      where: whereClause,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },

      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Transformar los datos para incluir totalMembers
    const workgroupsWithStats = workgroups.map(wg => ({
      ...wg,
      totalMembers: wg.members.length.toString()
    }))

    return NextResponse.json(workgroupsWithStats)
  } catch (error) {
    console.error("Error fetching workgroups:", error)
    return NextResponse.json(
      { error: "Failed to fetch workgroups" },
      { status: 500 }
    )
  }
}
