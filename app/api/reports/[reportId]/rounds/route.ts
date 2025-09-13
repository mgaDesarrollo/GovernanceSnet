import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ error: "Reports API removed" }, { status: 410 });
}