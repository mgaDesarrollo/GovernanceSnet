export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    console.log("[Auth Test] Testing NextAuth configuration...")
    
    // Check environment variables
    const envCheck = {
      DISCORD_CLIENT_ID: !!process.env.DISCORD_CLIENT_ID,
      DISCORD_CLIENT_SECRET: !!process.env.DISCORD_CLIENT_SECRET,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      DATABASE_URL: !!process.env.DATABASE_URL,
    }
    
    console.log("[Auth Test] Environment check:", envCheck)
    
    // Try to get session
    const session = await getServerSession(authOptions)
    
    console.log("[Auth Test] Session check:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userName: session?.user?.name,
      userRole: session?.user?.role
    })
    
    return NextResponse.json({
      status: "ok",
      environment: envCheck,
      session: session ? {
        userId: session.user?.id,
        userName: session.user?.name,
        userRole: session.user?.role,
        userEmail: session.user?.email
      } : null,
      message: "NextAuth configuration test completed"
    })
    
  } catch (error) {
    console.error("[Auth Test] Error:", error)
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      message: "NextAuth configuration test failed"
    }, { status: 500 })
  }
} 