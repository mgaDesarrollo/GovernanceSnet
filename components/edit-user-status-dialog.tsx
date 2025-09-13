"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2Icon } from "lucide-react"
import type { UserAvailabilityStatus } from "@/lib/types"

interface EditUserStatusDialogProps {
  userId: string | null
  currentStatus: UserAvailabilityStatus | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusUpdate: (userId: string, newStatus: UserAvailabilityStatus) => void
}

const STATUS_OPTIONS: { value: UserAvailabilityStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "BUSY", label: "Busy" },
  { value: "VERY_BUSY", label: "Very Busy" },
]

export function EditUserStatusDialog({
  userId,
  currentStatus,
  open,
  onOpenChange,
  onStatusUpdate,
}: EditUserStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<UserAvailabilityStatus | null>(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSave = async () => {
    if (!userId || !selectedStatus) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: selectedStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user status")
      }

      onStatusUpdate(userId, selectedStatus)
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating user status:", error)
      alert("Failed to update user status. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isUpdating) {
      onOpenChange(newOpen)
      if (!newOpen) {
        setSelectedStatus(currentStatus)
      }
    }
  }

  // Reset selected status when dialog opens with new data
  if (open && selectedStatus !== currentStatus) {
    setSelectedStatus(currentStatus)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-black border-secondary text-slate-50">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Edit User Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-slate-300">
              Availability Status
            </Label>
            <Select
              value={selectedStatus || ""}
              onValueChange={(value) => setSelectedStatus(value as UserAvailabilityStatus)}
              disabled={isUpdating}
            >
              <SelectTrigger className="bg-slate-700 border-secondary text-slate-50">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-secondary text-slate-50">
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isUpdating}
            className="bg-slate-700 border-secondary hover:bg-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUpdating || !selectedStatus}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isUpdating ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
// This component allows editing a user's availability status with a dialog.