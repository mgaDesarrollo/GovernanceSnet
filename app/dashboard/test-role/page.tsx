"use client"

import { useSessionWithRefresh } from "@/hooks/use-session"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function TestRolePage() {
  const { user, refreshSession } = useSessionWithRefresh()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshSession = async () => {
    setIsRefreshing(true)
    try {
      await refreshSession()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Test Role Management</h1>
        <p className="text-gray-400">Test page for role management functionality</p>
      </div>

      <Card className="bg-black border-secondary">
        <CardHeader>
          <CardTitle className="text-white">Current User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <>
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="text-white font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Role</p>
                  <Badge className="bg-purple-500/20 text-purple-300 border-secondary">
                    {user.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <Badge className="bg-green-500/20 text-green-300 border-secondary">
                    {user.status}
                  </Badge>
                </div>
              </div>
              
              <Button 
                onClick={handleRefreshSession}
                disabled={isRefreshing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isRefreshing ? "Refreshing..." : "Refresh Session"}
              </Button>
            </>
          ) : (
            <p className="text-gray-400">No user data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 