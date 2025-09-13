"use client"

import React, { useState, useEffect } from "react"
import { useSessionWithRefresh } from "@/hooks/use-session"
import { 
  UsersIcon, 
  UserCogIcon, 
  ShieldIcon,
  CrownIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  image?: string
}

export default function UserManagementPage() {
  const { user: currentUser, refreshSession } = useSessionWithRefresh()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    console.log(`[User Management] Updating role for user ${userId} to ${newRole}`)
    setUpdatingUser(userId)
    setError("")

    try {
      const response = await fetch(`/api/users/${userId}/update-role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      })

      console.log(`[User Management] Response status: ${response.status}`)

      if (response.ok) {
        const data = await response.json()
        console.log(`[User Management] Success response:`, data)
        
        // Actualizar la lista de usuarios
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: data.role } : user
        ))

        // Si el usuario actualizado es el mismo que está logueado, refrescar la sesión
        if (currentUser?.id === userId) {
          console.log("Refreshing session due to role change...")
          await refreshSession()
        }
      } else {
        const data = await response.json()
        console.log(`[User Management] Error response:`, data)
        setError(data.error || "Error updating user role")
      }
    } catch (error) {
      console.error(`[User Management] Network error:`, error)
      setError("Network error")
    } finally {
      setUpdatingUser(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <CrownIcon className="w-4 h-4 text-yellow-400" />
      case "ADMIN":
        return <ShieldIcon className="w-4 h-4 text-blue-400" />
      default:
        return <UserIcon className="w-4 h-4 text-gray-400" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-secondary">Super Admin</Badge>
      case "ADMIN":
        return <Badge className="bg-blue-500/20 text-blue-300 border-secondary">Admin</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">User</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge className="bg-green-500/20 text-green-300 border-secondary">Available</Badge>
      case "BUSY":
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-secondary">Busy</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">Unknown</Badge>
    }
  }

  if (loading) {
    return <LoadingSkeleton type="page" />
  }

  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You need Super Admin permissions to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-transparent border border-secondary rounded-xl flex items-center justify-center shadow-lg">
            <UserCogIcon className="w-6 h-6"  />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">
              User Management
            </h1>
            <p className="text-gray-400 font-medium">
              Manage user roles and permissions
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-black border-secondary overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UsersIcon className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400 font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-secondary overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CrownIcon className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400 font-medium">Super Admins</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(u => u.role === "SUPER_ADMIN").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-secondary overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShieldIcon className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400 font-medium">Admins</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(u => u.role === "ADMIN").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-secondary overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400 font-medium">Core Contributors</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(u => u.role === "CORE_CONTRIBUTOR").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-900/20 border-secondary overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircleIcon className="w-5 h-5 text-red-400" />
              <p className="text-red-300">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card className="bg-black border-secondary overflow-hidden">
        <CardHeader>
          <h3 className="text-xl font-bold text-white">Manage User Roles</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map((user) => (
              <div 
                key={user.id} 
                className="rounded-md group relative bg-black border border-secondary/50 p-6 hover:border-secondary hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 backdrop-blur-xs font-mac flex flex-col h-full"
              >
                {/* User Avatar and Role Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    {getStatusBadge(user.status)}
                  </div>
                </div>

                {/* User Info */}
                <div className="mb-4 flex-1">
                  <h3 className="text-lg font-bold text-white line-clamp-2 mb-2 group-hover:text-purple-200 transition-colors">
                    {user.name}
                  </h3>

                  {/* Role Badge */}
                  <div className="mb-3">
                    {getRoleBadge(user.role)}
                  </div>
                </div>

                {/* Role Selector */}
                <div className="border-t border-secondary/50 pt-4 mt-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Change Role:</span>
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      disabled={updatingUser === user.id}
                      className="bg-black border border-secondary rounded-none px-3 py-2 text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                  
                  {/* Loading Indicator */}
                  {updatingUser === user.id && (
                    <div className="flex items-center justify-center mt-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                      <span className="text-xs text-slate-400 ml-2">Updating...</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
