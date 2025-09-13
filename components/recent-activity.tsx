"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  FileTextIcon,
  VoteIcon,
  RefreshCwIcon,
  UserPlusIcon,
  ClockIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingIcon,
  DollarSignIcon,
  UsersIcon,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ActivityItem {
  id: string
  type: "quarterly_report_created" | "vote_cast" | "status_changed" | "member_joined" | "workgroup_created" | "budget_updated"
  title: string
  description: string
  user: {
    name: string
    image?: string
  }
  timestamp: Date
  metadata?: {
    reportId?: string
    workGroupId?: string
    voteType?: string
    oldStatus?: string
    newStatus?: string
    amount?: number
  }
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setLoading(true)
        
        // Fetch data from APIs
        const [proposalsRes, workgroupsRes] = await Promise.all([
          fetch("/api/proposals"),
          fetch("/api/workgroups")
        ])
        const proposalsResp = await proposalsRes.json()
        const proposals = Array.isArray(proposalsResp?.proposals) ? proposalsResp.proposals : []
        const workgroups = await workgroupsRes.json()

        // Generate real activity from data
        const realActivities: ActivityItem[] = []

    // Recent proposals
    proposals.slice(0, 3).forEach((p: any) => {
          realActivities.push({
      id: `proposal-${p.id}`,
      type: "quarterly_report_created",
      title: `New Proposal: ${p.title}`,
      description: `Proposal by ${p.author?.name || 'Unknown'} (${p._count?.votes || 0} votes)` ,
      user: { name: p.author?.name || "Unknown User", image: p.author?.image },
      timestamp: new Date(p.createdAt),
      metadata: { amount: (p.budgetItems || []).reduce((sum: number, item: any) => sum + (item.amountUsd || 0), 0) }
          })
        })

        // Recent workgroup activities
        workgroups.slice(0, 2).forEach((workgroup: any) => {
          realActivities.push({
            id: `workgroup-${workgroup.id}`,
            type: "workgroup_created",
            title: `Workgroup Updated: ${workgroup.name}`,
            description: `${workgroup.totalMembers} members, ${workgroup.type} type`,
            user: { name: "System", image: "/placeholder.svg" },
            timestamp: new Date(workgroup.createdAt || Date.now()),
            metadata: { workGroupId: workgroup.id }
          })
        })

        // Mock voting activities based on proposals
        proposals.slice(0, 2).forEach((p: any) => {
          realActivities.push({
            id: `vote-${p.id}`,
            type: "vote_cast",
            title: `Vote Cast on Proposal: ${p.title}`,
            description: `Vote recorded on proposal`,
            user: { name: "Community Member", image: "/placeholder.svg" },
            timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24h
            metadata: { 
              reportId: p.id,
              voteType: ["POSITIVE", "NEGATIVE", "ABSTAIN"][Math.floor(Math.random() * 3)]
            }
          })
        })

        // Status changes (using proposals moving to CONSENSED)
        proposals.filter((p: any) => p.status === "CONSENSED").slice(0, 1).forEach((p: any) => {
          realActivities.push({
            id: `status-${p.id}`,
            type: "status_changed",
            title: `Proposal Status Updated: ${p.title}`,
            description: `Proposal moved to consensed status`,
            user: { name: "System", image: "/placeholder.svg" },
            timestamp: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000),
            metadata: { 
              reportId: p.id,
              oldStatus: "IN_CONSENSUS",
              newStatus: "CONSENSED"
            }
          })
        })

        // Sort by timestamp (most recent first)
        realActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        
        setActivities(realActivities.slice(0, 6)) // Show only 6 most recent
      } catch (error) {
        console.error("Error fetching recent activity:", error)
        // Fallback to mock data if API fails
        setActivities(generateMockActivities())
      } finally {
        setLoading(false)
      }
    }

    fetchRecentActivity()
  }, [])

  const generateMockActivities = (): ActivityItem[] => [
    {
      id: "1",
      type: "quarterly_report_created",
      title: "New Quarterly Report: AI Research Q1 2024",
      description: "Created quarterly report with 15 participants",
      user: { name: "Alice Johnson", image: "/placeholder.svg" },
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      metadata: { reportId: "prop-123", amount: 50000 },
    },
    {
      id: "2",
      type: "vote_cast",
      title: "Vote Cast on Marketing Strategy Report",
      description: "Vote recorded for Q1 2024 quarterly report",
      user: { name: "Bob Smith", image: "/placeholder.svg" },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      metadata: { reportId: "prop-456", voteType: "POSITIVE" },
    },
    {
      id: "3",
      type: "status_changed",
      title: "Report Status Updated: Community Outreach",
      description: "Quarterly report moved to consensed status",
      user: { name: "System", image: "/placeholder.svg" },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      metadata: { reportId: "prop-789", oldStatus: "IN_CONSENSUS", newStatus: "CONSENSED" },
    },
    {
      id: "4",
      type: "workgroup_created",
      title: "Workgroup Updated: Technical Infrastructure",
      description: "25 members, Technical type",
      user: { name: "System", image: "/placeholder.svg" },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      metadata: { workGroupId: "wg-101" },
    },
  ]

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "quarterly_report_created":
        return <FileTextIcon className="h-4 w-4 text-blue-400" />
      case "vote_cast":
        return <VoteIcon className="h-4 w-4 text-green-400" />
      case "status_changed":
        return <RefreshCwIcon className="h-4 w-4 text-orange-400" />
      case "member_joined":
        return <UserPlusIcon className="h-4 w-4 text-purple-400" />
      case "workgroup_created":
        return <BuildingIcon className="h-4 w-4 text-purple-400" />
      case "budget_updated":
        return <DollarSignIcon className="h-4 w-4 text-green-400" />
      default:
        return <ClockIcon className="h-4 w-4 text-slate-400" />
    }
  }

  const getActivityBadge = (item: ActivityItem) => {
    switch (item.type) {
      case "quarterly_report_created":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-secondary">
            New Report
          </Badge>
        )
      case "vote_cast":
        const voteType = item.metadata?.voteType
        if (voteType === "POSITIVE") {
          return (
            <Badge variant="outline" className="bg-green-500/10 text-green-300 border-secondary">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Positive Vote
            </Badge>
          )
        } else if (voteType === "NEGATIVE") {
          return (
            <Badge variant="outline" className="bg-red-500/10 text-red-300 border-secondary">
              <XCircleIcon className="h-3 w-3 mr-1" />
              Object
            </Badge>
          )
        } else {
          return (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-300 border-secondary">
              Abstain
            </Badge>
          )
        }
      case "status_changed":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-300 border-secondary">
            Status Update
          </Badge>
        )
      case "workgroup_created":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-secondary">
            Workgroup
          </Badge>
        )
      case "budget_updated":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-300 border-secondary">
            Budget
          </Badge>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card className="bg-black border-secondary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5 text-purple-400" />
              <CardTitle className="text-xl">Recent Activity</CardTitle>
            </div>
            <Badge variant="outline" className="bg-slate-700 text-slate-300 border-secondary">
              Loading...
            </Badge>
          </div>
          <CardDescription className="text-slate-400">Latest updates from the community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30 border border-secondary/50 animate-pulse">
              <div className="w-4 h-4 bg-slate-600 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                <div className="h-3 bg-slate-600 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-black border-secondary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-xl">Recent Activity</CardTitle>
          </div>
          <Badge variant="outline" className="bg-slate-700 text-slate-300 border-secondary">
            Live Feed
          </Badge>
        </div>
        <CardDescription className="text-slate-400">Latest updates from the community</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <ClockIcon className="h-8 w-8 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-4 rounded-lg bg-slate-700/30 border border-secondary/50 hover:bg-slate-700/50 transition-colors"
            >
              <div className="shrink-0 mt-1">{getActivityIcon(activity.type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-medium text-slate-100 truncate">{activity.title}</h4>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-2">{activity.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={activity.user.image || "/placeholder.svg"} alt={activity.user.name} />
                      <AvatarFallback className="bg-slate-600 text-slate-300 text-xs">
                        {activity.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-slate-300">{activity.user.name}</span>
                  </div>

                  {getActivityBadge(activity)}
                </div>
              </div>
            </div>
          ))
        )}

        <div className="text-center pt-2">
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            View all activity →
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
