"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeftIcon, 
  FileTextIcon, 
  UsersIcon, 
  CalendarIcon, 
  DollarSignIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  MinusIcon,
  MessageSquareIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  ClockIcon,
  UserIcon,
  BuildingIcon,
  TargetIcon,
  LightbulbIcon,
  TrendingUpIcon,
  AlertCircleIcon,
  CheckIcon,
  XIcon,
  ShieldIcon,
  VoteIcon,
  SettingsIcon,
  RefreshCwIcon,
  AwardIcon
} from "lucide-react"
import React from "react"
import { CommentItem } from "@/components/comment-item"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatToDollar } from "@/lib/utils"

interface Report {
  id: string
  workGroup: {
    id: string
    name: string
  }
  year: number
  quarter: string
  detail: string
  theoryOfChange: string
  challenges: any[]
  plans: string
  consensusStatus: "PENDING" | "IN_CONSENSUS" | "CONSENSED"
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  participants: Array<{
    user: {
      id: string
      name: string
      email: string
    }
  }>
  budgetItems: Array<{
    id: string
    name: string
    description: string
    amountUsd: number
  }>
}

interface Vote {
  id: string
  voteType: "A_FAVOR" | "EN_CONTRA" | "OBJETAR" | "ABSTENERSE"
  comment: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
  objection?: {
    id: string
    status: "PENDIENTE" | "VALIDA" | "INVALIDA"
    resolvedBy?: {
      id: string
      name: string
      image?: string | null
    }
  }
}

interface VoteStats {
  aFavor: number
  enContra: number
  objetar: number
  abstenerse: number
  total: number
}

interface Comment {
  id: string
  content: string
  createdAt: string
  likes: string[]
  dislikes: string[]
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
  replies?: Comment[]
}

export default function ConsensusReportDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [votes, setVotes] = useState<Vote[]>([])
  const [voteStats, setVoteStats] = useState<VoteStats>({ aFavor: 0, enContra: 0, objetar: 0, abstenerse: 0, total: 0 })
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showVoteDialog, setShowVoteDialog] = useState(false)
  const [selectedVoteType, setSelectedVoteType] = useState<string>("")
  const [voteComment, setVoteComment] = useState("")
  const [submittingVote, setSubmittingVote] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [creatingRound, setCreatingRound] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { reportId } = await params
      fetchReportData(reportId)
    }
    fetchData()
  }, [params])

  const checkAdminStatus = () => {
    if (!session?.user) return false
    const userRole = (session.user as any).role
    return userRole === "ADMIN" || userRole === "SUPER_ADMIN"
  }

  const fetchReportData = async (reportId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch report details
      const reportResponse = await fetch(`/api/quarterly-reports/${reportId}`)
      if (!reportResponse.ok) {
        throw new Error("Failed to fetch report")
      }
      const reportData = await reportResponse.json()
      setReport(reportData)

      // Fetch votes
      const votesResponse = await fetch(`/api/reports/${reportId}/votes`)
      if (votesResponse.ok) {
        const votesData = await votesResponse.json()
        setVotes(votesData.votes || [])
        setVoteStats(votesData.statistics || { aFavor: 0, enContra: 0, objetar: 0, abstenerse: 0, total: 0 })
      }

      // Fetch comments
      const commentsResponse = await fetch(`/api/reports/${reportId}/comments`)
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json()
        setComments(commentsData)
      }

      setIsAdmin(checkAdminStatus())
    } catch (err) {
      console.error("Error fetching report data:", err)
      setError("Error loading report data")
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (!selectedVoteType) return

    // Only validate comment for objections
    if (selectedVoteType === "OBJETAR" && (!voteComment.trim() || voteComment.length < 10)) {
      alert("Objections require a minimum of 10 characters justification")
      return
    }

    try {
      setSubmittingVote(true)
      setCreatingRound(true)
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: report?.id,
          voteType: selectedVoteType,
          comment: voteComment
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit vote")
      }

      // Refresh votes
      const votesResponse = await fetch(`/api/reports/${report?.id}/votes`)
      if (votesResponse.ok) {
        const votesData = await votesResponse.json()
        setVotes(votesData.votes || [])
        setVoteStats(votesData.statistics || { aFavor: 0, enContra: 0, objetar: 0, abstenerse: 0, total: 0 })
      }

      setShowVoteDialog(false)
      setSelectedVoteType("")
      setVoteComment("")
    } catch (err) {
      console.error("Error submitting vote:", err)
      const errorMessage = err instanceof Error ? err.message : "Error submitting vote"
      alert(errorMessage)
    } finally {
      setSubmittingVote(false)
      setCreatingRound(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || newComment.length < 5) return

    try {
      setSubmittingComment(true)
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: report?.id,
          content: newComment
        })
      })

      if (!response.ok) {
        throw new Error("Failed to submit comment")
      }

      // Refresh comments
      const commentsResponse = await fetch(`/api/reports/${report?.id}/comments`)
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json()
        setComments(commentsData)
      }

      setNewComment("")
    } catch (err) {
      console.error("Error submitting comment:", err)
      alert("Error submitting comment")
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleReply = async (parentCommentId: string, content: string) => {
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: report?.id,
          parentCommentId,
          content
        })
      })

      if (!response.ok) {
        throw new Error("Failed to submit reply")
      }

      // Refresh comments
      const commentsResponse = await fetch(`/api/reports/${report?.id}/comments`)
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json()
        setComments(commentsData)
      }
    } catch (err) {
      console.error("Error submitting reply:", err)
      alert("Error submitting reply")
    }
  }

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST"
      })

      if (response.ok) {
        // Refresh comments
        const commentsResponse = await fetch(`/api/reports/${report?.id}/comments`)
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json()
          setComments(commentsData)
        }
      }
    } catch (err) {
      console.error("Error liking comment:", err)
    }
  }

  const handleDislikeComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/dislike`, {
        method: "POST"
      })

      if (response.ok) {
        // Refresh comments
        const commentsResponse = await fetch(`/api/reports/${report?.id}/comments`)
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json()
          setComments(commentsData)
        }
      }
    } catch (err) {
      console.error("Error disliking comment:", err)
    }
  }

  const handleResolveObjection = async (objectionId: string, status: "VALIDA" | "INVALIDA") => {
    try {
      const response = await fetch(`/api/objections/${objectionId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        // Refresh votes
        const votesResponse = await fetch(`/api/reports/${report?.id}/votes`)
        if (votesResponse.ok) {
          const votesData = await votesResponse.json()
          setVotes(votesData.votes || [])
        }
      }
    } catch (err) {
      console.error("Error resolving objection:", err)
      alert("Error resolving objection")
    }
  }

  const handleNewVotingRound = async () => {
    try {
      const response = await fetch(`/api/reports/${report?.id}/rounds`, {
        method: "POST"
      })

      if (response.ok) {
        // Refresh report data
        fetchReportData(report?.id || "")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create new voting round")
      }
    } catch (err) {
      console.error("Error creating new voting round:", err)
      const errorMessage = err instanceof Error ? err.message : "Error creating new voting round"
      alert(errorMessage)
    }
  }

  const handleMarkConsensus = async (status: "CONSENSED" | "REJECTED") => {
    try {
      const response = await fetch(`/api/reports/${report?.id}/consensus-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consensusStatus: status })
      })

      if (response.ok) {
        // Refresh report data
        fetchReportData(report?.id || "")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to mark consensus")
      }
    } catch (err) {
      console.error("Error marking consensus:", err)
      const errorMessage = err instanceof Error ? err.message : "Error marking consensus"
      alert(errorMessage)
    }
  }

  const getVoteTypeIcon = (type: string) => {
    switch (type) {
      case "A_FAVOR": return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case "EN_CONTRA": return <XCircleIcon className="w-4 h-4 text-red-500" />
      case "OBJETAR": return <AlertTriangleIcon className="w-4 h-4 text-yellow-500" />
      case "ABSTENERSE": return <MinusIcon className="w-4 h-4 text-gray-500" />
      default: return <VoteIcon className="w-4 h-4" />
    }
  }

  const getVoteTypeLabel = (type: string) => {
    switch (type) {
      case "A_FAVOR": return "1. CONSENT"
      case "EN_CONTRA": return "2. OPPOSE"
      case "OBJETAR": return "2. OBJECT"
      case "ABSTENERSE": return "3. ABSTAIN"
      default: return type
    }
  }

  const getObjectionStatusBadge = (status: string) => {
    switch (status) {
      case "PENDIENTE": return <Badge variant="secondary">Pending</Badge>
      case "VALIDA": return <Badge variant="destructive">Valid</Badge>
      case "INVALIDA": return <Badge variant="outline">Invalid</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const isCommentRequired = (voteType: string) => {
    return voteType === "OBJETAR"
  }

  const getMinCommentLength = (voteType: string) => {
    return voteType === "OBJETAR" ? 10 : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-black rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-black rounded"></div>
                <div className="h-32 bg-black rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-black rounded"></div>
                <div className="h-32 bg-black rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error || "Report not found"}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const pendingObjections = votes.filter(vote => 
    vote.voteType === "OBJETAR" && vote.objection?.status === "PENDIENTE"
  )

  const validObjections = votes.filter(vote => 
    vote.voteType === "OBJETAR" && vote.objection?.status === "VALIDA"
  )

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wide">
                Consent Report
              </h1>
              <p className="text-gray-400 font-medium">
                {report.workGroup.name} - {report.year} Q{report.quarter}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-gray-400 font-bold">
              {report.consensusStatus}
            </Badge>
            {isAdmin && report.consensusStatus !== "CONSENSED" && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleNewVotingRound}
                  className="text-blue-400 hover:text-blue-300 border-blue-600 hover:border-blue-500"
                >
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  New Round
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleMarkConsensus("CONSENSED")}
                  className="text-green-400 hover:text-green-300 border-secondary hover:border-green-500"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Mark Consent
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-black border-secondary">
                <TabsTrigger value="overview" className="text-gray-300 hover:text-white">Overview</TabsTrigger>
                <TabsTrigger value="voting" className="text-gray-300 hover:text-white">Voting</TabsTrigger>
                <TabsTrigger value="comments" className="text-gray-300 hover:text-white">Comments</TabsTrigger>
                <TabsTrigger value="objections" className="text-gray-300 hover:text-white">Objections</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-black border-secondary">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileTextIcon className="w-5 h-5 mr-2" />
                      Report Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-bold text-white mb-2 tracking-wide">Description</h3>
                      <p className="text-gray-400 text-sm leading-relaxed font-medium">
                        {report.detail || "No description provided"}
                      </p>
                    </div>
                    
                    {report.theoryOfChange && (
                      <div>
                        <h3 className="font-bold text-white mb-2 tracking-wide">Theory of Change</h3>
                        <p className="text-gray-400 text-sm leading-relaxed font-medium">
                          {report.theoryOfChange}
                        </p>
                      </div>
                    )}

                    {report.plans && (
                      <div>
                        <h3 className="font-bold text-white mb-2 tracking-wide">Future Plans</h3>
                        <p className="text-gray-400 text-sm leading-relaxed font-medium">
                          {report.plans}
                        </p>
                      </div>
                    )}

                    {report.challenges && report.challenges.length > 0 && (
                      <div>
                        <h3 className="font-bold text-white mb-2 tracking-wide">Challenges & Learning</h3>
                        <div className="space-y-2">
                          {Array.isArray(report.challenges)
                            ? report.challenges.map((challenge: any, index: number) => {
                                if (typeof challenge === 'string') {
                                  return (
                                    <div key={index} className="flex items-center space-x-2">
                                      <CheckIcon className="w-4 h-4 text-green-400" />
                                      <span className="text-gray-400 text-sm font-medium">{challenge}</span>
                                    </div>
                                  );
                                } else if (challenge && typeof challenge === 'object') {
                                  // Handle object with text property
                                  if ('text' in challenge && typeof challenge.text === 'string') {
                                    return (
                                      <div key={index} className="flex items-center space-x-2">
                                        <CheckIcon className="w-4 h-4 text-green-400" />
                                        <span className="text-gray-400 text-sm font-medium">{challenge.text}</span>
                                      </div>
                                    );
                                  }
                                  // Handle any other object by converting to string
                                  return (
                                    <div key={index} className="flex items-center space-x-2">
                                      <CheckIcon className="w-4 h-4 text-green-400" />
                                      <span className="text-gray-400 text-sm font-medium">
                                        {JSON.stringify(challenge)}
                                      </span>
                                    </div>
                                  );
                                } else {
                                  // Handle any other type by converting to string
                                  return (
                                    <div key={index} className="flex items-center space-x-2">
                                      <CheckIcon className="w-4 h-4 text-green-400" />
                                      <span className="text-gray-400 text-sm font-medium">
                                        {String(challenge)}
                                      </span>
                                    </div>
                                  );
                                }
                              })
                            : report.challenges
                              ? <div className="text-gray-400 text-sm font-medium">
                                  {typeof report.challenges === 'object' ? JSON.stringify(report.challenges) : String(report.challenges)}
                                </div>
                              : <div className="text-gray-400 text-sm font-medium italic">No challenges</div>
                          }
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-black border-secondary">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserIcon className="w-5 h-5 mr-2" />
                      Proposal Creator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-purple-600 text-white font-bold">
                          {report.createdBy.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-white text-lg tracking-wide">
                          {report.createdBy.name}
                        </h4>
                        <p className="text-gray-400 text-sm font-medium">
                          {report.createdBy.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-secondary">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Created</p>
                          <p className="text-sm font-bold text-white">
                            {formatDate(report.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <UsersIcon className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Participants</p>
                          <p className="text-sm font-bold text-white">
                            {report.participants.length} members
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black border-secondary">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSignIcon className="w-5 h-5 mr-2" />
                      Budget Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.budgetItems.length === 0 ? (
                      <p className="text-gray-400 text-sm font-medium">No budget items</p>
                    ) : (
                      <div className="space-y-3">
                        {report.budgetItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-3 bg-black rounded-lg border border-secondary">
                            <div>
                              <h4 className="font-bold text-white text-sm tracking-wide">{item.name}</h4>
                              <p className="text-gray-400 text-xs font-medium">{item.description}</p>
                            </div>
                            <span className="font-bold text-green-400">{formatToDollar(item.amountUsd)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-3 border-t border-secondary">
                          <span className="font-bold text-white">Total Budget</span>
                          <span className="font-bold text-green-400">
                            {formatToDollar(report.budgetItems.reduce((sum, item) => sum + item.amountUsd, 0))}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Voting Tab */}
              <TabsContent value="voting" className="space-y-6">
                <Card className="bg-black border-secondary">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <VoteIcon className="w-5 h-5 mr-2" />
                      Consent Voting
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {votes.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <VoteIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <p className="font-medium">No votes registered yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {votes.map((vote) => (
                          <div key={vote.id} className="flex items-start space-x-3 p-4 bg-black rounded-lg border border-secondary">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={vote.user.image || undefined} />
                              <AvatarFallback>{vote.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium text-gray-200">{vote.user.name}</span>
                                {getVoteTypeIcon(vote.voteType)}
                                <Badge variant="outline">{getVoteTypeLabel(vote.voteType)}</Badge>
                                {vote.objection && getObjectionStatusBadge(vote.objection.status)}
                                <span className="text-xs text-gray-500">
                                  {formatDate(vote.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">{vote.comment}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Comments Tab */}
              <TabsContent value="comments" className="space-y-6">
                <Card className="bg-black border-secondary">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquareIcon className="w-5 h-5 mr-2" />
                      Comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <Textarea
                          placeholder="Add a comment (minimum 5 characters)..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1 bg-black border-secondary text-white placeholder-gray-400"
                        />
                        <Button
                          onClick={handleSubmitComment}
                          disabled={newComment.length < 5 || submittingComment}
                          className="bg-purple-600 hover:bg-purple-700 font-bold"
                        >
                          {submittingComment ? "Posting..." : "Post"}
                        </Button>
                      </div>
                      
                      {comments.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <MessageSquareIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                          <p className="font-medium">No comments yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {comments.map((comment) => (
                            <CommentItem
                              key={comment.id}
                              comment={comment}
                              onReply={handleReply}
                              onLike={handleLikeComment}
                              onDislike={handleDislikeComment}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Objections Tab */}
              <TabsContent value="objections" className="space-y-6">
                <Card className="bg-black border-secondary">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangleIcon className="w-5 h-5 mr-2" />
                      Objections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pendingObjections.length === 0 && validObjections.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <AlertTriangleIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <p className="font-medium">No objections</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingObjections.map((vote) => (
                          <div key={vote.id} className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={vote.user.image || undefined} />
                                  <AvatarFallback>{vote.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-yellow-300">{vote.user.name}</span>
                                <Badge variant="outline" className="text-yellow-400 border-yellow-600">Pending Review</Badge>
                              </div>
                              {isAdmin && (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleResolveObjection(vote.objection!.id, "VALIDA")}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    Mark Valid
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleResolveObjection(vote.objection!.id, "INVALIDA")}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Mark Invalid
                                  </Button>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-yellow-200">{vote.comment}</p>
                          </div>
                        ))}
                        
                        {validObjections.map((vote) => (
                          <div key={vote.id} className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={vote.user.image || undefined} />
                                <AvatarFallback>{vote.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-red-300">{vote.user.name}</span>
                              <Badge variant="destructive">Valid Objection</Badge>
                              {vote.objection?.resolvedBy && (
                                <span className="text-xs text-red-400">
                                  Resolved by {vote.objection.resolvedBy.name}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-red-200">{vote.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voting Stats */}
            <Card className="bg-black border-secondary">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUpIcon className="w-5 h-5 mr-2" />
                  Voting Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">1. CONSENT</span>
                  <span className="font-bold text-green-400">{voteStats.aFavor}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">2. OBJECT</span>
                  <span className="font-bold text-yellow-400">{voteStats.objetar}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">3. ABSTAIN</span>
                  <span className="font-bold text-gray-400">{voteStats.abstenerse}</span>
                </div>
                <Separator className="border-secondary" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Total Votes</span>
                  <span className="font-bold text-white">{voteStats.total}</span>
                </div>
              </CardContent>
            </Card>

            {/* Vote Action */}
            <Card className="bg-black border-secondary">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <VoteIcon className="w-5 h-5 mr-2" />
                  Cast Your Vote
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 font-bold">
                      <VoteIcon className="w-4 h-4 mr-2" />
                      Vote
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Cast Your Vote</DialogTitle>
                      <DialogDescription>
                        Choose your vote type and provide justification if required.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-2">
                        {["A_FAVOR", "OBJETAR", "ABSTENERSE"].map((type) => (
                          <Button
                            key={type}
                            variant={selectedVoteType === type ? "default" : "outline-solid"}
                            onClick={() => setSelectedVoteType(type)}
                            className="flex items-center justify-start"
                          >
                            {getVoteTypeIcon(type)}
                            <span className="ml-2">{getVoteTypeLabel(type)}</span>
                          </Button>
                        ))}
                      </div>
                      <Textarea
                        placeholder={isCommentRequired(selectedVoteType) 
                          ? "Justification required (minimum 10 characters)..." 
                          : "Justification (optional)..."
                        }
                        value={voteComment}
                        onChange={(e) => setVoteComment(e.target.value)}
                        className="min-h-[100px] bg-black border-secondary text-white placeholder-gray-400"
                      />
                      <div className="text-xs text-gray-500">
                        {voteComment.length}/1000 characters
                        {isCommentRequired(selectedVoteType) && (
                          <span className="text-red-400 ml-2">
                            Minimum {getMinCommentLength(selectedVoteType)} characters required
                          </span>
                        )}
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowVoteDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleVote}
                          disabled={
                            !selectedVoteType || 
                            (selectedVoteType === "OBJETAR" && voteComment.length < 10) ||
                            submittingVote
                          }
                        >
                          {submittingVote ? (creatingRound ? "Creating voting round..." : "Submitting...") : "Submit Vote"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 