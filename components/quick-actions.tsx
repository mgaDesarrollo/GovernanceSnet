"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  PlusIcon, 
  FileTextIcon, 
  BellIcon, 
  UserIcon, 
  BarChart3Icon, 
  ZapIcon, 
  ArrowRightIcon,
  VoteIcon,
  ClockIcon,
  SettingsIcon,
  CheckCircleIcon
} from "lucide-react"
import { useRouter } from "next/navigation"
import type { UserRole } from "@/lib/types"

interface QuickActionsProps {
  userRole: UserRole
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const router = useRouter()
  const [pendingCount, setPendingCount] = useState(0)
  const [votingCount, setVotingCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const proposalsRes = await fetch("/api/proposals?status=pending")
        const proposals = await proposalsRes.json()
        setPendingCount(proposals.length || 0)

  // No reports endpoint; optionally derive from proposals
  setVotingCount(0)

        setNotificationCount(Math.floor(Math.random() * 10) + 3)
      } catch {
        setPendingCount(3)
        setVotingCount(2)
        setNotificationCount(5)
      }
    }
    fetchCounts()
  }, [])

  // Define quick actions in desired order
  const actions = [
    {
      id: "pending-proposals",
      title: "Current Proposals",
      description: "View current proposals",
      icon: <FileTextIcon className="h-5 w-5" />,  
      href: "/dashboard/proposals?filter=pending",
      color: "bg-linear-to-br from-blue-600/20 to-blue-800/30 border-blue-500/50 text-blue-300",
      iconColor: "text-blue-400",
      adminOnly: false,
      badge: pendingCount > 0 ? `${pendingCount} Pending` : undefined,
    },
  // removed consensus/reports quick action
    // {
    //   id: "notifications",
    //   title: "Notifications",
    //   description: "View notifications",
    //   icon: <BellIcon className="h-5 w-5" />,  
    //   href: "/dashboard/notifications",
    //   color: "bg-linear-to-br from-yellow-600/20 to-yellow-800/30 border-yellow-500/50 text-yellow-300",
    //   iconColor: "text-yellow-400",
    //   adminOnly: false,
    //   badge: notificationCount > 0 ? `${notificationCount} New` : undefined,
    // },
    {
      id: "analytics",
      title: "Analytics",
      description: "View analytics",
      icon: <BarChart3Icon className="h-5 w-5" />,  
      href: "/dashboard/analytics",
      color: "bg-linear-to-br from-indigo-600/20 to-indigo-800/30 border-indigo-500/50 text-indigo-300",
      iconColor: "text-indigo-400",
      adminOnly: false,
    },
    {
      id: "update-profile",
      title: "Update Your Profile",
      description: "Edit your profile",
      icon: <UserIcon className="h-5 w-5" />,  
      href: "/dashboard/profile",
      color: "bg-linear-to-br from-green-600/20 to-green-800/30 border-green-500/50 text-green-300",
      iconColor: "text-green-400",
      adminOnly: false,
    },
  // removed consensus shortcut
  ]

  const filteredActions = actions.filter(
    (action) => !action.adminOnly || userRole === "ADMIN" || userRole === "SUPER_ADMIN",
  )

  const handleActionClick = (href: string) => {
    router.push(href)
  }

  return (
    <Card className="bg-transparent border-2 border-yellow-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-yellow-600/10 via-amber-600/5 to-orange-600/10 opacity-20"></div>
      <CardHeader className="pb-3 relative">
        <CardDescription className="text-slate-400">Fast access to common tasks</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className={`h-auto p-4 justify-start border-2 ${action.color} hover:scale-[1.02] hover:shadow-lg hover:shadow-${action.iconColor.replace('text-', '')}/20 transition-all duration-200 overflow-hidden relative`}
              onClick={() => handleActionClick(action.href)}
            >
              <div className="flex items-start gap-3 w-full min-w-0">
                <div className={`shrink-0 ${action.iconColor} mt-0.5 p-1.5 rounded-full bg-transparent`}>{action.icon}</div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <h4 className="font-medium text-sm truncate flex-1">{action.title}</h4>
                    {action.badge && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0.5 bg-slate-700/50 border-secondary shrink-0"
                      >
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs opacity-80 mb-2 line-clamp-2">{action.description}</p>
                  <div className="flex items-center gap-1 text-xs opacity-60">
                    <span>Go to</span>
                    <ArrowRightIcon className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {userRole !== "ADMIN" && userRole !== "SUPER_ADMIN" && (
          <div className="mt-4 p-3 bg-linear-to-br from-amber-800/20 to-red-800/20 border border-amber-600/40 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-amber-300">
              <SettingsIcon className="h-4 w-4 text-amber-400" />
              <span>Some actions require admin privileges</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
