"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { formatDistanceToNow, isPast, format, endOfDay, set } from "date-fns"
import { enUS } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { EditProposalDialog } from "@/components/edit-proposal-dialog"
import ProposalTimeline from "@/components/proposal-timeline"
import ConsensusTracking from "@/components/consensus-tracking"
import {
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  EditIcon,
  SparklesIcon,
  TimerIcon,
  UserIcon,
  MessageSquareIcon,
  SendIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  HandIcon
} from "lucide-react"
import type { Proposal, ProposalStatusType, VoteTypeEnum } from "@/lib/types"
import Link from "next/link"
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatToDollar, getAgixFromDollars } from "@/lib/utils"

type CommentNode = {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string; image?: string }
  replies?: CommentNode[]
}


function renderTextWithLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400! hover:text-blue-300 hover:underline break-all underline"
        >
          {part}
        </a>
      )
    }
    return part
  })
}

function CommentThread({
  comment,
  onReply,
  isSubmittingReply,
  depth = 0,
}: {
  comment: CommentNode
  onReply: (parentId: string, content: string) => Promise<void> | void
  isSubmittingReply: boolean
  depth?: number
}) {
  const [showReplies, setShowReplies] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    await onReply(comment?.id, content.trim())
    setContent("")
    setShowForm(false)
    setShowReplies(true)
  }

  return (
    <div className={`rounded-lg ${depth === 0 ? "bg-slate-700/50 p-4" : "bg-slate-800/50 p-3"} ${depth > 0 ? "mt-3" : ""}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`shrink-0 ${depth === 0 ? "h-8 w-8" : "h-6 w-6"} rounded-full bg-slate-600 flex items-center justify-center`}>
          {comment?.user?.image ? (
            <img
              src={comment?.user?.image || "/placeholder.svg"}
              alt={comment?.user?.name}
              className="rounded-full h-full w-full"
            />
          ) : (
            <UserIcon className={`${depth === 0 ? "h-4 w-4" : "h-3 w-3"} text-slate-400`} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-200 text-sm sm:text-base truncate">{comment?.user?.name}</p>
          <p className="text-xs text-slate-400">
            {formatDistanceToNow(new Date(comment?.createdAt), { addSuffix: true, locale: enUS })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(v => !v)}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-600/50"
          >
            <MessageSquareIcon className="h-4 w-4 mr-1" />
            Reply
          </Button>

          {comment?.replies?.length ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplies(v => !v)}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-600/50"
            >
              {showReplies ? "Hide" : "Show"} replies&nbsp;
              <span className="text-slate-500">({comment?.replies.length})</span>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Body */}
      <div className="text-slate-300 whitespace-pre-line mb-3 break-words">
        {renderTextWithLinks(comment?.content)}
      </div>

      {/* Reply form */}
      {showForm && (
        <div className="ml-4 border-l-2 border-secondary pl-4 mt-3">
          <form onSubmit={submit}>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your reply..."
              className="min-h-[80px] bg-slate-800 border-secondary text-slate-50 focus:border-purple-500 mb-2"
              disabled={isSubmittingReply}
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={!content.trim() || isSubmittingReply}
              >
                {isSubmittingReply ? (
                  <>
                    <div className="animate-spin mr-2 h-3 w-3 border-2 border-t-transparent border-white rounded-full"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <SendIcon className="mr-2 h-3 w-3" />
                    Send Reply
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { setShowForm(false); setContent("") }}
                className="border-secondary text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Children */}
      {showReplies && comment?.replies?.length ? (
        <div className="ml-4 border-l-2 border-secondary pl-4 mt-3">
          {comment?.replies.map((child: any) => (
            <CommentThread
              key={child?.id}
              comment={child}
              onReply={onReply}
              isSubmittingReply={isSubmittingReply}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}


export default function ProposalDetailPage({ params }: { params: { id: string } }) {
  const { id: proposalId } = params
  const router = useRouter()
  const { data: session, status } = useSession()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [workGroups, setWorkGroups] = useState<{ id: string, name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isSubmittingVote, setIsSubmittingVote] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const [commentsCount, setCommentsCount] = useState(0);

  const generateSummary = async ({
    title,
    description,
    createdAt,
    expiresAt,
    status,
    authorName,
  }: {
    title: string
    description: string
    createdAt: string
    expiresAt: string
    status: ProposalStatusType
    authorName: string
  }) => {
    setIsSummaryLoading(true)
    try {
      const res = await fetch('/api/generate-proposal-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, createdAt, expiresAt, status, authorName })
      })
      if (!res.ok) throw new Error('Failed to generate summary')
      const data = await res.json()
      setSummary(typeof data === 'string' ? data : (data.summary ?? JSON.stringify(data)))
    } catch (e: any) {
      setError(e?.message || 'Failed to generate summary')
    } finally {
      setIsSummaryLoading(false)
    }
  }

  function addReplyToTree(nodes: any[], parentId: string, reply: any): any[] {
    return (nodes || []).map((node) => {
      if (node.id === parentId) {
        return { ...node, replies: [...(node.replies || []), reply] }
      }
      if (node.replies?.length) {
        return { ...node, replies: addReplyToTree(node.replies, parentId, reply) }
      }
      return node
    })
  }

  function sortTreeByDateDesc(nodes: any[]): any[] {
    const sorted = [...(nodes || [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return sorted.map(n => n.replies?.length ? { ...n, replies: sortTreeByDateDesc(n.replies) } : n)
  }


  const fetchProposal = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/proposals/${proposalId}`)

      if (!response.ok) {
        if (response.status === 404) {
          router.replace("/dashboard/proposals")
          return
        }
        throw new Error("Failed to fetch proposal")
      }
      const data = await response.json()
      setProposal(data)
      setCommentsCount(data?._count?.comments || 0);
    } catch (error) {
      console.error("Error fetching proposal:", error)
      setError("Failed to load proposal details")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.replace("/")
      return
    }

    fetchProposal()
  }, [status, router, proposalId])

  useEffect(() => {
    // Obtener nombres de workgroups asociados
    if (proposal?.workGroupIds && proposal?.workGroupIds.length > 0) {
      fetch('/api/workgroups')
        .then(res => res.ok ? res.json() : [])
        .then(data => setWorkGroups(data))
        .catch(() => setWorkGroups([]));
    }
  }, [proposal?.workGroupIds]);

  // Guardar loading y ausencia de proposal antes del render principal
  if (isLoading) {
    return <div className="p-4 text-center text-white">Loading proposal...</div>
  }
  if (!proposal) {
    return <div className="p-4 text-center text-red-400">Proposal not found.</div>
  }
  // Cálculo de totales y porcentajes para presupuesto
  const totalBudget = proposal?.budgetItems?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0;
  const adminBudget = proposal?.budgetItems?.filter((item: any) => item.type === 'Admin')
    .reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0;
  const operativeBudget = proposal?.budgetItems?.filter((item: any) => item.type === 'Operative')
    .reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0;

  const handleVote = async (voteType: VoteTypeEnum, voteComment?: string) => {
    if (!proposal || isSubmittingVote) return

    try {
      setIsSubmittingVote(true)
      setError(null)

      const response = await fetch(`/api/proposals/${proposal?.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType, comment: voteComment }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit vote")
      }

      const data = await response.json()
      // Update quick counters immediately
      setProposal((prev) => {
        if (!prev) return null
        return {
          ...prev,
          positiveVotes: data.proposal?.positiveVotes,
          negativeVotes: data.proposal?.negativeVotes,
          abstainVotes: data.proposal?.abstainVotes,
          userVote: data.userVote,
          // Ensure comments reflect any upsert done in the vote API
          comments: data.proposal?.comments ?? prev.comments,
        }
      })
      // Optionally refresh full proposal to ensure votes/comments are fully in sync
      fetchProposal()
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting your vote")
    } finally {
      setIsSubmittingVote(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!proposal || !comment?.trim() || isSubmittingComment) return

    try {
      setIsSubmittingComment(true)
      setError(null)

      const response = await fetch(`/api/proposals/${proposal?.id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: comment }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit comment")
      }

      const newComment = await response.json()
      setCommentsCount((count) => count + 1);
      setProposal((prev) => {
        if (!prev) return null
        return {
          ...prev,
          comments: [newComment, ...(prev.comments || [])],
          userHasCommented: true,
        }
      })
      setComment("")
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting your comment")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleSubmitReply = async (parentCommentId: string, content: string) => {
    if (!proposal || !content.trim() || isSubmittingReply) return

    try {
      setIsSubmittingReply(true)
      setError(null)

      const response = await fetch(`/api/proposals/${proposal?.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId: parentCommentId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit reply")
      }

      const newReply = await response.json()

      setCommentsCount((count) => count + 1);
      setProposal(prev => {
        if (!prev) return prev
        const nextComments = addReplyToTree(prev.comments || [], parentCommentId, newReply)
        return { ...prev, comments: nextComments }
      })
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting your reply")
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleEditSuccess = (updatedProposal: Proposal) => {
    setProposal((prev) => prev ? { ...prev, ...updatedProposal } : updatedProposal)
    setIsEditDialogOpen(false)
  }

  const getStatusBadge = (status: ProposalStatusType) => {
    switch (status) {
      case "IN_REVIEW":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            In Review
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Approved
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-secondary">
            Rejected
          </Badge>
        )
      case "EXPIRED":
        return (
          <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/20">
            Expired
          </Badge>
        )
      default:
        return null
    }
  }

  const getStatusIcon = (status: ProposalStatusType) => {
    switch (status) {
      case "IN_REVIEW":
        return <ClockIcon className="h-4 w-4 text-yellow-500" />
      case "APPROVED":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case "REJECTED":
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      case "EXPIRED":
        return <TimerIcon className="h-4 w-4 text-slate-400" />
      default:
        return <ClockIcon className="h-4 w-4 text-slate-400" />
    }
  }

  const isAuthor = proposal?.author?.id === session?.user?.id
  const isExpired = proposal ? isPast(endOfDay(new Date(proposal?.expiresAt))) : false
  const canVote = proposal?.status === "IN_REVIEW" && !isExpired
  const canEdit = isAuthor && proposal?.status === "IN_REVIEW" && !isExpired

  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 p-4 sm:p-6 lg:p-8">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/proposals")}
          className="mb-6 bg-slate-800 border-secondary hover:bg-slate-700 text-slate-300 hover:text-slate-100"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Proposals
        </Button>

        <Alert variant="destructive" className="bg-red-900/30 border-red-700 text-red-300">
          <AlertCircleIcon className="h-5 w-5 text-red-400" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Proposal not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-50 p-4 sm:p-6 lg:p-8 xl:p-12">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          <div className="xl:col-span-2 space-y-4 lg:space-y-6">
            <Card className="bg-transparent border-secondary overflow-hidden">
              <CardHeader className="pb-4 mb-5">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg lg:text-xl text-white">Basic Information</CardTitle>

                  <div>
                    {canEdit && (
                      <Button
                        onClick={() => setIsEditDialogOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        size="sm"
                      >
                        <EditIcon className="mr-1 h-4 w-4" />
                        Edit Proposal
                      </Button>
                    )}
                    <Button
                      onClick={() => generateSummary({
                        title: proposal?.title,
                        description: proposal?.description,
                        createdAt: proposal?.createdAt,
                        expiresAt: proposal?.expiresAt,
                        status: proposal?.status,
                        authorName: proposal?.author?.name
                      })}
                      className="border border-secondary text-white"
                      size="sm"
                    >
                      <SparklesIcon className="mr-1 h-4 w-4" />
                      Generate Summary
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Title</label>
                    <p className="text-slate-200 text-sm lg:text-base break-words">{proposal?.title}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Status</label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(proposal?.status)}
                      {getStatusBadge(proposal?.status)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Author</label>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
                        {proposal?.author.image ? (
                          <img
                            src={proposal?.author.image}
                            alt={proposal?.author.name}
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <UserIcon className="h-3 w-3 text-slate-400" />
                        )}
                      </div>
                      <span className="text-slate-200 text-sm lg:text-base truncate">{proposal?.author.name}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Created</label>
                    <p className="text-slate-200 text-sm lg:text-base">
                      {formatDistanceToNow(new Date(proposal?.createdAt), { addSuffix: true, locale: enUS })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Updated</label>
                    <p className="text-slate-200 text-sm lg:text-base">
                      {formatDistanceToNow(new Date(proposal?.updatedAt), { addSuffix: true, locale: enUS })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Expired</label>
                    <p className="text-slate-200 text-sm lg:text-base">
                      {formatDistanceToNow(new Date(proposal?.expiresAt), { addSuffix: true, locale: enUS })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Type</label>
                    <p className="text-slate-200 text-sm lg:text-base">
                      {proposal?.proposalType === 'COMMUNITY_PROPOSAL' ? 'Community Proposal' : 'Quarterly Report & Proposal'}
                    </p>
                  </div>
                  {proposal?.proposalType === 'QUARTERLY_REPORT' && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">Quarter</label>
                        <p className="text-slate-200 text-sm lg:text-base">
                          {proposal?.quarter || '-'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">Year</label>
                        <p className="text-slate-200 text-sm lg:text-base">
                          {typeof (proposal as any)?.year === 'number' ? (proposal as any).year : '-'}
                        </p>
                      </div>
                    </>
                  )}
                </div>



                {
                  summary || isSummaryLoading ? (
                    <div className="mt-10">
                      <h2 className="mb-4 font-bold">Summary</h2>

                      {
                        isSummaryLoading ? (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <SparklesIcon className="h-4 w-4 animate-pulse" />
                            Generating summary...
                          </div>
                        ) : (
                          <p className="text-slate-200 text-sm lg:text-base leading-relaxed whitespace-pre-wrap break-words">{summary}</p>
                        )
                      }
                    </div>
                  ) : ""
                }

              </CardContent>
            </Card>

            <Card className="bg-transparent border-secondary overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg lg:text-xl text-white">Description</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-start items-start w-full gap-5">
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p(props) {
                      return <p className="block" {...props} />;
                    },
                    a(props) {
                      return (
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold cursor-pointer text-blue-600! underline"
                          {...props}
                        />
                      );
                    },
                    ul(props) {
                      return <ul className="list-disc pl-6 flex flex-col justify-center items-start gap-4" {...props} />;
                    },
                    ol(props) {
                      return <ol className="list-decimal pl-6 flex flex-col justify-center items-start gap-4" {...props} />;
                    },
                    h1: (props) => <h1 className="mt-0 text-5xl font-bold" {...props} />,
                    h2: (props) => <h2 className="mt-6 text-4xl font-semibold" {...props} />,
                    h3: (props) => <h3 className="mt-6 text-3xl font-semibold" {...props} />,
                    h4: (props) => <h4 className="mt-6 text-2xl font-medium" {...props} />,
                    h5: (props) => <h5 className="mt-6 text-xl font-medium" {...props} />,
                    h6: (props) => <h6 className="mt-6 text-lg font-medium" {...props} />,
                    blockquote: (props) => (
                      <blockquote
                        className="border-l-4 border-slate-500 pl-4 italic text-slate-300 my-4"
                        {...props}
                      />
                    ),
                    code: ({ node, className, children, ...props }) =>
                      node?.tagName === "code" ? (
                        <code
                          className="bg-slate-800! text-white! px-1 py-0.5! rounded !font-mono! text-sm"
                          {...props}
                        >
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-slate-900! p-4 rounded-lg overflow-x-auto my-4 ">
                          <code className="font-mono text-sm" {...props}>
                            {children} aaa
                          </code>
                        </pre>
                      ),
                    pre: ({ node, className, children, ...props }) =>
                      <pre className="bg-slate-900! text-slate-200! p-4 rounded-lg overflow-x-auto my-4 [&_*]:bg-transparent! w-full!">
                        <code className="font-mono text-sm bg-transparent!" {...props}>
                          {children}
                        </code>
                      </pre>
                  }}
                >
                  {proposal?.description || ""}
                </Markdown>

              </CardContent>
            </Card>

            {/* Attachment */}
            {proposal?.attachment && (
              <Card className="bg-transparent border-secondary overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl text-white">Attachment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => proposal?.attachment && window.open(proposal?.attachment, '_blank')}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download Attachment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {proposal?.workGroupIds && proposal?.workGroupIds.length > 0 && (
              <Card className="bg-transparent border-secondary overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl text-white">{proposal?.proposalType === "COMMUNITY_PROPOSAL" ? "Associated WorkGroups" : "Associated WorkGroup"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {proposal?.workGroupIds.map((workGroupId: string) => {
                      const wg = workGroups.find(wg => wg.id === workGroupId);
                      return (
                        <Badge key={workGroupId} variant="outline" className="bg-purple-600/20 text-purple-300 border-secondary">
                          {wg ? wg.name : workGroupId}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {proposal?.links && proposal?.links.length > 0 && (
              <Card className="bg-transparent border-secondary overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl text-white">Relevant Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1">
                    {proposal?.links.map((link: any, idx: number) => (
                      <li key={idx}>
                        <Link href={typeof link === 'string' ? link : link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600! hover:text-blue-300 underline! break-all">
                          {typeof link === 'string' ? link : (link.title || link.url)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {proposal?.budgetItems && Array.isArray(proposal?.budgetItems) && proposal?.budgetItems.length > 0 && (
              <Card className="bg-transparent border-secondary overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl text-white">Budget Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {proposal?.budgetItems.map((item: any, index: number) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-end justify-between p-3 bg-slate-800/30 rounded-lg border border-secondary">
                        <div className="flex-1 min-w-0">
                          {
                            item?.name ? (
                              <p className="text-xl font-semibold mb-4">{item?.name}</p>
                            ) : ""
                          }
                          <p className="text-slate-200 font-medium text-sm lg:text-base">
                            {item.description || `Item ${index + 1}`}
                          </p>
                          {item.type && (
                            <p className="text-slate-400 text-xs font-normal lg:text-sm mt-5"><span className="font-bold">Type:</span> {item.type}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">

                          <span className="text-green-400 font-semibold text-sm lg:text-base ml-2">
                            {formatToDollar(item.total || item.amount || 0)}
                          </span>
                          <span className="text-green-400 font-semibold text-sm lg:text-base ml-2">
                            AGIX {getAgixFromDollars(item.total || item.amount || 0)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-start pt-3 border-t border-secondary">
                      <span className="text-slate-300 font-semibold text-sm lg:text-base">Total Budget:</span>
                      <div className="flex flex-col items-end justify-start gap-2 mt-2 sm:mt-0">
                        <span className="text-green-400 font-bold text-lg">
                          {formatToDollar(totalBudget)}
                        </span>
                        <span className="text-green-400 font-bold text-lg">
                          AGIX {getAgixFromDollars(totalBudget)}
                        </span>
                      </div>
                    </div>
                    {/* Percent breakdown for Admin and Operative */}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-300 text-sm">
                        Admin: {totalBudget > 0 ? ((adminBudget / totalBudget) * 100).toFixed(1) : '0'}%
                      </span>
                      <span className="text-slate-300 text-sm">
                        Operative: {totalBudget > 0 ? ((operativeBudget / totalBudget) * 100).toFixed(1) : '0'}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-transparent border-secondary overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg lg:text-xl text-white flex items-center gap-2">
                  <MessageSquareIcon className="h-5 w-5" />
                  Comments & Discussion
                </CardTitle>
              </CardHeader>
              <CardContent>
                {proposal?.status !== "EXPIRED" && (
                  <form onSubmit={handleSubmitComment} className="mb-6">
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add your comment or feedback..."
                      className="min-h-[100px] bg-slate-700 border-secondary text-slate-50 focus:border-purple-500 mb-2"
                      disabled={isSubmittingComment}
                    />
                    <Button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={!comment?.trim() || isSubmittingComment}
                    >
                      {isSubmittingComment ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <SendIcon className="mr-2 h-4 w-4" />
                          Submit Comment
                        </>
                      )}
                    </Button>
                  </form>
                )}

                {proposal?.comments && proposal?.comments.length > 0 ? (
                  <div className="space-y-4">
                    <p className="px-4 text-end flex items-center justify-start text-slate-400 text-sm gap-3">
                      <MessageSquareIcon className="h-5 w-5 text-blue-400" />

                      Total comments: {commentsCount}
                    </p>

                    {sortTreeByDateDesc(proposal?.comments).map((c: any) => (
                      <CommentThread
                        key={c?.id}
                        comment={c}
                        onReply={handleSubmitReply}
                        isSubmittingReply={isSubmittingReply}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <MessageSquareIcon className="mx-auto h-12 w-12 text-slate-500 mb-2" />
                    <p className="text-slate-400">No comments yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Sidebar */}
          <div className="xl:col-span-1 space-y-4 lg:space-y-6">
            {/* Timeline de la Propuesta */}
            <Card className="bg-transparent border-secondary overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg lg:text-xl text-white">Proposal Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ProposalTimeline
                  createdAt={proposal?.createdAt}
                  expiresAt={proposal?.expiresAt}
                  status={proposal?.status}
                  updatedAt={proposal?.updatedAt}
                  consensusDate={proposal?.consensusDate}
                />
              </CardContent>
            </Card>

            <Card className="bg-transparent border-secondary overflow-hidden">
              <CardContent>
                <ConsensusTracking
                  proposal={proposal}
                  onVote={handleVote}
                  onComment={async (content: string) => { }}
                  onReply={async (content: string, commentId: string) => { }}
                  isSubmittingVote={isSubmittingVote}
                  isSubmittingComment={isSubmittingComment}
                  canVote={canVote}
                />

                <div className="mt-6">
                  <h4 className="text-slate-200 font-semibold mb-3">All Arguments</h4>
                  {proposal?.votes && proposal?.votes.length > 0 ? (
                    <div className="space-y-3">
                      {proposal?.votes
                        .filter((v) => v.type !== "POSITIVE")
                        .slice()
                        .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                        .map((vote) => {
                          const userComment = (proposal?.comments || []).find((c: any) => c?.user?.id === vote.user?.id && !c?.parentId)
                          const commentText = (typeof vote.comment === 'string' && vote.comment?.trim().length > 0)
                            ? vote.comment?.trim()
                            : (userComment?.content?.trim() || '')
                          const voteLabel = vote.type === "POSITIVE" ? "Consent" : vote.type === "NEGATIVE" ? "Object" : "Abstain"
                          const voteColor = vote.type === "POSITIVE" ? "text-green-400 border-secondary bg-green-900/20" : vote.type === "NEGATIVE" ? "text-red-400 border-secondary bg-red-900/20" : "text-yellow-400 border-secondary bg-yellow-900/20"
                          const Icon = vote.type === "POSITIVE" ? ThumbsUpIcon : vote.type === "NEGATIVE" ? ThumbsDownIcon : HandIcon
                          return (
                            <div key={vote.id} className="p-3 bg-slate-800/30 rounded-lg border border-secondary">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
                                    {vote.user?.image ? (
                                      <img src={vote.user?.image} alt={vote.user?.name} className="h-8 w-8 rounded-full" />
                                    ) : (
                                      <UserIcon className="h-4 w-4 text-slate-300" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-slate-200 font-medium truncate">{vote.user?.name || "Unknown"}</p>
                                    <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${voteColor}`}>
                                      <Icon className="h-3 w-3" />
                                      {voteLabel}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xs text-slate-400 shrink-0">
                                  {vote.createdAt ? format(new Date(vote.createdAt), "MMM d, yyyy · h:mm a", { locale: enUS }) : ""}
                                </div>
                              </div>
                              <div className="mt-2 text-sm text-slate-300 whitespace-pre-line break-words">
                                {commentText.length > 0
                                  ? renderTextWithLinks(commentText)
                                  : <span className="text-slate-500">No comment</span>}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  ) : (
                    <p className="text-slate-400">No votes yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6">
            <Alert className="bg-red-500/10 border-secondary text-red-400">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Edit Dialog */}
        <EditProposalDialog
          proposal={proposal}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      </div>
    </div>
  )
}
