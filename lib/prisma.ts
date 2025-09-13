import { PrismaClient } from "@prisma/client"

// Declaramos una variable global para almacenar la instancia de Prisma
declare global {
  var prisma: PrismaClient | undefined
}

// Creamos una instancia de Prisma, reutilizando la existente en desarrollo
// o creando una nueva en producción.
let prisma: PrismaClient

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export { prisma }
