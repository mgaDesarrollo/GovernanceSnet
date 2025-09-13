"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import {
  UserCircle2Icon,
  MapPinIcon,
  LanguagesIcon,
  BriefcaseIcon,
  DownloadIcon,
  ActivityIcon,
  SparklesIcon,
  EyeIcon,
  MessageCircleIcon,
  CheckIcon,
} from "lucide-react"
import type { UserAvailabilityStatus, Workgroup } from "@prisma/client"
import Link from "next/link"
import { GitHubIcon } from "./icons/github"
import { XIcon } from "./icons/x"
import { FacebookIcon } from "./icons/facebook"
import { LinkedInIcon } from "./icons/linkedin"

interface UserCardProps {
  user: {
    id: string
    name: string // Discord username
    fullname?: string | null
    image?: string | null
    country?: string | null
    languages?: string | null
    status?: UserAvailabilityStatus | null
    skills?: string | null
    isOnline?: boolean
    lastSeen?: string | null
    professionalProfile?: {
      tagline?: string | null
      linkCv?: string | null
    } | null
    workgroups?: Pick<Workgroup, "id" | "name">[] | null
    socialLinks?: {
      linkedin?: string | null
      facebook?: string | null
      github?: string | null
      x?: string | null
    } | null
  }
  onViewProfile?: (userId: string) => void
}

const getStatusBadgeInfo = (status?: UserAvailabilityStatus | null) => {
  switch (status) {
    case "AVAILABLE":
      return {
        text: "Available",
        className: "bg-green-600/30 text-green-300 border-green-500/50",
        icon: <ActivityIcon className="h-3 w-3" />,
      }
    case "BUSY":
      return {
        text: "Busy",
        className: "bg-yellow-600/30 text-yellow-300 border-yellow-500/50",
        icon: <ActivityIcon className="h-3 w-3" />,
      }
    case "VERY_BUSY":
      return {
        text: "Very Busy",
        className: "bg-red-600/30 text-red-300 border-red-500/50",
        icon: <ActivityIcon className="h-3 w-3" />,
      }
    default:
      return {
        text: "Unknown",
        className: "bg-slate-600/30 text-slate-300 border-slate-500/50",
        icon: <ActivityIcon className="h-3 w-3" />,
      }
  }
}

const getOnlineStatusInfo = (isOnline?: boolean, lastSeen?: string | null) => {
  if (isOnline) {
    return {
      text: "Online",
      className: "bg-green-500",
      textColor: "text-green-400",
      pulse: true,
    }
  } else if (lastSeen) {
    const lastSeenDate = new Date(lastSeen)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))

    if (diffInMinutes < 5) {
      return {
        text: "Just now",
        className: "bg-yellow-500",
        textColor: "text-yellow-400",
        pulse: false,
      }
    } else if (diffInMinutes < 60) {
      return {
        text: `${diffInMinutes}m ago`,
        className: "bg-slate-500",
        textColor: "text-slate-400",
        pulse: false,
      }
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return {
        text: `${hours}h ago`,
        className: "bg-slate-500",
        textColor: "text-slate-400",
        pulse: false,
      }
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return {
        text: `${days}d ago`,
        className: "bg-slate-600",
        textColor: "text-slate-500",
        pulse: false,
      }
    }
  }

  return {
    text: "Offline",
    className: "bg-slate-600",
    textColor: "text-slate-500",
    pulse: false,
  }
}

const SkillBadge: React.FC<{ skill: string }> = ({ skill }) => (
  <Badge variant="outline" className="bg-gray-700 border-secondary text-purple-300 text-xs px-2 py-0.5">
    <SparklesIcon className="mr-1 h-3 w-3 text-purple-400" />
    {skill}
  </Badge>
)

export function UserCard({ user, onViewProfile }: UserCardProps) {
  const [copied, setCopied] = useState(false)
  const displayName = user?.fullname || user?.name
  const statusInfo = getStatusBadgeInfo(user?.status)
  const onlineInfo = getOnlineStatusInfo(user?.isOnline, user?.lastSeen)
  const skillsArray =
    user?.skills
      ?.split(",")
      .map((s) => s.trim())
      .filter((s) => s) || []

  const copyDiscordUsername = async () => {
    try {
      await navigator.clipboard.writeText(user?.name)
      setCopied(true)

      toast({
        title: "Username copied!",
        description: `@${user?.name} copied to clipboard. Open Discord and search for this user to send a message.`,
        duration: 4000,
      })

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea")
      textArea.value = user?.name
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)

      setCopied(true)
      toast({
        title: "Username copied!",
        description: `@${user?.name} copied to clipboard. Open Discord and search for this user to send a message.`,
        duration: 4000,
      })

      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="bg-black border-secondary hover:border-purple-500/70 transition-all duration-300 ease-in-out shadow-lg hover:shadow-purple-500/20 overflow-hidden flex flex-col h-[420px] min-h-[420px] max-h-[420px] w-full">
      <CardHeader className="p-4">
        <div className="flex items-start space-x-3">
          <div className="relative">
            {user?.image ? (
              <Image
                src={user?.image || "/placeholder.svg"}
                alt={displayName}
                width={72}
                height={72}
                className="rounded-full border-2 border-secondary object-cover aspect-square"
              />
            ) : (
              <div className="w-18 h-18 shrink-0 rounded-full bg-slate-700 flex items-center justify-center border-2 border-secondary">
                <UserCircle2Icon className="h-10 w-10 text-slate-500" />
              </div>
            )}

            {/* Indicador de estado online */}
            <div className="absolute -bottom-1 -right-1 flex items-center">
              <div
                className={`w-4 h-4 rounded-full border-2 border-slate-800 ${onlineInfo.className} ${onlineInfo.pulse ? "animate-pulse" : ""}`}
              />
              {onlineInfo.pulse && (
                <div className="absolute w-4 h-4 rounded-full bg-green-500 animate-ping opacity-75" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-slate-100 truncate" title={displayName}>
              {displayName}
            </CardTitle>

            {/* Estado online como texto */}
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium ${onlineInfo.textColor}`}>{onlineInfo.text}</span>
              {user?.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
            </div>

            {user?.professionalProfile?.tagline && (
              <p className="text-xs text-purple-300/90 truncate italic mt-1" title={user?.professionalProfile.tagline}>
                "{user?.professionalProfile.tagline}"
              </p>
            )}

            <div className="mt-2 flex items-center">
              <Badge
                variant="outline"
                className={`text-xs px-1.5 py-0.5 flex items-center gap-1 ${statusInfo.className}`}
              >
                {statusInfo.icon}
                {statusInfo.text}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3 text-sm flex-1 overflow-hidden">
        {(user?.country || user?.languages) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-300">
            {user?.country && (
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1.5 text-slate-400" />
                {user?.country}
              </div>
            )}
            {user?.languages && (
              <div className="flex items-center">
                <LanguagesIcon className="h-4 w-4 mr-1.5 text-slate-400" />
                {user?.languages}
              </div>
            )}
          </div>
        )}

        {skillsArray.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-slate-400 mb-1.5">Skills:</h4>
            <div className="flex flex-wrap gap-1.5 overflow-hidden">
              {skillsArray.slice(0, 4).map((skill, index) => (
                <SkillBadge key={index} skill={skill} />
              ))}
              {skillsArray.length > 4 && (
                <Badge variant="outline" className="text-xs bg-gray-700 border-secondary">
                  +{skillsArray.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {user?.workgroups && user?.workgroups.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-slate-400 mb-1.5">Workgroups:</h4>
            <div className="flex flex-wrap gap-1.5 overflow-hidden">
              {user?.workgroups.slice(0, 3).map((wg) => (
                <Badge key={wg.id} variant="secondary" className="bg-gray-700/70 text-slate-300 text-xs px-2 py-0.5">
                  <BriefcaseIcon className="mr-1 h-3 w-3 text-slate-400" />
                  {wg.name}
                </Badge>
              ))}
              {user?.workgroups.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-700 border-secondary">
                  +{user?.workgroups.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 border-t border-secondary/50 mt-auto">
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {onViewProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewProfile(user?.id)}
                  className="text-slate-400 hover:text-purple-400 hover:bg-gray-700/50 text-xs"
                >
                  <EyeIcon className="mr-1 h-3 w-3" />
                  View Profile
                </Button>
              )}

              {/* Discord username copy button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={copyDiscordUsername}
                className={`text-xs transition-all duration-200 ${copied
                  ? "text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20"
                  : "text-slate-400 hover:text-blue-400 hover:bg-gray-700/50"
                  }`}
                title={copied ? "Username copied!" : `Copy @${user?.name} to message on Discord`}
              >
                {copied ? (
                  <>
                    <CheckIcon className="mr-1 h-3 w-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <MessageCircleIcon className="mr-1 h-3 w-3" />
                    Message
                  </>
                )}
              </Button>


            </div>

          </div>

          <div className="flex justify-start items-center gap-2">
                        {user?.socialLinks?.facebook && (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-slate-400 hover:text-purple-400 hover:bg-gray-700/50 w-8 h-8"
              >
                <Link href={user?.socialLinks.facebook} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                  <FacebookIcon />
                </Link>
              </Button>
            )}
            {user?.socialLinks?.linkedin && (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-slate-400 hover:text-purple-400 hover:bg-gray-700/50 w-8 h-8"
              >
                <Link href={user?.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                  <LinkedInIcon />
                </Link>
              </Button>
            )}
            {user?.socialLinks?.github ? (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-slate-400 hover:text-purple-400 hover:bg-gray-700/50 w-8 h-8"
              >
                <Link href={user?.socialLinks.github} target="_blank" rel="noopener noreferrer" title="GitHub">
                  <GitHubIcon />
                </Link>
              </Button>
            ) : ""}
            {user?.socialLinks?.x && (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-slate-400 hover:text-purple-400 hover:bg-gray-700/50 w-8 h-8"
              >
                <Link href={user?.socialLinks.x} target="_blank" rel="noopener noreferrer" title="X (Twitter)">
                  <XIcon />
                </Link>
              </Button>
            )}
          </div>

          {user?.professionalProfile?.linkCv && (
            <div className="w-full">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full bg-purple-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600/30 hover:text-purple-200 hover:border-purple-500/60"
              >
                <Link href={user?.professionalProfile.linkCv} target="_blank" rel="noopener noreferrer">
                  <DownloadIcon className="mr-1.5 h-4 w-4" />
                  Download Resume
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
