"use client"

import { useEffect, useState } from "react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircleIcon,
  XCircleIcon,
  TrendingUpIcon,
  UsersIcon,
  BuildingIcon,
} from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
  color: "blue" | "green" | "yellow" | "red" | "purple" | "orange"
}

const MetricCard = ({ title, value, description, icon, trend, color }: MetricCardProps) => {
  const colorClasses = {
    blue: "from-blue-600/20 to-blue-800/30 border-secondary text-blue-300",
    green: "from-green-600/20 to-green-800/30 border-secondary text-green-300",
    yellow: "from-yellow-600/20 to-yellow-800/30 border-secondary text-yellow-300",
    red: "from-red-600/20 to-red-800/30 border-secondary text-red-300",
    purple: "from-purple-600/20 to-purple-800/30 border-secondary text-purple-300",
    orange: "from-orange-600/20 to-orange-800/30 border-secondary text-orange-300",
  }

  const iconColorClasses = {
    blue: "text-blue-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
    purple: "text-purple-400",
    orange: "text-orange-400",
  }

  return (
    <Card className="bg-black border border-secondary hover:shadow-md hover:shadow-secondary transition relative overflow-hidden group">
      <div className={`absolute inset-0 bg-linear-to-br ${colorClasses[color]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
        <div className={`p-2 rounded-lg bg-secondary shadow-lg`}>
          <div className={`h-4 w-4 bg-secondary`}>{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${iconColorClasses[color]}`}>{value}</div>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUpIcon
              className={`h-3 w-3 mr-1 ${trend.isPositive ? "text-green-400" : "text-red-400 rotate-180"}`}
            />
            <span className={`text-xs ${trend.isPositive ? "text-green-400" : "text-red-400"}`}>{trend.value}</span>
            <span className="text-xs text-slate-500 ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



interface WorkGroup {
  id: string
  name: string
  status: string
  totalMembers: string
}

export function DashboardMetrics() {
  const [workGroups, setWorkGroups] = useState<WorkGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const workgroupsRes = await fetch("/api/workgroups")
        const workgroups = await workgroupsRes.json()

        setWorkGroups(workgroups?.length > 0 ? workgroups : [])
      } catch (error) {
        console.error("Error fetching dashboard metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUpIcon className="h-5 w-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white tracking-wide">Dashboard Metrics</h2>
        </div>
        <p className="text-gray-400 text-sm">Loading metrics...</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-black rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  const activeWorkgroups = workGroups.filter(wg => wg.status === "Active").length
  const inactiveWorkgroups = workGroups.filter(wg => wg.status === "Inactive").length
  const totalWorkgroups = workGroups.length
  const totalMembers = workGroups.reduce((sum, wg) => sum + parseInt(wg.totalMembers || "0"), 0)

  const metrics = [
    {
      title: "Total Workgroups",
      value: totalWorkgroups,
      description: "All workgroups and guilds",
      icon: <BuildingIcon className="h-4 w-4" />,
      trend: { value: "+0", isPositive: true },
      color: "blue" as const,
    },
    {
      title: "Active Workgroups",
      value: activeWorkgroups,
      description: "Currently active workgroups",
      icon: <CheckCircleIcon className="h-4 w-4" />,
      trend: { value: "+0", isPositive: true },
      color: "green" as const,
    },
    {
      title: "Inactive Workgroups",
      value: inactiveWorkgroups,
      description: "Currently inactive workgroups",
      icon: <XCircleIcon className="h-4 w-4" />,
      trend: { value: "+0", isPositive: true },
      color: "red" as const,
    },
    {
      title: "Total Members",
      value: totalMembers,
      description: "Community members across all groups",
      icon: <UsersIcon className="h-4 w-4" />,
      trend: { value: "+0", isPositive: true },
      color: "purple" as const,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUpIcon className="h-5 w-5 text-purple-400" />
        <h2 className="text-xl font-bold text-white tracking-wide">Dashboard Metrics</h2>
      </div>
      <p className="text-gray-400 text-sm">Key performance indicators and statistics</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </div>
  )
}
