"use client"

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  ThumbsUpIcon,
  ThumbsDownIcon,
  HandIcon,
  MessageSquareIcon,
  CheckIcon,
  XIcon,
  UserIcon
} from 'lucide-react'
import type { Proposal, VoteTypeEnum } from '@/lib/types'
import { VoteProgressBar } from './vote-prograss-bar'

interface ConsensusTrackingProps {
  proposal: Proposal
  onVote: (voteType: VoteTypeEnum, comment?: string) => Promise<void>
  onComment: (content: string, parentId?: string) => Promise<void>
  onReply: (content: string, commentId: string) => Promise<void>
  isSubmittingVote: boolean
  isSubmittingComment: boolean
  canVote: boolean
}

export default function ConsensusTracking({
  proposal,
  onVote,
  isSubmittingVote,
  canVote
}: ConsensusTrackingProps) {
  const [activeTab, setActiveTab] = useState('voting')
  const [voteType, setVoteType] = useState<VoteTypeEnum | null>(null)
  const [voteComment, setVoteComment] = useState('')
  const [coreContributorsCount, setCoreContributorsCount] = useState(0)

  const handleVote = async () => {
    if (!voteType) return

    if (voteType === 'NEGATIVE' && !voteComment.trim()) {
      alert('An object vote requires a comment explaining your reasoning.')
      return
    }
    if (voteType === 'ABSTAIN' && !voteComment.trim()) {
      alert('An abstain vote requires a comment explaining your reasoning.')
      return
    }

    await onVote(voteType, voteComment.trim() || undefined)
    setVoteType(null)
    setVoteComment('')
  }
  const fetchCoreContributorsCount = async () => {
    try {
      const response = await fetch("/api/public-profiles/count")
      if (response.ok) {
        const data = await response.json()
        setCoreContributorsCount(data?.count || 0)
      } else {
        console.error("Failed to fetch core contrubutors count")
      }
    } catch (error) {
      console.error("Error fetching core contrubutors count:", error)
    }
  }
  useEffect(() => {
    fetchCoreContributorsCount()
  }, [])

  useEffect(() => {
    if (proposal.comments) {
      const initialLikes: Record<string, { likes: number; dislikes: number; userLike?: 'like' | 'dislike' | null }> = {}
      proposal.comments.forEach(comment => {
        initialLikes[comment.id] = { likes: 0, dislikes: 0 }
      })
    }
  }, [proposal.comments])

  const getVoteIcon = (type: VoteTypeEnum) => {
    switch (type) {
      case 'POSITIVE':
        return <ThumbsUpIcon className="h-5 w-5 text-green-300" />
      case 'NEGATIVE':
        return <ThumbsDownIcon className="h-5 w-5 text-red-300" />
      case 'ABSTAIN':
        return <HandIcon className="h-5 w-5 text-yellow-300" />
    }
  }

  const getVoteColor = (type: VoteTypeEnum) => {
    switch (type) {
      case 'POSITIVE':
        return 'bg-green-500/30 text-green-200 border-green-400/50 font-medium'
      case 'NEGATIVE':
        return 'bg-red-500/30 text-red-200 border-red-400/50 font-medium'
      case 'ABSTAIN':
        return 'bg-yellow-500/30 text-yellow-200 border-yellow-400/50 font-medium'
    }
  }

  const getVoteText = (type: VoteTypeEnum) => {
    switch (type) {
      case 'POSITIVE':
        return 'Consent'
      case 'NEGATIVE':
        return 'Object'
      case 'ABSTAIN':
        return 'Abstain'
    }
  }

  return (
    <div className="border-l-4 border-secondary rounded-sm overflow-hidden shadow-lg mb-6">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-600 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M14 8.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0" />
              <path d="M8 11.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0" />
              <path d="M20 11.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Consent Tracking</h3>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-1 bg-transparent  mb-4">
            <TabsTrigger value="voting" className="data-[state=active]:border-b-2 data-[state=active]:border-secondary rounded-none">
              Interactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voting" className="mt-4">
            {canVote ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Button
                    variant={voteType === "POSITIVE" ? "default" : "outline-solid"}
                    className={`${voteType === "POSITIVE"
                      ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25"
                      : "bg-green-500/20 border-green-500/40 hover:bg-green-500/30 text-green-300 hover:text-green-200"
                      } transition-all duration-200 font-medium`}
                    onClick={() => setVoteType("POSITIVE")}
                    disabled={isSubmittingVote}
                  >
                    {voteType === "POSITIVE" && <CheckIcon className="mr-1 h-4 w-4" />}
                    <ThumbsUpIcon className="h-4 w-4" />
                    <span className="ml-1">Consent</span>
                  </Button>
                  <Button
                    variant={voteType === "NEGATIVE" ? "default" : "outline-solid"}
                    className={`${voteType === "NEGATIVE"
                      ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25"
                      : "bg-red-500/20 border-red-500/40 hover:bg-red-500/30 text-red-300 hover:text-red-200"
                      } transition-all duration-200 font-medium`}
                    onClick={() => setVoteType("NEGATIVE")}
                    disabled={isSubmittingVote}
                  >
                    {voteType === "NEGATIVE" && <CheckIcon className="mr-1 h-4 w-4" />}
                    <ThumbsDownIcon className="h-4 w-4" />
                    <span className="ml-1">Object</span>
                  </Button>
                  <Button
                    variant={voteType === "ABSTAIN" ? "default" : "outline-solid"}
                    className={`${voteType === "ABSTAIN"
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-500/25"
                      : "bg-yellow-500/20 border-yellow-500/40 hover:bg-yellow-500/30 text-yellow-300 hover:text-yellow-200"
                      } transition-all duration-200 font-medium col-start-1 col-end-3`}
                    onClick={() => setVoteType("ABSTAIN")}
                    disabled={isSubmittingVote}
                  >
                    {voteType === "ABSTAIN" && <CheckIcon className="mr-1 h-4 w-4" />}
                    <HandIcon className="h-4 w-4" />
                    <span className="ml-1">Abstain</span>
                  </Button>
                </div>

                {voteType && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getVoteIcon(voteType)}
                      <Badge variant="outline" className={getVoteColor(voteType)}>
                        {getVoteText(voteType)}
                      </Badge>
                      {(voteType === 'NEGATIVE' || voteType === 'ABSTAIN') && (
                        <Badge variant="outline" className="bg-orange-500/30 text-orange-200 border-orange-400/50 font-medium">
                          Comment Required
                        </Badge>
                      )}
                    </div>

                    {(voteType === 'NEGATIVE' || voteType === 'ABSTAIN') && (
                      <div>
                        {voteType === 'NEGATIVE' && (
                          <div className="mb-3 text-sm text-slate-300">
                            Explain why you are against it
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            {voteType === 'NEGATIVE' ? 'Your objection' : 'Reason for abstaining'}
                          </label>
                          <Textarea
                            value={voteComment}
                            onChange={(e) => setVoteComment(e.target.value)}
                            placeholder={voteType === 'NEGATIVE' ? 'What, specifically, would need to change in order to obtain your consent?' : 'Explain why you abstain...'}
                            className="min-h-[100px] bg-slate-700 border-secondary text-slate-50 focus:border-purple-500"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        onClick={handleVote}
                        disabled={isSubmittingVote || (voteType !== 'POSITIVE' && !voteComment.trim())}
                        className={`${voteType === 'POSITIVE'
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25'
                          : voteType === 'NEGATIVE'
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25'
                            : 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-500/25'
                          } transition-all duration-200 font-medium`}
                      >
                        {isSubmittingVote ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="mr-2 h-4 w-4" />
                            Submit {voteType === 'POSITIVE' ? 'Consent' : voteType === 'NEGATIVE' ? 'Object' : 'Abstain'} Vote
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setVoteType(null)
                          setVoteComment('')
                        }}
                        className="bg-slate-700/50 border-secondary hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all duration-200"
                      >
                        <XIcon className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 rounded-lg border border-secondary">
                  <h4 className="font-semibold text-white mb-4 text-center">Vote Summary</h4>
                  <div className="flex flex-col justify-start items-start gap-4 text-center">
                    <div className="p-3 border-l-4 border-green-500 rounded-md w-full">
                      <div className="text-3xl font-bold text-green-300 mb-1">{proposal.positiveVotes}</div>
                      <div className="text-sm text-green-200 font-medium">Consent</div>
                    </div>
                    <div className="p-3 border-l-4 border-red-500 rounded-md w-full">
                      <div className="text-3xl font-bold text-red-300 mb-1">{proposal.negativeVotes}</div>
                      <div className="text-sm text-red-200 font-medium">Object</div>
                    </div>
                    <div className="p-3 border-l-4 border-yellow-500 rounded-md w-full">
                      <div className="text-3xl font-bold text-yellow-300 mb-1">{proposal.abstainVotes}</div>
                      <div className="text-sm text-yellow-200 font-medium">Abstain</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-slate-300 border border-secondary rounded-md">
                Voting is currently closed for this proposal.

                <div className="mt-6 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-4 text-center">Vote Summary</h4>
                  <div className="flex flex-col justify-start items-start gap-4 text-center">
                    <div className="p-3 border-l-4 border-green-500 rounded-md w-full">
                      <div className="text-3xl font-bold text-green-300 mb-1">{proposal.positiveVotes}</div>
                      <div className="text-sm text-green-200 font-medium">Consent</div>
                    </div>
                    <div className="p-3 border-l-4 border-red-500 rounded-md w-full">
                      <div className="text-3xl font-bold text-red-300 mb-1">{proposal.negativeVotes}</div>
                      <div className="text-sm text-red-200 font-medium">Object</div>
                    </div>
                    <div className="p-3 border-l-4 border-yellow-500 rounded-md w-full">
                      <div className="text-3xl font-bold text-yellow-300 mb-1">{proposal.abstainVotes}</div>
                      <div className="text-sm text-yellow-200 font-medium">Abstain</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <VoteProgressBar
              totalContributors={coreContributorsCount}
              positiveVotes={proposal?.positiveVotes || 0}
              negativeVotes={proposal?.negativeVotes || 0}
              className="mt-4"
            />
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <div className="space-y-4">
              {(() => {
                const interactions = (proposal.votes || []).filter(v => typeof v.comment === 'string' && v.comment.trim().length > 0)
                if (interactions.length === 0) {
                  return (
                    <div className="text-center py-6">
                      <MessageSquareIcon className="mx-auto h-12 w-12 text-slate-500 mb-2" />
                      <p className="text-slate-400">No interactions yet</p>
                    </div>
                  )
                }
                return (
                  <div className="space-y-3">
                    {interactions
                      .slice()
                      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                      .map((vote) => {
                        const voteLabel = vote.type === "POSITIVE" ? "Consent" : vote.type === "NEGATIVE" ? "Object" : "Abstain"
                        const voteColor = vote.type === "POSITIVE" ? "text-green-400 border-secondary bg-green-900/20" : vote.type === "NEGATIVE" ? "text-red-400 border-secondary bg-red-900/20" : "text-yellow-400 border-secondary bg-yellow-900/20"
                        const Icon = vote.type === "POSITIVE" ? ThumbsUpIcon : vote.type === "NEGATIVE" ? ThumbsDownIcon : HandIcon
                        return (
                          <div key={vote.id} className="p-3 bg-slate-800/30 rounded-lg border border-secondary">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
                                  {vote.user?.image ? (
                                    <img src={vote.user.image} alt={vote.user.name} className="h-8 w-8 rounded-full" />
                                  ) : (
                                    <UserIcon className="h-4 w-4 text-slate-300" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-slate-200 font-medium truncate">{vote.user?.name || "Unknown"}</p>
                                  <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${voteColor}`}>
                                    <Icon className="h-3 w-3" />
                                    <span>{voteLabel}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-slate-300 truncate max-w-[50%]">
                                {vote.comment?.trim() || <span className="text-slate-500">No comment</span>}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )
              })()}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
