export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log("Test Auth - Session:", session);
    console.log("Test Auth - User:", session?.user);
    console.log("Test Auth - Token:", session?.user?.id);
    
    if (!session?.user) {
      return NextResponse.json({ 
        authenticated: false, 
        message: "No session found" 
      });
    }
    
    return NextResponse.json({ 
      authenticated: true, 
      user: session.user,
      message: "User is authenticated" 
    });
  } catch (err) {
    console.error("Test Auth Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ 
      authenticated: false, 
      error: message 
    }, { status: 500 });
  }
}