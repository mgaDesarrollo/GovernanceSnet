import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { userId, role } = await req.json()
  if (!userId) {
    return NextResponse.json({ error: "No userId" }, { status: 400 })
  }
  const { id: workGroupId } = await context.params
  // Evita duplicados
  const exists = await prisma.workGroupMember.findFirst({
    where: { userId, workGroupId }
  })
  if (exists) {
    return NextResponse.json({ error: "Ya es miembro" }, { status: 409 })
  }
  const member = await prisma.workGroupMember.create({
    data: {
      userId,
      workGroupId,
      role: role || "member",
    }
  })
  return NextResponse.json(member)
} 