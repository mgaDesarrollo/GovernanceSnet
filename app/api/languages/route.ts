import { NextResponse } from "next/server"
import iso6391 from "iso-639-1"

export async function GET() {
  try {
    const languageList = iso6391.getAllNames().map((name) => {
      const code = iso6391.getCode(name)
      return { code, name }
    })

    // Ordenar alfabéticamente por nombre
    languageList.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json(languageList)
  } catch (error) {
    console.error("Error fetching languages:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
