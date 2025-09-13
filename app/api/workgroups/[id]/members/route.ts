import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: workGroupId } = await params
    const members = await prisma.workGroupMember.findMany({
      where: { workGroupId },
      select: {
        id: true,
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    return NextResponse.json(members)
  } catch (error) {
    console.error("Error listando miembros del workgroup:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
} 