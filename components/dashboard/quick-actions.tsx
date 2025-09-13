"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  FileTextIcon,
  PlusIcon,
  BellIcon,
  UserIcon,
  BarChart3Icon,
  VoteIcon,
  ArrowRightIcon,
  ZapIcon,
  SettingsIcon
} from "lucide-react"
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
        // Fetch pending proposals count
        const proposalsRes = await fetch("/api/proposals?status=pending")
        const proposals = await proposalsRes.json()
        setPendingCount(proposals.length || 0)

  // Reports removed; set to 0 for now
  setVotingCount(0)

        // Mock notification count
        setNotificationCount(Math.floor(Math.random() * 10) + 3)
      } catch (error) {
        console.error("Error fetching counts:", error)
        // Fallback to mock counts
        setPendingCount(3)
        setVotingCount(2)
        setNotificationCount(5)
      }
    }

    fetchCounts()
  }, [])

  const actions = [
    // {
    //   id: "notifications",
    //   title: "Notifications",
    //   description: "Check your latest updates and alerts",
    //   icon: <BellIcon className="h-5 w-5" />,
    //   href: "/dashboard/notifications",
    //   bgColor: "bg-yellow-500",
    //   adminOnly: false,
    //   badge: notificationCount > 0 ? `${notificationCount} New` : undefined,
    // },
    {
      id: "pending-proposals",
      title: "Pending Proposals",
      description: "View proposals awaiting your vote",
      icon: <FileTextIcon className="h-5 w-5" />,
      href: "/dashboard/proposals?filter=pending",
      bgColor: "bg-blue-500",
      adminOnly: false,
      badge: pendingCount > 0 ? `${pendingCount} Pending` : undefined,
    },
    {
      id: "update-profile",
      title: "Update Profile",
      description: "Edit your profile information and preferences",
      icon: <UserIcon className="h-5 w-5" />,
      href: "/dashboard/profile",
      bgColor: "bg-green-500",
      adminOnly: false,
    },
    {
      id: "create-proposal",
      title: "Create Proposal",
      description: "Start a new governance proposal",
      icon: <PlusIcon className="h-5 w-5" />,
      href: "/dashboard/proposals/create",
      bgColor: "bg-orange-500",
      adminOnly: true,
      badge: "Admin",
    },
    {
      id: "analytics",
      title: "View Analytics",
      description: "Comprehensive governance analytics",
      icon: <BarChart3Icon className="h-5 w-5" />,
      href: "/dashboard/analytics",
      bgColor: "bg-blue-600",
      adminOnly: false,
    },
  ]

  const filteredActions = actions.filter(
    (action) => !action.adminOnly || userRole === "ADMIN" || userRole === "SUPER_ADMIN",
  )

  return (
    <div className="border border-amber-500 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-amber-500 p-2 rounded-full">
          <ZapIcon className="h-5 w-5 text-black" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Quick Actions</h3>
          <p className="text-sm text-slate-400">Quick access to common tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredActions.map((action) => (
          <div
            key={action.id}
            className={`${action.bgColor} rounded-lg overflow-hidden cursor-pointer`}
            onClick={() => router.push(action.href)}
          >
            <div className="flex p-2">
              <div className="p-2 rounded-full bg-black/20 flex items-center justify-center">
                <div className="text-black">{action.icon}</div>
              </div>
              <div className="flex-1 p-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-black">{action.title}</h4>
                  {action.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-black/20 rounded-full text-white">
                      {action.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-black/80">
                  {action.description}
                </p>
              </div>
            </div>
            <div className="bg-black p-2">
              <div className="flex items-center gap-1 text-xs text-white">
                <span>Go to</span>
                <ArrowRightIcon className="h-3 w-3" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {userRole !== "ADMIN" && userRole !== "SUPER_ADMIN" && (
        <div className="mt-4 p-3 border border-amber-600/40 rounded-lg bg-black/50">
          <div className="flex items-center gap-2 text-sm text-amber-300">
            <SettingsIcon className="h-4 w-4 text-amber-400" />
            <span>Some actions require admin privileges</span>
          </div>
        </div>
      )}
    </div>
  )
}