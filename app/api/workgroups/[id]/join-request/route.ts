import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { message, userId } = await req.json()
  if (!userId) {
    return NextResponse.json({ error: "No userId" }, { status: 400 })
  }
  const { id: workGroupId } = await params
  const joinRequest = await prisma.workGroupJoinRequest.create({
    data: {
      userId,
      workGroupId,
      status: "pending",
      message,
    }
  })
  return NextResponse.json(joinRequest)
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: workGroupId } = await params;
  const joinRequests = await prisma.workGroupJoinRequest.findMany({
    where: { workGroupId, status: "pending" },
    include: { user: true }
  });
  return NextResponse.json(joinRequests);
} 