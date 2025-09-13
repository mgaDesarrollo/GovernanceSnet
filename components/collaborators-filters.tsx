"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  SearchIcon,
  FilterIcon,
  XIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UsersIcon,
  MapPinIcon,
  BriefcaseIcon,
  ActivityIcon,
  SparklesIcon,
} from "lucide-react"
import type { UserAvailabilityStatus } from "@prisma/client"

export interface CollaboratorFilters {
  search: string
  status: UserAvailabilityStatus | "ALL"
  onlineStatus: "ALL" | "ONLINE" | "OFFLINE" | "RECENTLY_ACTIVE"
  country: string
  workgroup: string
  skills: string[]
  hasCV: boolean | null
  hasSocialLinks: boolean | null
}

interface CollaboratorsFiltersProps {
  filters: CollaboratorFilters
  onFiltersChange: (filters: CollaboratorFilters) => void
  availableCountries: string[]
  availableWorkgroups: string[]
  availableSkills: string[]
  totalCount: number
  filteredCount: number
}

const statusOptions = [
  { value: "ALL", label: "All Status", icon: <UsersIcon className="h-4 w-4" /> },
  { value: "AVAILABLE", label: "Available", icon: <ActivityIcon className="h-4 w-4 text-green-400" /> },
  { value: "BUSY", label: "Busy", icon: <ActivityIcon className="h-4 w-4 text-yellow-400" /> },
  { value: "VERY_BUSY", label: "Very Busy", icon: <ActivityIcon className="h-4 w-4 text-red-400" /> },
]

const onlineStatusOptions = [
  { value: "ALL", label: "All Users" },
  { value: "ONLINE", label: "Online Now" },
  { value: "RECENTLY_ACTIVE", label: "Recently Active" },
  { value: "OFFLINE", label: "Offline" },
]

export function CollaboratorsFilters({
  filters,
  onFiltersChange,
  availableCountries,
  availableWorkgroups,
  availableSkills,
  totalCount,
  filteredCount,
}: CollaboratorsFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [skillInput, setSkillInput] = useState("")

  const updateFilters = (updates: Partial<CollaboratorFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      status: "ALL",
      onlineStatus: "ALL",
      country: "",
      workgroup: "",
      skills: [],
      hasCV: null,
      hasSocialLinks: null,
    })
  }

  const addSkill = (skill: string) => {
    if (skill && !filters.skills.includes(skill)) {
      updateFilters({ skills: [...filters.skills, skill] })
    }
    setSkillInput("")
  }

  const removeSkill = (skill: string) => {
    updateFilters({ skills: filters.skills.filter((s) => s !== skill) })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.status !== "ALL") count++
    if (filters.onlineStatus !== "ALL") count++
    if (filters.country) count++
    if (filters.workgroup) count++
    if (filters.skills.length > 0) count++
    if (filters.hasCV !== null) count++
    if (filters.hasSocialLinks !== null) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card className="bg-gray-900 border-secondary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-lg">Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">
              {filteredCount} of {totalCount} contributors
            </span>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                  {isOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <CardContent className="p-2">
            <div className="flex flex-wrap gap-2 items-center">
              {/* Search */}
              <div className="min-w-[160px]">
                <Label className="text-xs font-medium text-slate-300">Buscar</Label>
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                  <Input
                    placeholder="Nombre, skills, país..."
                    value={filters.search}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    className="pl-7 py-1 bg-gray-800 border-secondary text-xs text-slate-100 placeholder-slate-400 h-7"
                  />
                </div>
              </div>
              {/* Status */}
              <div className="min-w-[120px]">
                <Label className="text-xs font-medium text-slate-300">Estado</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => updateFilters({ status: value as UserAvailabilityStatus | "ALL" })}
                >
                  <SelectTrigger className="bg-gray-800 border-secondary text-xs text-slate-100 h-7">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-secondary">
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-slate-100 text-xs">
                        <div className="flex items-center gap-1">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Online Status */}
              <div className="min-w-[120px]">
                <Label className="text-xs font-medium text-slate-300">Online</Label>
                <Select
                  value={filters.onlineStatus}
                  onValueChange={(value) => updateFilters({ onlineStatus: value as any })}
                >
                  <SelectTrigger className="bg-gray-800 border-secondary text-xs text-slate-100 h-7">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-secondary">
                    {onlineStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-slate-100 text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Country */}
              <div className="min-w-[120px]">
                <Label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3" />
                  País
                </Label>
                <Select
                  value={filters.country || "ALL_COUNTRIES"}
                  onValueChange={(value) => updateFilters({ country: value === "ALL_COUNTRIES" ? "" : value })}
                >
                  <SelectTrigger className="bg-gray-800 border-secondary text-xs text-slate-100 h-7">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-secondary">
                    <SelectItem value="ALL_COUNTRIES" className="text-slate-100 text-xs">
                      Todos
                    </SelectItem>
                    {availableCountries.map((country) => (
                      <SelectItem key={country} value={country} className="text-slate-100 text-xs">
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Workgroup */}
              <div className="min-w-[120px]">
                <Label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                  <BriefcaseIcon className="h-4 w-4" />
                  Workgroup
                </Label>
                <Select
                  value={filters.workgroup || "ALL_WORKGROUPS"}
                  onValueChange={(value) => updateFilters({ workgroup: value === "ALL_WORKGROUPS" ? "" : value })}
                >
                  <SelectTrigger className="bg-gray-800 border-secondary text-slate-100">
                    <SelectValue placeholder="All workgroups" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-secondary">
                    <SelectItem value="ALL_WORKGROUPS" className="text-slate-100">
                      All workgroups
                    </SelectItem>
                    {availableWorkgroups.map((workgroup) => (
                      <SelectItem key={workgroup} value={workgroup} className="text-slate-100">
                        {workgroup}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Skills */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300 flex items-center gap-1">
                <SparklesIcon className="h-4 w-4" />
                Skills
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add skill filter..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSkill(skillInput.trim())
                    }
                  }}
                  className="bg-gray-800 border-secondary text-slate-100 placeholder-slate-400"
                />
                <Button
                  onClick={() => addSkill(skillInput.trim())}
                  disabled={!skillInput.trim()}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Add
                </Button>
              </div>
              {filters.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-purple-600/20 text-purple-300 border-secondary"
                    >
                      {skill}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 h-auto p-0 text-purple-300 hover:text-purple-100"
                      >
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator className="bg-gray-700" />

            {/* Additional Filters */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-300">Additional Filters</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filters.hasCV === true ? "default" : "outline-solid"}
                  size="sm"
                  onClick={() => updateFilters({ hasCV: filters.hasCV === true ? null : true })}
                  className={
                    filters.hasCV === true
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "border-secondary text-slate-300 hover:bg-slate-700"
                  }
                >
                  Has Resume/CV
                </Button>
                <Button
                  variant={filters.hasSocialLinks === true ? "default" : "outline-solid"}
                  size="sm"
                  onClick={() => updateFilters({ hasSocialLinks: filters.hasSocialLinks === true ? null : true })}
                  className={
                    filters.hasSocialLinks === true
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "border-secondary text-slate-300 hover:bg-slate-700"
                  }
                >
                  Has Social Links
                </Button>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <>
                <Separator className="bg-gray-700" />
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="w-full border-secondary text-slate-300 hover:bg-slate-700 bg-transparent"
                >
                  <XIcon className="mr-2 h-4 w-4" />
                  Clear All Filters
                </Button>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
