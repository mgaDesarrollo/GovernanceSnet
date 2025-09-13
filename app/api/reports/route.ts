import { NextResponse } from "next/server"

// Reports API removed
export async function GET() {
  return NextResponse.json({ error: "Reports API removed" }, { status: 410 })
}