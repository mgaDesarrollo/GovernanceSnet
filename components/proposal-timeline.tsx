"use client"

import React from 'react'
import { Timeline, TimelineItem, TimelinePoint, TimelineContent, TimelineTime, TimelineTitle, TimelineBody } from 'flowbite-react'
import { formatDistanceToNow, format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { CalendarIcon, TargetIcon, VoteIcon, CheckCircleIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ProposalTimelineProps {
  createdAt: string
  expiresAt: string
  status: string
  consensusDate?: string | null
  updatedAt?: string | null
}

const ProposalTimeline: React.FC<ProposalTimelineProps> = ({
  createdAt,
  expiresAt,
  status,
  consensusDate,
  updatedAt
}) => {
  const now = new Date()

  const getEventStatus = (eventDate: string): 'completed' | 'upcoming' => {
    const eventDateObj = new Date(eventDate)
    return eventDateObj < now ? 'completed' : 'upcoming'
  }

  return (
    <div className="bg-slate-800/50 rounded-lg border border-secondary p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <CalendarIcon className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-200">Timeline</h3>
          <p className="text-sm text-slate-400">Proposal progress</p>
        </div>
      </div>

      <Timeline className="border-l-2 border-secondary">
        <TimelineItem>
          <div className="flex items-center mb-4">
            <div className="bg-gray-900 p-1.5 rounded-full">
              <CalendarIcon className="h-4 w-4 text-green-500" />
            </div>
          </div>
          <div className="absolute -left-1.5 mt-1.5">
            <div className="h-3 w-3 rounded-full border-2 border-secondary bg-gray-900"></div>
          </div>
          <TimelineContent className="ml-4">
            <TimelineTime className="text-slate-400 text-sm">
              {format(new Date(createdAt), 'MMM dd, yyyy · h:mm a', { locale: enUS })}
            </TimelineTime>
            <TimelineTitle className="text-slate-200 text-base font-semibold">
              Proposal Created
            </TimelineTitle>
            <TimelineBody className="text-slate-400 text-sm mb-2">
              The proposal was created and submitted for review.
            </TimelineBody>
            <Badge variant="outline" className="bg-green-500/20 text-green-300 border-secondary">
              Completed
            </Badge>
          </TimelineContent>
        </TimelineItem>

        {updatedAt && (
          <TimelineItem>
            <div className="flex items-center mb-4">
              <div className="bg-gray-900 p-1.5 rounded-full">
                <TargetIcon className="h-4 w-4 text-yellow-500" />
              </div>
            </div>
            <div className="absolute -left-1.5 mt-1.5">
              <div className="h-3 w-3 rounded-full border-2 border-secondary bg-gray-900"></div>
            </div>
            <TimelineContent className="ml-4">
              <TimelineTime className="text-slate-400 text-sm">
                {format(new Date(updatedAt), 'MMM dd, yyyy · h:mm a', { locale: enUS })}
              </TimelineTime>
              <TimelineTitle className="text-slate-200 text-base font-semibold">
                Proposal Updated
              </TimelineTitle>
              <TimelineBody className="text-slate-400 text-sm mb-2">
                The proposal was modified by the author.
              </TimelineBody>
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-secondary">
                Edited
              </Badge>
            </TimelineContent>
          </TimelineItem>
        )}

        <TimelineItem>
          <div className="flex items-center mb-4">
            <div className="bg-gray-900 p-1.5 rounded-full">
              <VoteIcon className="h-4 w-4 text-purple-500" />
            </div>
          </div>
          <div className="absolute -left-1.5 mt-1.5">
            <div className="h-3 w-3 rounded-full border-2 border-secondary bg-gray-900"></div>
          </div>
          <TimelineContent className="ml-4">
            <TimelineTime className="text-slate-400 text-sm">
              {format(new Date(expiresAt), 'MMM dd, yyyy · h:mm a', { locale: enUS })}
            </TimelineTime>
            <TimelineTitle className="text-slate-200 text-base font-semibold">
              Concent Period
            </TimelineTitle>
            <TimelineBody className="text-slate-400 text-sm mb-2">
              Period for the community to give consent on the proposal.
            </TimelineBody>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-secondary">
              {getEventStatus(expiresAt) === 'completed' ? 'Completed' : 'Active'}
            </Badge>
          </TimelineContent>
        </TimelineItem>

        {consensusDate && (
          <TimelineItem>
            <div className="flex items-center mb-4">
              <div className="bg-gray-900 p-1.5 rounded-full">
                <CheckCircleIcon className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <div className="absolute -left-1.5 mt-1.5">
              <div className="h-3 w-3 rounded-full border-2 border-secondary bg-gray-900"></div>
            </div>
            <TimelineContent className="ml-4">
              <TimelineTime className="text-slate-400 text-sm">
                {format(new Date(consensusDate), 'MMM dd, yyyy · h:mm a', { locale: enUS })}
              </TimelineTime>
              <TimelineTitle className="text-slate-200 text-base font-semibold">
                Consensus Reached
              </TimelineTitle>
              <TimelineBody className="text-slate-400 text-sm mb-2">
                The proposal reached community consensus.
              </TimelineBody>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-secondary">
                Consensus
              </Badge>
            </TimelineContent>
          </TimelineItem>
        )}
      </Timeline>
    </div>
  )
};

export default ProposalTimeline;
