"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquareIcon, SendIcon, ReplyIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Comment {
  id: string
  content: string
  createdAt: string
  likes: string[]
  dislikes: string[]
  user: {
    id: string
    name: string
    image?: string | null
  }
  replies?: Comment[]
}

interface CommentsSectionProps {
  proposalId: string
}

export default function CommentsSection({ proposalId }: CommentsSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [proposalId])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}/comment`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/proposals/${proposalId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      })

      if (response.ok) {
        setNewComment('')
        fetchComments()
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (commentId: string) => {
    if (!replyContent.trim() || isSubmittingReply) return

    try {
      setIsSubmittingReply(true)
      const response = await fetch(`/api/proposals/${proposalId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: replyContent.trim(),
          parentId: commentId 
        })
      })

      if (response.ok) {
        setReplyContent('')
        setReplyingTo(null)
        fetchComments()
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleVote = async (commentId: string, voteType: 'like' | 'dislike') => {
    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType })
      })

      if (response.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      {session?.user && (
        <div className="bg-black/30 rounded-lg p-4 border border-secondary">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add your comment or feedback..."
              className="min-h-[100px] bg-black border-secondary text-slate-50 focus:border-purple-500 resize-none"
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200"
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? (
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
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-black/30 rounded-lg p-4 border border-secondary">
              {/* Main Comment */}
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.user.image || undefined} />
                  <AvatarFallback className="bg-linear-to-br from-purple-500 to-blue-600 text-white text-xs">
                    {getInitials(comment.user.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-slate-200">{comment.user.name}</span>
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-slate-300 mb-3 leading-relaxed">{comment.content}</p>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(comment.id, 'like')}
                      className="flex items-center gap-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10"
                    >
                      <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-xs">👍</span>
                      </div>
                      <span className="font-medium">{comment.likes.length}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(comment.id, 'dislike')}
                      className="flex items-center gap-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
                        <span className="text-xs">👎</span>
                      </div>
                      <span className="font-medium">{comment.dislikes.length}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="flex items-center gap-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                    >
                      <ReplyIcon className="w-4 h-4" />
                      <span>Reply</span>
                    </Button>
                  </div>
                  
                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mt-4 p-3 bg-black/50 rounded-lg border border-secondary">
                      <form onSubmit={(e) => { e.preventDefault(); handleSubmitReply(comment.id); }}>
                        <Textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write your reply..."
                          className="min-h-[80px] bg-black border-secondary text-slate-50 focus:border-blue-500 mb-3 resize-none"
                          disabled={isSubmittingReply}
                        />
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                            disabled={!replyContent.trim() || isSubmittingReply}
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
                            onClick={() => {
                              setReplyingTo(null)
                              setReplyContent("")
                            }}
                            className="border-secondary text-slate-300 hover:bg-black/50"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ml-8 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="border-l-2 border-secondary pl-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={reply.user.image || undefined} />
                          <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-xs">
                            {getInitials(reply.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-200 text-sm">{reply.user.name}</span>
                            <span className="text-xs text-slate-400">
                              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <p className="text-slate-300 text-sm leading-relaxed">{reply.content}</p>
                          
                          {/* Reply Action Buttons */}
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVote(reply.id, 'like')}
                              className="flex items-center gap-1 text-slate-400 hover:text-green-400 hover:bg-green-500/10 p-1 h-auto"
                            >
                              <div className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center">
                                <span className="text-xs">👍</span>
                              </div>
                              <span className="font-medium">{reply.likes.length}</span>
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVote(reply.id, 'dislike')}
                              className="flex items-center gap-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-1 h-auto"
                            >
                              <div className="w-3 h-3 rounded-full bg-red-500/20 flex items-center justify-center">
                                <span className="text-xs">👎</span>
                              </div>
                              <span className="font-medium">{reply.dislikes.length}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquareIcon className="mx-auto h-12 w-12 text-slate-500 mb-3" />
          <p className="text-slate-400 font-medium">No comments yet</p>
          <p className="text-slate-500 text-sm">Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  )
}
