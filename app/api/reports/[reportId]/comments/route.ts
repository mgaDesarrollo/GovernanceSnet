import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ error: "Reports API removed" }, { status: 410 });
}