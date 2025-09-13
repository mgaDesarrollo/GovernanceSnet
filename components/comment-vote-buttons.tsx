"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ThumbsUpIcon, ThumbsDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CommentVoteButtonsProps {
  commentId: string
  initialLikes: string[]
  initialDislikes: string[]
  onVoteUpdate?: (likesCount: number, dislikesCount: number, userVote: string | null) => void
}

export default function CommentVoteButtons({
  commentId,
  initialLikes = [],
  initialDislikes = [],
  onVoteUpdate
}: CommentVoteButtonsProps) {
  const { data: session } = useSession()
  const [likes, setLikes] = useState<string[]>(initialLikes)
  const [dislikes, setDislikes] = useState<string[]>(initialDislikes)
  const [isVoting, setIsVoting] = useState(false)

  const userId = session?.user?.id
  const userLiked = userId ? likes.includes(userId) : false
  const userDisliked = userId ? dislikes.includes(userId) : false

  const handleVote = async (voteType: 'like' | 'dislike') => {
    if (!userId || isVoting) return

    setIsVoting(true)
    
    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType }),
      })

      if (response.ok) {
        const data = await response.json()
        
        setLikes(data.comment.likes || [])
        setDislikes(data.comment.dislikes || [])
        
        if (onVoteUpdate) {
          onVoteUpdate(
            data.comment.likes?.length || 0, 
            data.comment.dislikes?.length || 0, 
            data.userVote
          )
        }
      } else {
        const errorData = await response.json()
        console.error('Error voting:', errorData.error)
      }
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Like Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('like')}
        disabled={isVoting || !userId}
        className={`flex items-center gap-2 px-3 py-1.5 h-auto transition-all duration-200 ${
          userLiked
            ? 'text-green-500 bg-green-500/10 hover:bg-green-500/20'
            : 'text-slate-400 hover:text-green-500 hover:bg-green-500/10'
        }`}
      >
        <ThumbsUpIcon className="h-4 w-4" />
        <span className="text-sm font-medium">{likes.length}</span>
      </Button>

      {/* Dislike Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('dislike')}
        disabled={isVoting || !userId}
        className={`flex items-center gap-2 px-3 py-1.5 h-auto transition-all duration-200 ${
          userDisliked
            ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20'
            : 'text-slate-400 hover:text-red-500 hover:bg-red-500/10'
        }`}
      >
        <ThumbsDownIcon className="h-4 w-4" />
        <span className="text-sm font-medium">{dislikes.length}</span>
      </Button>
    </div>
  )
}