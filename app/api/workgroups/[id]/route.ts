import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  _req: NextRequest,
  ctx: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    const { id } = 'then' in (ctx as any).params
      ? await (ctx as { params: Promise<{ id: string }> }).params
      : (ctx as { params: { id: string } }).params;

    if (!id) {
      return NextResponse.json({ error: 'Missing workGroup id' }, { status: 400 });
    }

    const wg = await prisma.workGroup.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: { select: { members: true } },
      },
    });

    if (!wg) {
      return NextResponse.json({ error: 'WorkGroup not found' }, { status: 404 });
    }

    const result = {
      ...wg,
      totalMembers: String(wg._count.members),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching workgroup details:', error);
    return NextResponse.json({ error: 'Failed to fetch workgroup' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = await Promise.resolve(context);
  const workGroupId = params.id;
  const data = await req.json();
  try {
    const updated = await prisma.workGroup.update({
      where: { id: workGroupId },
      data: {
        name: data.name,
        type: data.type,
        dateOfCreation: data.dateOfCreation,
        status: data.status,
        missionStatement: data.missionStatement,
        goalsAndFocus: data.goalsAndFocus,
      }
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: 'No se pudo actualizar el WorkGroup' }, { status: 500 });
  }
} 