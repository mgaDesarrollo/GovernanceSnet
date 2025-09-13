"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon, RefreshCwIcon } from "lucide-react"

interface RoleCheck {
  timestamp: string
  session: {
    userId: string
    role: string
    name: string
  }
  database: {
    userId: string
    role: string
    name: string
  }
  consistency: {
    sessionRole: string
    databaseRole: string
    rolesMatch: boolean
    shouldBeSuperAdmin: boolean
    superAdminDiscordId: string
  }
}

export default function MonitorRolePage() {
  const { data: session, status, update } = useSession()
  const [roleChecks, setRoleChecks] = useState<RoleCheck[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkRole = async () => {
    try {
      setError(null)
      const response = await fetch("/api/auth/check-role")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: RoleCheck = await response.json()
      
      setRoleChecks(prev => [data, ...prev.slice(0, 9)]) // Keep last 10 checks
    } catch (err) {
      console.error("Error checking role:", err)
      setError(err instanceof Error ? err.message : "Error checking role")
    }
  }

  const startMonitoring = () => {
    setIsMonitoring(true)
    checkRole()
    const interval = setInterval(checkRole, 2000) // Check every 2 seconds
    
    return () => {
      clearInterval(interval)
      setIsMonitoring(false)
    }
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
  }

  useEffect(() => {
    if (isMonitoring) {
      const cleanup = startMonitoring()
      return cleanup
    }
  }, [isMonitoring])

  const getStatusIcon = (rolesMatch: boolean) => {
    return rolesMatch ? (
      <CheckCircleIcon className="w-5 h-5 text-green-500" />
    ) : (
      <XCircleIcon className="w-5 h-5 text-red-500" />
    )
  }

  const getStatusBadge = (role: string) => {
    const variants = {
      'SUPER_ADMIN': 'bg-purple-600',
      'ADMIN': 'bg-blue-600',
      'CORE_CONTRIBUTOR': 'bg-green-600',
      'CONTRIBUTOR': 'bg-yellow-600'
    }
    
    return (
      <Badge className={`${variants[role as keyof typeof variants] || 'bg-gray-600'} text-white`}>
        {role}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-black border-secondary">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Monitor de Rol en Tiempo Real</span>
              <div className="flex space-x-2">
                <Button 
                  onClick={checkRole}
                  disabled={isMonitoring}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  Verificar Ahora
                </Button>
                <Button 
                  onClick={() => setIsMonitoring(!isMonitoring)}
                  className={isMonitoring ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                >
                  {isMonitoring ? "Detener Monitoreo" : "Iniciar Monitoreo"}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-bold mb-2">Estado Actual:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black p-4 rounded-lg">
                    <h4 className="text-gray-300 font-semibold mb-2">Sesión</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">Rol:</span>
                        {session?.user?.role ? getStatusBadge(session.user.role) : <span className="text-red-400">No disponible</span>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">Usuario:</span>
                        <span className="text-white">{session?.user?.name || 'No disponible'}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black p-4 rounded-lg">
                    <h4 className="text-gray-300 font-semibold mb-2">Estado del Monitoreo</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">Estado:</span>
                        <Badge variant={isMonitoring ? "default" : "secondary"}>
                          {isMonitoring ? "Monitoreando" : "Detenido"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">Checks:</span>
                        <span className="text-white">{roleChecks.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangleIcon className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {roleChecks.length > 0 && (
                <div>
                  <h3 className="text-white font-bold mb-4">Historial de Verificaciones:</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {roleChecks.map((check, index) => (
                      <div key={index} className="bg-black p-4 rounded-lg border border-secondary">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">
                            {new Date(check.timestamp).toLocaleTimeString()}
                          </span>
                          {getStatusIcon(check.consistency.rolesMatch)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-gray-300 font-semibold text-sm mb-2">Sesión</h4>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-400 text-xs">Rol:</span>
                                {getStatusBadge(check.session.role)}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-400 text-xs">Usuario:</span>
                                <span className="text-white text-xs">{check.session.name}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-gray-300 font-semibold text-sm mb-2">Base de Datos</h4>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-400 text-xs">Rol:</span>
                                {getStatusBadge(check.database.role)}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-400 text-xs">Usuario:</span>
                                <span className="text-white text-xs">{check.database.name}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-secondary">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 text-xs">Consistencia:</span>
                            <Badge variant={check.consistency.rolesMatch ? "default" : "destructive"}>
                              {check.consistency.rolesMatch ? "Consistente" : "Inconsistente"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 