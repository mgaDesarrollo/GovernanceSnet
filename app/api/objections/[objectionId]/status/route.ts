import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ objectionId: string }> }
) {
  try {
    const { objectionId } = await params;
    const { status } = await request.json();

    console.log("API: Updating objection status:", objectionId, "to:", status);

    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log("API: Unauthorized - No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar que el usuario es admin o super admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        workgroupMemberships: {
          include: {
            workgroup: true
          }
        }
      }
    });

    if (!user) {
      console.log("API: User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verificar permisos de administrador
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const isWorkgroupAdmin = user.workgroupMemberships.some(membership => 
      membership.role === "ADMIN" || membership.role === "SUPER_ADMIN"
    );

    if (!isAdmin && !isWorkgroupAdmin) {
      console.log("API: Insufficient permissions");
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Validar el estado
    const validStatuses = ["VALIDA", "INVALIDA"];
    if (!validStatuses.includes(status)) {
      console.log("API: Invalid objection status");
      return NextResponse.json({ error: "Invalid objection status" }, { status: 400 });
    }

    // Verificar que la objeción existe
    const objection = await prisma.objection.findUnique({
      where: { id: objectionId },
      include: {
        vote: {
          include: {
            votingRound: {
              include: {
                report: true
              }
            }
          }
        }
      }
    });

    if (!objection) {
      console.log("API: Objection not found");
      return NextResponse.json({ error: "Objection not found" }, { status: 404 });
    }

    // Actualizar el estado de la objeción
    const updatedObjection = await prisma.objection.update({
      where: { id: objectionId },
      data: { 
        status,
        resolvedAt: new Date(),
        resolvedBy: { connect: { id: session.user.id } }
      },
      include: {
        vote: {
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
        resolvedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log("API: Objection status updated successfully");

    return NextResponse.json({ 
      success: true, 
      objection: updatedObjection 
    });
  } catch (error) {
    console.error("Error updating objection status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 