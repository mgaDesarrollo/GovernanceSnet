"use client"

import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export interface WorkGroup {
  id: string
  name: string
}

interface WorkGroupSelectorProps {
  selectedWorkGroups: string[]
  proposalType: "COMMUNITY_PROPOSAL" | "QUARTERLY_REPORT"
  onChange: (workGroupIds: string[]) => void
}

export default function WorkGroupSelector({ selectedWorkGroups, proposalType, onChange }: WorkGroupSelectorProps) {
  const [workGroups, setWorkGroups] = useState<WorkGroup[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchWorkGroups()
  }, [])

  const fetchWorkGroups = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/workgroups')
      if (response.ok) {
        const data = await response.json()
        setWorkGroups(data)
      }
    } catch (error) {
      console.error('Error fetching workgroups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWorkGroupToggle = (workGroupId: string) => {
    const isSelected = selectedWorkGroups.indexOf(workGroupId) !== -1
    if (isSelected) {
      onChange(selectedWorkGroups.filter(id => id !== workGroupId))
    } else {
      onChange([...selectedWorkGroups, workGroupId])
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Label className="text-base font-medium text-slate-200">{proposalType === "COMMUNITY_PROPOSAL" ? "Associated WorkGroups" : "Associated WorkGroup"}</Label>
        <div className="p-4 text-center text-slate-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
          Loading workgroups...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium text-slate-200">{proposalType === "COMMUNITY_PROPOSAL" ? "Associated WorkGroups" : "Associated WorkGroup"}</Label>

      <div className="space-y-3 max-h-48 overflow-y-auto border border-secondary rounded-lg bg-slate-800/50 p-3">
        {workGroups.length === 0 ? (
          <div className="text-center text-slate-400 py-4">
            No workgroups available.
          </div>
        ) : (
          workGroups.toReversed().map(wg => (
            <div key={wg.id} className="flex items-center space-x-3">
              <Checkbox
                id={wg.id}
                checked={selectedWorkGroups.indexOf(wg.id) !== -1}
                onCheckedChange={() => handleWorkGroupToggle(wg.id)}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-secondary"
              />
              <Label
                htmlFor={wg.id}
                className="text-sm text-slate-200 cursor-pointer flex-1"
              >
                {wg.name}
              </Label>
            </div>
          ))
        )}
      </div>

      {selectedWorkGroups.length > 0 && (
        <div className="text-sm text-slate-400 text-center">
          {selectedWorkGroups.length} workgroup{selectedWorkGroups.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  )
}
