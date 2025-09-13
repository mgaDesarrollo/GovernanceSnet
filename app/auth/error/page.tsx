"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeftIcon, AlertCircleIcon, RefreshCwIcon } from "lucide-react"
import Link from "next/link"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorDetails = (errorCode: string | null) => {
    switch (errorCode) {
      case "Configuration":
        return {
          title: "Error de Configuración",
          description: "Hay un problema con la configuración del servidor de autenticación.",
          solution: "Contacta al administrador del sistema."
        }
      case "AccessDenied":
        return {
          title: "Acceso Denegado",
          description: "No tienes permisos para acceder a esta aplicación.",
          solution: "Contacta al administrador para obtener acceso."
        }
      case "Verification":
        return {
          title: "Error de Verificación",
          description: "El enlace de verificación ha expirado o ya ha sido usado.",
          solution: "Intenta iniciar sesión nuevamente."
        }
      case "OAuthSignin":
        return {
          title: "Error en OAuth",
          description: "Error al iniciar el proceso de autenticación con Discord.",
          solution: "Verifica la configuración de Discord OAuth en el servidor."
        }
      case "OAuthCallback":
        return {
          title: "Error en Callback de OAuth",
          description: "Error durante el proceso de autenticación con Discord.",
          solution: "Verifica la configuración de redirección en Discord."
        }
      case "OAuthCreateAccount":
        return {
          title: "Error al Crear Cuenta",
          description: "No se pudo crear la cuenta de usuario.",
          solution: "Contacta al administrador del sistema."
        }
      case "EmailCreateAccount":
        return {
          title: "Error al Crear Cuenta",
          description: "No se pudo crear la cuenta de usuario.",
          solution: "Contacta al administrador del sistema."
        }
      case "Callback":
        return {
          title: "Error de Callback",
          description: "Error durante el proceso de autenticación.",
          solution: "Intenta iniciar sesión nuevamente."
        }
      case "OAuthAccountNotLinked":
        return {
          title: "Cuenta No Vinculada",
          description: "Esta cuenta de Discord no está vinculada a un usuario existente.",
          solution: "Contacta al administrador para vincular tu cuenta."
        }
      case "EmailSignin":
        return {
          title: "Error en Email",
          description: "Error al enviar el email de autenticación.",
          solution: "Verifica tu dirección de email e intenta nuevamente."
        }
      case "CredentialsSignin":
        return {
          title: "Error de Credenciales",
          description: "Las credenciales proporcionadas son incorrectas.",
          solution: "Verifica tus credenciales e intenta nuevamente."
        }
      case "SessionRequired":
        return {
          title: "Sesión Requerida",
          description: "Necesitas iniciar sesión para acceder a esta página.",
          solution: "Inicia sesión para continuar."
        }
      default:
        return {
          title: "Error de Autenticación",
          description: "Ocurrió un error durante el proceso de autenticación.",
          solution: "Intenta iniciar sesión nuevamente o contacta al administrador."
        }
    }
  }

  const errorDetails = getErrorDetails(error)

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black border-secondary">
        <CardHeader className="text-center">
          <AlertCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <CardTitle className="text-slate-200">{errorDetails.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{errorDetails.description}</AlertDescription>
          </Alert>
          
          <div className="bg-black p-3 rounded-lg">
            <p className="text-sm text-slate-300 mb-2">Solución:</p>
            <p className="text-sm text-slate-400">{errorDetails.solution}</p>
          </div>

          {error && (
            <div className="bg-black p-3 rounded-lg">
              <p className="text-sm text-slate-300 mb-2">Código de Error:</p>
              <code className="text-xs text-red-400 bg-black px-2 py-1 rounded">
                {error}
              </code>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/api/auth/signin">
                <RefreshCwIcon className="w-4 h-4 mr-2" />
                Intentar Nuevamente
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Link>
            </Button>
          </div>

          <div className="text-xs text-slate-500 text-center mt-4">
            <p>Si el problema persiste, contacta al administrador del sistema.</p>
            <p className="mt-1">Error: {error || "Desconocido"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 