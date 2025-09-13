"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import {
  UserCircle2Icon,
  MapPinIcon,
  LanguagesIcon,
  BriefcaseIcon,
  DownloadIcon,
  ActivityIcon,
  SparklesIcon,
  BookOpenIcon,
  FileTextIcon,
  Loader2Icon,
} from "lucide-react"
import type { UserAvailabilityStatus, Workgroup } from "@prisma/client"
import Link from "next/link"
import { FacebookIcon } from "./icons/facebook"
import { LinkedInIcon } from "./icons/linkedin"
import { GitHubIcon } from "./icons/github"
import { XIcon } from "./icons/x"

interface UserProfileDialogProps {
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FullUserProfile = {
  name: string // Discord username
  fullname?: string | null
  image?: string | null
  country?: string | null
  languages?: string | null
  status?: UserAvailabilityStatus | null
  skills?: string | null
  professionalProfile?: {
    tagline?: string | null
    bio?: string | null
    experience?: string | null
    linkCv?: string | null
  } | null
  workgroups?: Pick<Workgroup, "id" | "name">[] | null
  socialLinks?: {
    facebook?: string | null
    linkedin?: string | null
    github?: string | null
    x?: string | null
  } | null
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

export function UserProfileDialog({ userId, open, onOpenChange }: UserProfileDialogProps) {
  const [user, setUser] = useState<FullUserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && userId) {
      const fetchUserProfile = async () => {
        try {
          setIsLoading(true)
          const response = await fetch(`/api/users/${userId}`)
          if (!response.ok) {
            throw new Error("Failed to fetch user profile")
          }
          const userData = await response.json()
          setUser(userData)
        } catch (error) {
          console.error("Error fetching user profile:", error)
          setUser(null) // Reset user state on error
        } finally {
          setIsLoading(false)
        }
      }

      fetchUserProfile()
    } else {
      // Reset state when dialog closes
      setUser(null)
      setIsLoading(false)
    }
  }, [userId, open])

  if (!open) return null
  if (!user && !isLoading) return null

  const displayName = user?.fullname || user?.name || "Unknown User"
  const statusInfo = getStatusBadgeInfo(user?.status)
  const skillsArray =
    user?.skills
      ?.split(",")
      .map((s) => s.trim())
      .filter((s) => s) || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={userId}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-secondary text-slate-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-100">Complete User Profile</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2Icon className="h-8 w-8 text-purple-500 animate-spin" />
            <span className="ml-2 text-slate-300">Loading profile...</span>
          </div>
        ) : user ? (
          <div className="space-y-8">
            {/* Header Section with Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
              {user?.image ? (
                <Image
                  src={user?.image || "/placeholder.svg"}
                  alt={displayName}
                  width={120}
                  height={120}
                  className="rounded-full border-3 border-secondary object-cover aspect-square mx-auto md:mx-0"
                />
              ) : (
                <div className="w-30 h-30 shrink-0 rounded-full bg-slate-700 flex items-center justify-center border-3 border-secondary mx-auto md:mx-0">
                  <UserCircle2Icon className="h-16 w-16 text-slate-500" />
                </div>
              )}

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-slate-100 mb-2">{displayName}</h2>
                <p className="text-lg text-slate-300 mb-2">@{user?.name}</p>

                {user?.professionalProfile?.tagline && (
                  <p className="text-purple-300 italic text-lg mb-3">"{user?.professionalProfile.tagline}"</p>
                )}

                <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-sm px-3 py-1 flex items-center gap-2 ${statusInfo.className}`}
                  >
                    {statusInfo.icon}
                    {statusInfo.text}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Personal Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <UserCircle2Icon className="h-5 w-5 text-purple-400" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-medium min-w-[120px]">Full Name:</span>
                      <span className="text-slate-300">{user?.fullname || "Not provided"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-medium min-w-[120px]">Username:</span>
                      <span className="text-slate-300">@{user?.name}</span>
                    </div>
                    {user?.country && (
                      <div className="flex items-center gap-3">
                        <MapPinIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-400 font-medium min-w-[100px]">Country:</span>
                        <span className="text-slate-300">{user?.country}</span>
                      </div>
                    )}
                    {user?.languages && (
                      <div className="flex items-center gap-3">
                        <LanguagesIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-400 font-medium min-w-[100px]">Languages:</span>
                        <span className="text-slate-300">{user?.languages}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills Section */}
                {skillsArray.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
                      <SparklesIcon className="h-5 w-5 text-purple-400" />
                      Skills & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skillsArray.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-slate-700 border-secondary text-purple-300"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Workgroups Section */}
                {user?.workgroups && user?.workgroups.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
                      <BriefcaseIcon className="h-5 w-5 text-purple-400" />
                      Workgroups
                    </h3>
                    <div className="space-y-2">
                      {user?.workgroups.map((wg) => (
                        <Badge key={wg.id} variant="secondary" className="bg-slate-700/70 text-slate-300 px-3 py-1">
                          {wg.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Professional Information */}
                <div>
                  <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <BookOpenIcon className="h-5 w-5 text-purple-400" />
                    Professional Information
                  </h3>
                  <div className="space-y-4">
                    {user?.professionalProfile?.bio && (
                      <div>
                        <h4 className="font-medium text-slate-300 mb-2">Biography</h4>
                        <p className="text-slate-400 leading-relaxed text-sm bg-slate-700/30 p-3 rounded-lg">
                          {user?.professionalProfile.bio}
                        </p>
                      </div>
                    )}

                    {user?.professionalProfile?.experience && (
                      <div>
                        <h4 className="font-medium text-slate-300 mb-2">Experience</h4>
                        <p className="text-slate-400 leading-relaxed text-sm bg-slate-700/30 p-3 rounded-lg">
                          {user?.professionalProfile.experience}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Links & CV */}
                <div>
                  <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <FileTextIcon className="h-5 w-5 text-purple-400" />
                    Links & Resources
                  </h3>

                  {/* CV Download */}
                  {user?.professionalProfile?.linkCv && (
                    <div className="mb-4">
                      <Button
                        variant="outline"
                        asChild
                        className="bg-purple-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600/30 w-full"
                      >
                        <Link href={user?.professionalProfile.linkCv} target="_blank" rel="noopener noreferrer">
                          <DownloadIcon className="mr-2 h-4 w-4" />
                          Download CV / Resume
                        </Link>
                      </Button>
                    </div>
                  )}

                  {/* Social Links */}
                  <div>
                    <h4 className="font-medium text-slate-300 mb-3">Social Media</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {user?.socialLinks?.facebook && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 justify-start"
                        >
                          <Link href={user?.socialLinks?.facebook} target="_blank" rel="noopener noreferrer">
                            <FacebookIcon />
                            Facebook
                          </Link>
                        </Button>
                      )}
                      {user?.socialLinks?.linkedin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 justify-start"
                        >
                          <Link href={user?.socialLinks?.linkedin} target="_blank" rel="noopener noreferrer">
                            <LinkedInIcon />
                            LinkedIn
                          </Link>
                        </Button>
                      )}
                      {user?.socialLinks?.github && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-slate-400 hover:text-purple-400 hover:bg-slate-700/50 justify-start"
                        >
                          <Link href={user?.socialLinks?.github} target="_blank" rel="noopener noreferrer">
                            <GitHubIcon />
                            GitHub
                          </Link>
                        </Button>
                      )}
                      {user?.socialLinks?.x && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 justify-start"
                        >
                          <Link href={user?.socialLinks?.x} target="_blank" rel="noopener noreferrer">
                            <XIcon />X (Twitter)
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
