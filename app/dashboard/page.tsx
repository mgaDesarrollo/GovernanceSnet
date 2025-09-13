"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import {
  UserCogIcon,
  ActivityIcon,
  UsersIcon,
  HomeIcon,
} from "lucide-react"
import type { UserRole, UserAvailabilityStatus } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DashboardMetrics } from "@/components/dashboard-metrics"
import { DashboardCalendar } from "@/components/dashboard-calendar"
import {
  FileTextIcon,
  BarChart3Icon,
  UserIcon,
  ArrowRightIcon,
  Link2
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [appUser, setAppUser] = useState({
    name: "User",
    email: "user@example.com",
    image: "",
    role: "COMMUNITY_MEMBER" as UserRole,
    status: "AVAILABLE" as UserAvailabilityStatus,
  })

  useEffect(() => {
    if (session?.user) {
      setAppUser({
        name: session.user?.name || "User",
        email: session.user?.email || "user@example.com",
        image: session.user?.image || "",
        role: session.user?.role as UserRole || "COMMUNITY_MEMBER",
        status: session.user?.status as UserAvailabilityStatus || "AVAILABLE",
      })
    }
  }, [session])

  const userRole = appUser?.role
  const userStatus = appUser?.status

  const getStatusBadgeInfo = (status?: UserAvailabilityStatus) => {
    switch (status) {
      case "AVAILABLE":
        return {
          text: "Available",
          className: "bg-green-500/20 text-green-300 border-secondary",
          icon: <ActivityIcon className="mr-1 h-3 w-3 text-green-400" />,
        }
      case "BUSY":
        return {
          text: "Busy",
          className: "bg-yellow-500/20 text-yellow-300 border-secondary",
          icon: <ActivityIcon className="mr-1 h-3 w-3 text-yellow-400" />,
        }
      case "VERY_BUSY":
        return {
          text: "Very Busy",
          className: "bg-red-500/20 text-red-300 border-secondary",
          icon: <ActivityIcon className="mr-1 h-3 w-3 text-red-400" />,
        }
      default:
        return {
          text: "Unknown",
          className: "bg-gray-500/20 text-gray-300 border-gray-500/30",
          icon: <ActivityIcon className="mr-1 h-3 w-3 text-gray-400" />,
        }
    }
  }

  const statusInfo = getStatusBadgeInfo(userStatus)

  return (
    <div className="space-y-6 max-w-none">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border border-secondary relative overflow-hidden ">
            <div className="absolute inset-0 bg-linear-to-br from-purple-600/10 to-transparent" />
            <CardContent className="p-6 relative ">
              <div className="flex items-center gap-4 mb-4 ">
                <Avatar className="h-12 w-12 border border-secondary">
                  <AvatarImage src={appUser?.image || undefined} alt={appUser?.name || "User"} />
                  <AvatarFallback className="bg-purple-600/20 text-purple-300 text-lg font-bold">
                    {appUser?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-wide mb-2">
                    Welcome back, {appUser?.name || "User"}!
                  </h1>
                  <p className="text-gray-400 text-sm font-medium">Ready to participate in governance decisions</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant="outline"
                  className="px-3 py-1 border-secondary bg-purple-600/20 text-purple-300 capitalize font-bold"
                >
                  <UserCogIcon className="w-3 h-3 mr-1" />
                  {userRole?.replace("_", " ") || "N/A"}
                </Badge>
                {userStatus && (
                  <Badge variant="outline" className={`px-3 py-1 capitalize font-bold ${statusInfo.className}`}>
                    {statusInfo.icon}
                    {statusInfo.text}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {userRole === "ADMIN" && (
            <Card className="bg-linear-to-br from-purple-900/30 to-purple-800/20 border-secondary h-full  overflow-hidden">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <UserCogIcon className="h-5 w-5 text-purple-300" />
                  </div>
                  <h3 className="text-lg font-bold text-purple-300 tracking-wide">Admin Access</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  Create and manage proposals with full administrative privileges.
                </p>
              </CardContent>
            </Card>
          )}

          {userRole === "CORE_CONTRIBUTOR" && (
            <Card className="bg-linear-to-br from-sky-900/30 to-sky-800/20 border-sky-500/30 h-full  overflow-hidden">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-sky-600/20 rounded-lg">
                    <UsersIcon className="h-5 w-5 text-sky-300" />
                  </div>
                  <h3 className="text-lg font-bold text-sky-300 tracking-wide">Core Contributor</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  Vote on proposals and contribute to governance decisions.
                </p>
              </CardContent>
            </Card>
          )}

          {userRole === "SUPER_ADMIN" && (
            <Card className="bg-linear-to-br from-orange-900/30 to-orange-800/20 border-secondary h-full  overflow-hidden">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-600/20 rounded-lg">
                    <UserCogIcon className="h-5 w-5 text-orange-300" />
                  </div>
                  <h3 className="text-lg font-bold text-orange-300 tracking-wide">Super Admin</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  Full system access with user management capabilities.
                </p>
              </CardContent>
            </Card>
          )}

          {userRole !== "ADMIN" && userRole !== "CORE_CONTRIBUTOR" && userRole !== "SUPER_ADMIN" && (
            <Card className="bg-linear-to-br from-black/50 to-black/30 border-secondary h-full  overflow-hidden">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gray-600/20 rounded-lg">
                    <ActivityIcon className="h-5 w-5 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-300 tracking-wide">Community Member</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  Participate in community discussions and stay informed.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="border border-secondary rounded-lg p-6 relative overflow-hidden ">
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/5 to-pink-500/10 opacity-20"></div>
        <div className="relative">
          <DashboardMetrics />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg overflow-hidden border border-secondary ">
          <div className="p-4 border-b border-secondary flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Quick Actions</h3>
              <p className="text-sm text-slate-400">Quick access to frequently used tasks</p>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => router.push("/dashboard/proposals")}
              className="rounded-lg overflow-hidden cursor-pointer border border-secondary hover:shadow-md hover:shadow-secondary transition"
            >
              <div className="flex items-start gap-2 p-3">
                <div className="p-2 bg-white rounded-md">
                  <FileTextIcon className="h-5 w-5 text-black" />
                </div>
                <div className="flex-1 p-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-black">Current Proposals</h4>
                  </div>
                  <p className="text-sm text-black/80">Browse ongoing proposals</p>
                </div>
              </div>
              <div className="bg-black/30 p-2">
                <div className="flex items-center gap-1 text-xs text-white">
                  <span>Go to</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </div>
              </div>
            </div>

            <Link href="/dashboard/proposals?type=QUARTERLY_REPORT"
              className="bg-indigo-500 rounded-lg overflow-hidden cursor-pointer border border-secondary hover:shadow-md hover:shadow-secondary transition"
            >
              <div className="flex items-start gap-2 p-3">
                <div className="p-2 bg-white rounded-md">
                  <FileTextIcon className="h-5 w-5 text-black" />
                </div>
                <div className="flex-1 p-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-black">Quarterly Reports</h4>
                  </div>
                  <p className="text-sm text-black/80">Review quarterly report proposals</p>
                </div>
              </div>
              <div className="bg-black/30 p-2">
                <div className="flex items-center gap-1 text-xs text-white">
                  <span>Go to</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </div>
              </div>
            </Link>

            {/* <div
              onClick={() => router.push("/dashboard/notifications")}
              className="bg-yellow-500 rounded-lg overflow-hidden cursor-pointer border border-secondary hover:shadow-md hover:shadow-secondary transition"
            >
              <div className="flex items-start gap-2 p-3">
                <div className="p-2 bg-white rounded-md">
                  <BellIcon className="h-5 w-5 text-black" />
                </div>
                <div className="flex-1 p-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-black">Notifications</h4>
                  </div>
                  <p className="text-sm text-black/80">Latest updates and alerts</p>
                </div>
              </div>
              <div className="bg-black/30 p-2">
                <div className="flex items-center gap-1 text-xs text-white">
                  <span>Go to</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </div>
              </div>
            </div> */}

            <div
              onClick={() => router.push("/dashboard/profile/edit")}
              className="bg-green-500 rounded-lg overflow-hidden cursor-pointer border border-secondary hover:shadow-md hover:shadow-secondary transition"
            >
              <div className="flex items-start gap-2 p-3">
                <div className="p-2 bg-white rounded-md">
                  <UserIcon className="h-5 w-5 text-black" />
                </div>
                <div className="flex-1 p-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-black">Update your profile</h4>
                  </div>
                  <p className="text-sm text-black/80">Edit your profile information</p>
                </div>
              </div>
              <div className="bg-black/30 p-2">
                <div className="flex items-center gap-1 text-xs text-white">
                  <span>Go to</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </div>
              </div>
            </div>

            <div
              onClick={() => router.push("/dashboard/analytics")}
              className="bg-sky-500 rounded-lg overflow-hidden cursor-pointer border border-secondary hover:shadow-md hover:shadow-secondary transition"
            >
              <div className="flex items-start gap-2 p-3">
                <div className="p-2 bg-white rounded-md">
                  <BarChart3Icon className="h-5 w-5 text-black" />
                </div>
                <div className="flex-1 p-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-black">Analytics</h4>
                  </div>
                  <p className="text-sm text-black/80">Governance analytics dashboard</p>
                </div>
              </div>
              <div className="bg-black/30 p-2">
                <div className="flex items-center gap-1 text-xs text-white">
                  <span>Go to</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 h-full flex flex-col w-full justify-between items-center gap-5">
          <Link href="https://snet-ambassadors.gitbook.io/home/useful-links/ambassadors-links" target="_blank" referrerPolicy="no-referrer" className="inline-block w-full border border-secondary rounded-lg p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-cyan-500/10 via-cyan-600/5 to-blue-500/10 opacity-20"></div>
            <div className="relative">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Link2 className="h-5 w-5 mr-2 text-cyan-400" />
                Ambassador Program Links
              </h3>
            </div>
          </Link>

          <Link href="https://ambassadorss-organization.gitbook.io/knowledge-base" target="_blank" referrerPolicy="no-referrer" className="inline-block w-full border border-secondary rounded-lg p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-cyan-500/10 via-cyan-600/5 to-blue-500/10 opacity-20"></div>
            <div className="relative">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Link2 className="h-5 w-5 mr-2 text-cyan-400" />
                Knowledge Base
              </h3>
            </div>
          </Link>

          <Link href="https://archive-oracle.netlify.app/submit-meeting-summary#" target="_blank" referrerPolicy="no-referrer" className="inline-block w-full border border-secondary rounded-lg p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-cyan-500/10 via-cyan-600/5 to-blue-500/10 opacity-20"></div>
            <div className="relative">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Link2 className="h-5 w-5 mr-2 text-cyan-400" />
                Summary tool
              </h3>
            </div>
          </Link>

        </div>
      </div>

      <div className=" border border-secondary rounded-lg p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-purple-500/10 via-pink-500/5 to-red-500/10 opacity-20"></div>
        <div className="relative">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 mr-2">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <line x1="16" x2="16" y1="2" y2="6"></line>
              <line x1="8" x2="8" y1="2" y2="6"></line>
              <line x1="3" x2="21" y1="10" y2="10"></line>
            </svg>
            Calendar
          </h3>
          <DashboardCalendar />
        </div>
      </div>
    </div>
  )
}
