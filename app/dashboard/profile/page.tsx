"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  UserIcon, 
  MailIcon, 
  ShieldIcon, 
  CalendarIcon,
  EditIcon,
  ArrowLeftIcon
} from "lucide-react"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/api/auth/signin")
    return null
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">No session found</h1>
            <Button onClick={() => router.push("/api/auth/signin")}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const user = session.user as any

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">
              User Profile
            </h1>
            <p className="text-gray-400 font-medium">
              Manage your account information and settings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-secondary overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="bg-purple-600 text-white text-xl font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white tracking-wide">
                      {user.name || "Unknown User"}
                    </h2>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-purple-400 border-secondary">
                        {user.role || "No role"}
                      </Badge>
                      <Badge variant="outline" className="text-green-400 border-secondary">
                        {user.status || "Unknown"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="border-secondary" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="min-w-5 min-h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Display Name</p>
                        <p className="text-white font-bold">{user.name || "Not set"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ShieldIcon className="min-w-5 min-h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 font-medium">User Role</p>
                        <p className="text-white font-bold">{user.role || "Not set"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="min-w-5 min-h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 font-medium">User ID</p>
                        <p className="text-white font-bold text-sm">{user.id || "Not set"}</p>
                      </div>
                    </div>
                </div>

                <Separator className="border-secondary" />

                {/* Actions */}
                <div className="flex space-x-4">
                  <Button 
                    onClick={() => router.push("/dashboard/profile/edit")}
                    className="bg-purple-600 hover:bg-purple-700 font-bold"
                  >
                    <EditIcon className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => router.push("/dashboard/user-management")}
                    className="text-gray-400 hover:text-white border-secondary hover:border-gray-500"
                  >
                    <ShieldIcon className="w-4 h-4 mr-2" />
                    User Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card className="bg-gray-900 border-secondary overflow-hidden">
              <CardHeader>
                <CardTitle className="text-white">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Status</span>
                  <Badge variant="outline" className="text-green-400 border-secondary">
                    Active
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Role</span>
                  <Badge variant="outline" className="text-purple-400 border-secondary">
                    {user.role || "Unknown"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Member Since</span>
                  <span className="text-white font-bold">Active</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-900 border-secondary overflow-hidden">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* View Consensus removed */}
                
                <Button 
                  variant="outline" 
                  className="w-full text-gray-400 hover:text-white border-secondary hover:border-gray-500"
                  onClick={() => router.push("/dashboard/proposals")}
                >
                  View Proposals
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full text-gray-400 hover:text-white border-secondary hover:border-gray-500"
                  onClick={() => router.push("/dashboard/analytics")}
                >
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 