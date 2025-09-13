import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log("[TEST] Sesión recibida:", session);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Solo ADMIN y SUPER_ADMIN pueden crear propuestas
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json();
    console.log("[TEST] Body recibido:", JSON.stringify(body, null, 2));
    
    // Crear una propuesta de prueba con datos mínimos
    const testProposal = await prisma.proposal.create({
      data: {
        title: "Test Proposal",
        description: "This is a test proposal to verify database functionality",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días desde ahora
        authorId: session.user.id,
        proposalType: "COMMUNITY_PROPOSAL",
        workGroupIds: [],
      },
    });

    console.log("[TEST] Propuesta de prueba creada:", testProposal);
    
    // Limpiar la propuesta de prueba
    await prisma.proposal.delete({
      where: { id: testProposal.id }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Test proposal creation successful",
      testData: testProposal
    });
    
  } catch (error) {
    console.error("Error in test proposal creation:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
