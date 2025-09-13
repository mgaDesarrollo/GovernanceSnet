"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ClockIcon, AlertCircleIcon, CheckCircleIcon, UsersIcon, ArrowRightIcon } from "lucide-react"
import { formatDistanceToNow, format, isToday, isTomorrow, addDays } from "date-fns"

interface CalendarEvent {
  id: string
  title: string
  description: string
  date: Date
  type: "proposal_deadline" | "meeting" | "announcement" | "voting_end"
  priority: "high" | "medium" | "low"
}

const EventCard = ({ event }: { event: CalendarEvent }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "proposal_deadline":
        return <ClockIcon className="h-4 w-4" />
      case "meeting":
        return <UsersIcon className="h-4 w-4" />
      case "announcement":
        return <AlertCircleIcon className="h-4 w-4" />
      case "voting_end":
        return <CheckCircleIcon className="h-4 w-4" />
      default:
        return <CalendarIcon className="h-4 w-4" />
    }
  }

  const getEventColor = (type: string, priority: string) => {
    if (priority === "high") return "bg-red-500/10 border-secondary text-red-300"
    if (type === "proposal_deadline") return "bg-yellow-500/10 border-secondary text-yellow-300"
    if (type === "meeting") return "bg-blue-500/10 border-secondary text-blue-300"
    if (type === "voting_end") return "bg-green-500/10 border-secondary text-green-300"
    return "bg-purple-500/10 border-secondary text-purple-300"
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    return format(date, "MMM dd")
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: "bg-red-500/20 text-red-300 border-secondary",
      medium: "bg-yellow-500/20 text-yellow-300 border-secondary",
      low: "bg-green-500/20 text-green-300 border-secondary",
    }
    return colors[priority as keyof typeof colors]
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-black/50 border border-secondary hover:border-secondary transition-colors">
      <div className={`p-2 rounded-lg shrink-0 ${getEventColor(event.type, event.priority)}`}>
        {getEventIcon(event.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-slate-100 text-sm truncate">{event.title}</h4>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className={`text-xs px-1 py-0 ${getPriorityBadge(event.priority)}`}>
              {event.priority}
            </Badge>
            <span className="text-xs text-slate-400">{getDateLabel(event.date)}</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{event.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-500">{formatDistanceToNow(event.date, { addSuffix: true })}</span>
          {/* <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-slate-400 hover:text-slate-200">
            View <ArrowRightIcon className="h-3 w-3 ml-1" />
          </Button> */}
        </div>
      </div>
    </div>
  )
}

export function DashboardCalendar() {
  // Mock data - en producción esto vendría de tu API
  const upcomingEvents: CalendarEvent[] = [
    {
      id: "1",
      title: "Quarterly Reports & Budgets",
      description: "Deadline for Working Groups to submit their Q3 quarterly reports and Q4 budgets.",
      date: new Date(2025, 9 - 1, 15),
      type: "proposal_deadline",
      priority: "high",
    },
    {
      id: "2",
      title: "Core Contributor Consent Forms",
      description: "Deadline for Core Contributors to complete their consent forms.",
      date: new Date(2025, 9 - 1, 22),
      type: "proposal_deadline",
      priority: "high",
    },
    {
      id: "3",
      title: "Governance WG Meeting",
      description: "Discuss objections to submitted budgets. Working Groups without objections are approved.",
      date: new Date(2025, 9 - 1, 23),
      type: "meeting",
      priority: "high",
    },
    {
      id: "4",
      title: "Revised Budget Submission",
      description: "Deadline for Working Groups with objections to submit a revised budget.",
      date: new Date(2025, 9 - 1, 28),
      type: "proposal_deadline",
      priority: "high",
    },
    {
      id: "5",
      title: "2nd-Round Consent Forms",
      description: "2nd-round consent forms go out for Working Groups that have objections.",
      date: new Date(2025, 9 - 1, 29),
      type: "proposal_deadline",
      priority: "high",
    },
    {
      id: "6",
      title: "2nd-Round Consent Forms",
      description: "Deadline for Core Contributors to submit 2nd-round consent forms.",
      date: new Date(2025, 10 - 1, 1),
      type: "proposal_deadline",
      priority: "high",
    },
    {
      id: "7",
      title: "Open Gov Meeting",
      description: "Discuss and finalize the budget in the Open Gov meeting.",
      date: new Date(2025, 10 - 1, 2),
      type: "meeting",
      priority: "high",
    },
  ];

  return (
    <Card className="bg-black border-secondary overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 border border-secondary rounded-lg">
            <CalendarIcon className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-xl text-slate-100">Upcoming Events</CardTitle>
            <CardDescription className="text-slate-400">Important dates and deadlines</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        {/* <div className="pt-2">
          <Button variant="outline" className="w-full border-secondary text-slate-300 hover:bg-slate-700">
            View Full Calendar
            <CalendarIcon className="h-4 w-4 ml-2" />
          </Button>
        </div> */}
      </CardContent>
    </Card>
  )
}
