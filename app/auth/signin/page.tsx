"use client"

import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeftIcon, AlertCircleIcon, RefreshCwIcon } from "lucide-react"
import Link from "next/link"

// Custom Discord Icon Component - Fixed import issue
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push("/dashboard")
      }
    })
  }, [router])

  const testAuthConfig = async () => {
    try {
      const response = await fetch("/api/auth/test")
      const data = await response.json()
      setDebugInfo(data)
      console.log("Auth test result:", data)
    } catch (err) {
      console.error("Auth test failed:", err)
      setDebugInfo({ error: "Failed to test auth configuration" })
    }
  }

  const handleDiscordSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log("Starting Discord sign in...")
      
      const result = await signIn("discord", {
        callbackUrl: "/dashboard",
        redirect: false,
      })

      console.log("Sign in result:", result)

      if (result?.error) {
        setError(result.error)
        console.error("Sign in error:", result.error)
      } else if (result?.ok) {
        console.log("Sign in successful, redirecting...")
        router.push("/dashboard")
      } else {
        console.log("Sign in result:", result)
      }
    } catch (err) {
      const errorMsg = "Error al iniciar sesión. Intenta nuevamente."
      setError(errorMsg)
      console.error("Sign in error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black border-secondary">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <DiscordIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-slate-200">Iniciar Sesión</CardTitle>
          <p className="text-slate-400 text-sm">
            Accede a tu cuenta usando Discord
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleDiscordSignIn}
            disabled={isLoading}
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
          >
            <DiscordIcon className="w-5 h-5 mr-2" />
            {isLoading ? "Conectando..." : "Continuar con Discord"}
          </Button>

          <Button
            onClick={testAuthConfig}
            variant="outline"
            className="w-full"
          >
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Probar Configuración
          </Button>

          {debugInfo && (
            <div className="bg-black p-3 rounded-lg">
              <p className="text-sm text-slate-300 mb-2">Debug Info:</p>
              <pre className="text-xs text-slate-400 overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-slate-500">
              Al continuar, aceptas nuestros términos de servicio y política de privacidad.
            </p>
          </div>

          <div className="pt-4 border-t border-secondary">
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Link>
            </Button>
          </div>

          <div className="text-xs text-slate-500 text-center">
            <p>¿Problemas para iniciar sesión?</p>
            <p className="mt-1">Contacta al administrador del sistema.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 