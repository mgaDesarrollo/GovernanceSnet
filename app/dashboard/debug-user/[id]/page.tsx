"use client"

import { useSessionWithRefresh } from "@/hooks/use-session"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

interface DebugData {
  targetUser: {
    id: string
    name: string
    email: string
    role: string
    status: string
    image?: string
    createdAt: string
    updatedAt: string
  }
  currentUser: {
    id: string
    role: string
    email: string
  }
  canUpdate: boolean
}

export default function DebugUserPage() {
  const { user: currentUser } = useSessionWithRefresh()
  const params = useParams()
  const userId = params.id as string
  const [debugData, setDebugData] = useState<DebugData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (userId) {
      fetchDebugData()
    }
  }, [userId])

  const fetchDebugData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/debug-user/${userId}`)
      
      if (response.ok) {
        const data = await response.json()
        setDebugData(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Error fetching debug data")
      }
    } catch (error) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const testRoleUpdate = async (newRole: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/update-role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Role update successful:", data)
        // Recargar los datos de debug
        await fetchDebugData()
      } else {
        const errorData = await response.json()
        console.log("❌ Role update failed:", errorData)
        setError(errorData.error || "Error updating role")
      }
    } catch (error) {
      console.error("❌ Network error:", error)
      setError("Network error")
    }
  }

  if (loading) {
    return <div className="text-white">Loading...</div>
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="bg-red-900/20 border-secondary">
          <CardContent className="p-4">
            <h2 className="text-red-300 font-bold">Error</h2>
            <p className="text-red-300">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!debugData) {
    return <div className="text-white">No debug data available</div>
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Debug User: {userId}</h1>
        <p className="text-gray-400">Debugging user information and permissions</p>
      </div>

      <Card className="bg-black border-secondary">
        <CardHeader>
          <CardTitle className="text-white">Target User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">ID</p>
              <p className="text-white font-medium">{debugData.targetUser.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Name</p>
              <p className="text-white font-medium">{debugData.targetUser.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-white font-medium">{debugData.targetUser.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Role</p>
              <Badge className="bg-purple-500/20 text-purple-300 border-secondary">
                {debugData.targetUser.role}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <Badge className="bg-green-500/20 text-green-300 border-secondary">
                {debugData.targetUser.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-400">Can Update</p>
              <Badge className={debugData.canUpdate ? "bg-green-500/20 text-green-300 border-secondary" : "bg-red-500/20 text-red-300 border-secondary"}>
                {debugData.canUpdate ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black border-secondary">
        <CardHeader>
          <CardTitle className="text-white">Current User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">ID</p>
              <p className="text-white font-medium">{debugData.currentUser.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-white font-medium">{debugData.currentUser.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Role</p>
              <Badge className="bg-purple-500/20 text-purple-300 border-secondary">
                {debugData.currentUser.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {debugData.canUpdate && (
        <Card className="bg-black border-secondary">
          <CardHeader>
            <CardTitle className="text-white">Test Role Update</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button 
                onClick={() => testRoleUpdate("USER")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Set to USER
              </Button>
              <Button 
                onClick={() => testRoleUpdate("ADMIN")}
                className="bg-green-600 hover:bg-green-700"
              >
                Set to ADMIN
              </Button>
              <Button 
                onClick={() => testRoleUpdate("SUPER_ADMIN")}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Set to SUPER_ADMIN
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 