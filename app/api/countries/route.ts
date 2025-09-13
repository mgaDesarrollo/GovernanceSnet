import { NextResponse } from "next/server"
import countries from "i18n-iso-countries"
import enLocale from "i18n-iso-countries/langs/en.json" // Para nombres de países en inglés

// Registrar el locale
countries.registerLocale(enLocale)

export async function GET() {
  try {
    // Obtener los nombres de los países en inglés
    const countryObjects = countries.getNames("en", { select: "official" })
    const countryList = Object.entries(countryObjects).map(([code, name]) => ({
      code,
      name,
    }))

    // Ordenar alfabéticamente por nombre
    countryList.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json(countryList)
  } catch (error) {
    console.error("Error fetching countries:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
