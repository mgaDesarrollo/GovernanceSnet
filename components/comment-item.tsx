"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageSquareIcon, ReplyIcon, ThumbsUpIcon, ThumbsDownIcon } from "lucide-react"

interface CommentUser {
  id: string
  name: string
  email: string
  image?: string | null
}

interface Comment {
  id: string
  content: string
  createdAt: string
  likes: string[]
  dislikes: string[]
  user: CommentUser
  replies?: Comment[]
}

interface CommentItemProps {
  comment: Comment
  currentUserId?: string
  onReply: (parentCommentId: string, content: string) => Promise<void>
  onLike: (commentId: string) => Promise<void>
  onDislike: (commentId: string) => Promise<void>
  isAdmin?: boolean
}

export function CommentItem({ 
  comment, 
  currentUserId, 
  onReply, 
  onLike, 
  onDislike, 
  isAdmin = false 
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [submittingReply, setSubmittingReply] = useState(false)

  const handleReply = async () => {
    if (!replyContent.trim()) return
    
    try {
      setSubmittingReply(true)
      await onReply(comment.id, replyContent.trim())
      setReplyContent("")
      setShowReplyForm(false)
    } catch (error) {
      console.error("Error submitting reply:", error)
    } finally {
      setSubmittingReply(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const isLiked = currentUserId && comment.likes.includes(currentUserId)
  const isDisliked = currentUserId && comment.dislikes.includes(currentUserId)

  return (
    <div className="border border-secondary rounded-lg p-4 mb-4">
      {/* Main Comment */}
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.user.image || undefined} />
          <AvatarFallback className="bg-purple-600 text-white text-xs">
            {getInitials(comment.user.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-slate-200">{comment.user.name}</span>
            {isAdmin && (
              <Badge variant="secondary" className="text-xs">Admin</Badge>
            )}
            <span className="text-sm text-slate-400">{formatDate(comment.createdAt)}</span>
          </div>
          
          <p className="text-slate-300 mb-3">{comment.content}</p>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-4 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1 ${isLiked ? 'text-green-400' : 'text-slate-400'}`}
            >
              <ThumbsUpIcon className="w-4 h-4" />
              <span>{comment.likes.length}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDislike(comment.id)}
              className={`flex items-center gap-1 ${isDisliked ? 'text-red-400' : 'text-slate-400'}`}
            >
              <ThumbsDownIcon className="w-4 h-4" />
              <span>{comment.dislikes.length}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-slate-400"
            >
              <ReplyIcon className="w-4 h-4" />
              <span>Reply</span>
            </Button>
          </div>
          
          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-4 p-3 bg-slate-700 rounded-lg">
              <Textarea
                placeholder="Write your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="bg-slate-600 border-slate-500 text-slate-200 mb-2"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReplyForm(false)}
                  disabled={submittingReply}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyContent.trim() || submittingReply}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {submittingReply ? "Posting..." : "Post Reply"}
                </Button>
              </div>
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
                  <AvatarFallback className="bg-purple-600 text-white text-xs">
                    {getInitials(reply.user.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-200 text-sm">{reply.user.name}</span>
                    <span className="text-xs text-slate-400">{formatDate(reply.createdAt)}</span>
                  </div>
                  
                  <p className="text-slate-300 text-sm">{reply.content}</p>
                  
                  {/* Reply Action Buttons */}
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLike(reply.id)}
                      className={`flex items-center gap-1 ${currentUserId && reply.likes.includes(currentUserId) ? 'text-green-400' : 'text-slate-400'}`}
                    >
                      <ThumbsUpIcon className="w-3 h-3" />
                      <span>{reply.likes.length}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDislike(reply.id)}
                      className={`flex items-center gap-1 ${currentUserId && reply.dislikes.includes(currentUserId) ? 'text-red-400' : 'text-slate-400'}`}
                    >
                      <ThumbsDownIcon className="w-3 h-3" />
                      <span>{reply.dislikes.length}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 