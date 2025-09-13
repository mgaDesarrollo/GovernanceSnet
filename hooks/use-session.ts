"use client"

import { useSession, signOut } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabase-config"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  image?: string
}

export function useSessionWithRefresh() {
  const { data: session, status, update } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  // Track last token we attempted to sync to avoid repeated calls on Fast Refresh/StrictMode
  const lastTokenRef = useRef<string | null>(null)

  // Función para actualizar la sesión manualmente
  const refreshSession = async () => {
    try {
      console.log("Refreshing session...")
      
      // Actualizar la sesión de NextAuth
      await update()
      
      // Recargar la página para aplicar los cambios
      router.refresh()
    } catch (error) {
      console.error("Error refreshing session:", error)
    }
  }

  // Función para verificar permisos de administrador (solo cuando se solicite)
  const checkAdminPermissions = async () => {
    try {
      const response = await fetch("/api/auth/check-permissions", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        return userData
      }
    } catch (error) {
      console.error("Error checking permissions:", error)
    }
    return null
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser(session.user as User)
      setLoading(false)
    } else if (status === "unauthenticated") {
      setUser(null)
      setLoading(false)
    }
  }, [session, status])

  useEffect(() => {
    const syncSupabase = async () => {
      const syncFlag = String(process.env.NEXT_PUBLIC_SUPABASE_SYNC || "").toLowerCase()
      const explicitlyOff = syncFlag === "0" || syncFlag === "false"
      const explicitlyOn = syncFlag === "1" || syncFlag === "true"
      const isProd = process.env.NODE_ENV === "production"

      // Default: only sync in production. Allow override with NEXT_PUBLIC_SUPABASE_SYNC=1 to force in dev.
      if (explicitlyOff) return
      if (!isProd && !explicitlyOn) return
      if (!(status === "authenticated" && session?.accessToken)) return

      // Avoid repeated attempts for the same token (StrictMode double-invoke, Fast Refresh)
      if (lastTokenRef.current === session.accessToken) return
      lastTokenRef.current = session.accessToken

      try {
        await supabaseClient.auth.signInWithIdToken({
          provider: "discord",
          token: session.accessToken,
        })
      } catch (err) {
        // Swallow errors quietly unless explicitly enabled in dev
        if (explicitlyOn && !isProd) {
          console.warn("Supabase auth sync failed (dev)", err)
        }
      }
    };
    syncSupabase();
  }, [status, session?.accessToken]);

  return {
    user,
    loading,
    refreshSession,
    checkAdminPermissions,
    signOut: () => signOut({ callbackUrl: "/" })
  }
}