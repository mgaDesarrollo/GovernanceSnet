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

    const count = await prisma.user.count({
      where: {},
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error fetching user count:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
