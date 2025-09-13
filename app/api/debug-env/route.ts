import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "No configurado",
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID ? "Configurado" : "No configurado",
    DATABASE_URL: process.env.DATABASE_URL ? "Configurado" : "No configurado",
    NODE_ENV: process.env.NODE_ENV || "No configurado",
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET ? "Configurado" : "No configurado",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Configurado" : "No configurado"
  })
} 