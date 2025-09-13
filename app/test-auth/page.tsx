"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertCircleIcon, 
  CheckCircleIcon, 
  UserIcon,
  ShieldIcon,
  MailIcon
} from "lucide-react"
import { useEffect, useState } from "react"

interface DebugInfo {
  NEXTAUTH_URL: string
  DISCORD_CLIENT_ID: string
  DATABASE_URL: string
  NODE_ENV: string
  DISCORD_CLIENT_SECRET: string
  NEXTAUTH_SECRET: string
}

export default function TestAuthPage() {
  const { data: session, status } = useSession()
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loadingDebug, setLoadingDebug] = useState(true)

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        const response = await fetch('/api/debug-env')
        const data = await response.json()
        setDebugInfo(data)
      } catch (error) {
        console.error('Error fetching debug info:', error)
      } finally {
        setLoadingDebug(false)
      }
    }

    fetchDebugInfo()
  }, [])

  const handleSignIn = () => {
    signIn("discord", { callbackUrl: "/dashboard" })
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-200 mb-2">
            Test de Autenticación
          </h1>
          <p className="text-slate-400">
            Página de prueba para diagnosticar problemas de autenticación
          </p>
        </div>

        <Card className="bg-black border-secondary">
          <CardHeader>
            <CardTitle className="text-slate-200">Estado de la Sesión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${status === "loading" ? "bg-yellow-500" : status === "authenticated" ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-slate-300">
                Estado: {status === "loading" ? "Cargando..." : status === "authenticated" ? "Autenticado" : "No autenticado"}
              </span>
            </div>

            {status === "loading" && (
              <Alert>
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  Verificando estado de autenticación...
                </AlertDescription>
              </Alert>
            )}

            {status === "unauthenticated" && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircleIcon className="h-4 w-4" />
                  <AlertDescription>
                    No estás autenticado. Haz clic en el botón de abajo para iniciar sesión.
                  </AlertDescription>
                </Alert>
                
                <Button onClick={handleSignIn} className="w-full">
                  Iniciar Sesión con Discord
                </Button>
              </div>
            )}

            {status === "authenticated" && session && (
              <div className="space-y-4">
                <Alert className="border-secondary bg-green-900/20">
                  <CheckCircleIcon className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-400">
                    ¡Autenticación exitosa!
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-black border-secondary">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">Usuario</span>
                      </div>
                      <p className="text-slate-200 font-medium">{session.user?.name}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black border-secondary">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <MailIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">Email</span>
                      </div>
                      <p className="text-slate-200 font-medium">{session.user?.email}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black border-secondary">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <ShieldIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">Rol</span>
                      </div>
                      <p className="text-slate-200 font-medium">{(session.user as any)?.role || "No definido"}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black border-secondary">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">ID</span>
                      </div>
                      <p className="text-slate-200 font-medium text-sm">{session.user?.id}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex space-x-4">
                  <Button onClick={handleSignOut} variant="outline">
                    Cerrar Sesión
                  </Button>
                  <Button onClick={() => window.location.href = "/dashboard"}>
                    Ir al Dashboard
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-black border-secondary">
          <CardHeader>
            <CardTitle className="text-slate-200">Información de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDebug ? (
              <div className="text-slate-400">Cargando información de debug...</div>
            ) : debugInfo ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">NEXTAUTH_URL:</span>
                  <span className="text-slate-200">{debugInfo.NEXTAUTH_URL}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DISCORD_CLIENT_ID:</span>
                  <span className="text-slate-200">{debugInfo.DISCORD_CLIENT_ID}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DATABASE_URL:</span>
                  <span className="text-slate-200">{debugInfo.DATABASE_URL}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">NODE_ENV:</span>
                  <span className="text-slate-200">{debugInfo.NODE_ENV}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DISCORD_CLIENT_SECRET:</span>
                  <span className="text-slate-200">{debugInfo.DISCORD_CLIENT_SECRET}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">NEXTAUTH_SECRET:</span>
                  <span className="text-slate-200">{debugInfo.NEXTAUTH_SECRET}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Puerto del servidor:</span>
                  <span className="text-slate-200">3002</span>
                </div>
              </div>
            ) : (
              <div className="text-red-400">Error al cargar información de debug</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-black border-secondary">
          <CardHeader>
            <CardTitle className="text-slate-200">URLs de Discord OAuth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">URL de Autorización:</span>
                <span className="text-slate-200 text-xs break-all">
                  https://discord.com/api/oauth2/authorize?client_id=1372614140572729445&scope=identify%20email%20guilds&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Fapi%2Fauth%2Fcallback%2Fdiscord
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">URL de Callback:</span>
                <span className="text-slate-200 text-xs">
                  http://localhost:3002/api/auth/callback/discord
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Portal de Discord:</span>
                <span className="text-slate-200 text-xs">
                  https://discord.com/developers/applications/1372614140572729445/oauth2/general
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 