"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import Link from "next/link"

export default function TestPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-black border-secondary">
          <CardHeader>
            <CardTitle className="text-slate-200">No Autenticado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 mb-4">No tienes una sesión activa.</p>
            <Button asChild>
              <Link href="/api/auth/signin">Iniciar Sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-black border-secondary">
          <CardHeader>
            <CardTitle className="text-slate-200">Test de Autenticación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-slate-200 font-medium mb-2">Información de Sesión:</h3>
              <pre className="text-sm text-slate-300 overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
            
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-slate-200 font-medium mb-2">Estado de Autenticación:</h3>
              <p className="text-slate-300">Status: {status}</p>
              <p className="text-slate-300">Usuario: {session?.user?.name}</p>
              <p className="text-slate-300">Email: {session?.user?.email}</p>
              <p className="text-slate-300">Rol: {session?.user?.role}</p>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => signOut()}>
                Cerrar Sesión
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Ir al Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 