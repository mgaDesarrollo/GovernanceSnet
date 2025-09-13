"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { format, formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { CreateProposalDialog } from "@/components/create-proposal-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeftIcon,
  FileTextIcon,
  PlusIcon,
  MessageSquareIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  HandIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  TimerIcon,
  SearchIcon,
  FilterIcon,
  XIcon,
} from "lucide-react"
import type { Proposal, ProposalStatusType } from "@/lib/types"
import { useSearchParams } from 'next/navigation'
import { markdownToBriefPreview } from "@/lib/markdown-brief-preview"
import { formatToDollar, getAgixFromDollars } from "@/lib/utils"

interface ProposalFilters {
  search: string
  status: string
  proposalType: string
  author: string
  dateRange: string
}

export default function ProposalsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const type = searchParams.get('type') || ''

  const { data: session, status } = useSession()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all")
  const [filters, setFilters] = useState<ProposalFilters>({
    search: "",
    status: "all",
    proposalType: "all",
    author: "",
    dateRange: "all"
  })
  const [showFilters, setShowFilters] = useState(false)
  const [workGroups, setWorkGroups] = useState<Array<{id: string, name: string}>>([])

  const fetchProposals = async (status?: ProposalStatusType) => {
    try {
      setIsLoading(true)
      const queryParams = status ? `?status=${status}` : ""
      const response = await fetch(`/api/proposals${queryParams}`)

      if (!response.ok) {
        throw new Error("Failed to fetch proposals")
      }

      const data = await response.json()
      setProposals(data.proposals)
      setFilteredProposals(data.proposals)
      
      // Obtener workgroups si hay propuestas con workgroups
      const allWorkGroupIds = data.proposals
        .filter((p: Proposal) => p.workGroupIds && p.workGroupIds.length > 0)
        .flatMap((p: Proposal) => p.workGroupIds)
      
      if (allWorkGroupIds.length > 0) {
        fetchWorkGroups(allWorkGroupIds)
      }
    } catch (error) {
      console.error("Error fetching proposals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWorkGroups = async (workGroupIds: string[]) => {
    try {
      const response = await fetch('/api/workgroups')
      if (response.ok) {
        const allWorkGroups = await response.json()
        const filteredWorkGroups = allWorkGroups.filter((wg: any) => 
          workGroupIds.indexOf(wg.id) !== -1
        )
        setWorkGroups(filteredWorkGroups)
      }
    } catch (error) {
      console.error("Error fetching workgroups:", error)
    }
  }

  const getWorkGroupName = (workGroupId: string) => {
    const workGroup = workGroups.find(wg => wg.id === workGroupId)
    return workGroup ? workGroup.name : workGroupId
  }

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.replace("/")
      return
    }

    // Fetch proposals based on active tab
    if (activeTab === "all") {
      fetchProposals()
    } else {
      fetchProposals(activeTab as ProposalStatusType)
    }
  }, [status, router, activeTab])

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...proposals]

    // Filtro de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(proposal =>
        proposal?.title.toLowerCase().includes(searchLower) ||
        proposal?.description.toLowerCase().includes(searchLower) ||
        proposal?.author.name.toLowerCase().includes(searchLower) ||
        (proposal?.proposalType && proposal?.proposalType.toLowerCase().includes(searchLower))
      )
    }

    // Filtro de estado
    if (filters.status !== "all") {
      filtered = filtered.filter(proposal => proposal?.status === filters.status)
    }

    // Filtro de tipo de propuesta
    if (filters.proposalType !== "all") {
      filtered = filtered.filter(proposal => proposal?.proposalType === filters.proposalType)
    }

    // Filtro de autor
    if (filters.author) {
      filtered = filtered.filter(proposal =>
        proposal?.author.name.toLowerCase().includes(filters.author.toLowerCase())
      )
    }

    // Filtro de rango de fechas
    if (filters.dateRange !== "all") {
      const now = new Date()
      const oneDay = 24 * 60 * 60 * 1000
      const oneWeek = 7 * oneDay
      const oneMonth = 30 * oneDay

      filtered = filtered.filter(proposal => {
        const createdDate = new Date(proposal?.createdAt)
        const timeDiff = now.getTime() - createdDate.getTime()

        switch (filters.dateRange) {
          case "today":
            return timeDiff < oneDay
          case "week":
            return timeDiff < oneWeek
          case "month":
            return timeDiff < oneMonth
          default:
            return true
        }
      })
    }

    setFilteredProposals(filtered)
  }, [proposals, filters])

  useEffect(() => {
    if (type === 'QUARTERLY_REPORT') {
      setFilters(prev => ({ ...prev, proposalType: 'QUARTERLY_REPORT' }))
      setActiveTab('all')
      setShowFilters(true)
    }
  }, [type])

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      proposalType: "all",
      author: "",
      dateRange: "all"
    })
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
        return <FileTextIcon className="h-4 w-4 text-slate-400" />
    }
  }

  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  return (
         <div className="min-h-screen bg-black text-slate-50 p-4 sm:p-6 lg:p-8 xl:p-12 font-mac">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-wide">Proposals</h1>
              <p className="text-lg text-slate-400 font-medium">
                Manage and track community proposals
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 border border-secondary rounded-full">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-blue-400 font-medium">Total</span>
              <span className="text-blue-300 font-bold">{proposals.length}</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 border-secondary border rounded-full">
              <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
              <span className="text-yellow-400 font-medium">In Review</span>
              <span className="text-yellow-300 font-bold">{proposals.filter(p => p.status === 'IN_REVIEW').length}</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-600/10 border border-secondary rounded-full">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-green-400 font-medium">Approved</span>
              <span className="text-green-300 font-bold">{proposals.filter(p => p.status === 'APPROVED').length}</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-secondary rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-400 font-medium">Rejected</span>
              <span className="text-red-300 font-bold">{proposals.filter(p => p.status === 'REJECTED').length}</span>
            </div>
          </div>

          {(session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") && (
            <CreateProposalDialog setOpen={setOpen} open={open} />
          )} 
        </div>

        {/* Filtros */}
        <div className="mb-8">
          <div className="bg-black border border-secondary rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FilterIcon className="h-5 w-5" />
                Filters
              </h3>
              <Button
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className="text-slate-400 hover:text-white"
              >
                {showFilters ? <XIcon className="h-4 w-4" /> : <FilterIcon className="h-4 w-4" />}
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Búsqueda */}
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search proposals..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10 bg-black border-secondary text-white placeholder:text-slate-400"
                  />
                </div>

                {/* Estado */}
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="bg-black border-secondary text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-secondary">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>

                {/* Tipo de Propuesta */}
                <Select value={filters.proposalType} onValueChange={(value) => setFilters({ ...filters, proposalType: value })}>
                  <SelectTrigger className="bg-black border-secondary text-white">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-secondary">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="COMMUNITY_PROPOSAL">Community Proposal</SelectItem>
                    <SelectItem value="QUARTERLY_REPORT">Quarterly Report</SelectItem>
                  </SelectContent>
                </Select>

                {/* Autor */}
                <Input
                  placeholder="Author name..."
                  value={filters.author}
                  onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                  className="bg-black border-secondary text-white placeholder:text-slate-400"
                />

                {/* Rango de Fechas */}
                <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
                  <SelectTrigger className="bg-black border-secondary text-white">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-secondary">
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Botones de filtros */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">
                  Showing {filteredProposals.length} of {proposals.length} proposals
                </span>
              </div>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-secondary text-slate-300 hover:bg-slate-800"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-6 bg-black border border-secondary">
            <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">All</TabsTrigger>
            <TabsTrigger value="IN_REVIEW" className="data-[state=active]:bg-slate-700">In Review</TabsTrigger>
            <TabsTrigger value="APPROVED" className="data-[state=active]:bg-slate-700">Approved</TabsTrigger>
            <TabsTrigger value="REJECTED" className="data-[state=active]:bg-slate-700">Rejected</TabsTrigger>
            <TabsTrigger value="EXPIRED" className="data-[state=active]:bg-slate-700">Expired</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredProposals.length === 0 ? (
              <Card className="bg-black border-secondary">
                <CardContent className="pt-6 text-center">
                  <FileTextIcon className="mx-auto h-12 w-12 text-slate-500 mb-4" />
                  <p className="text-slate-400">No proposals found</p>
                  {(session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") && (
                    <Button
                      onClick={() => setOpen(!open)}
                      className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Create Your First Proposal
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProposals.map((proposal) => (
                  <div
                    key={proposal?.id}
                    onClick={() => router.push(`/dashboard/proposals/${proposal?.id}`)}
                    className="rounded-md group relative bg-black border border-secondary/50 p-8 hover:border-secondary hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 backdrop-blur-xs font-mac flex flex-col h-full min-h-[500px]"
                  >
                    {/* Status and Type Row - Top */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(proposal?.status)}
                        {proposal?.proposalType && (
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/50 text-xs font-medium">
                            {proposal?.proposalType === "COMMUNITY_PROPOSAL" ? "Community Proposal" : "Quarterly Report"}
                          </Badge>
                        )}
                        {proposal?.proposalType === 'QUARTERLY_REPORT' && (proposal?.quarter || (proposal as any).year) ? (
                          <Badge variant="outline" className="bg-purple-600/20 text-purple-300 border-secondary text-xs font-medium">
                            {[proposal?.quarter, (proposal as any).year].filter(Boolean).join(' ')}
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white line-clamp-2 mb-6 group-hover:text-purple-200 transition-colors">
                      {proposal?.title}
                    </h3>
                    
                    {/* Author Info */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0">
                        {proposal?.author.image ? (
                          <img
                            src={proposal?.author.image}
                            alt={proposal?.author.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-medium text-slate-200 truncate">
                          {proposal?.author.name}
                        </p>
                        <p className="text-sm text-sky-300">
                          {formatDistanceToNow(new Date(proposal?.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-5 mb-8 flex-1">
                      {/* Description - Clean text only */}
                      <p className="text-base text-gray-300 line-clamp-4 leading-relaxed">
                        {proposal?.description && typeof proposal?.description === 'string' 
                          ? markdownToBriefPreview(proposal?.description).trim() 
                          : 'No description available'}
                      </p>

                      {/* Associated groups (no heading label) */}
                      {proposal?.workGroupIds && proposal?.workGroupIds.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {proposal?.workGroupIds.slice(0, 3).map((workGroupId: string) => (
                              <Badge
                                key={workGroupId}
                                variant="outline"
                                className="bg-white/10 text-white border-white/30 text-sm font-medium px-3 py-1.5"
                              >
                                {getWorkGroupName(workGroupId)}
                              </Badge>
                            ))}
                            {proposal?.workGroupIds.length > 3 && (
                              <Badge variant="outline" className="bg-slate-600/20 text-slate-300 border-slate-500/30 text-sm">
                                +{proposal?.workGroupIds.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Budget Info - Compact and clean */}
                      {proposal?.budgetItems && Array.isArray(proposal?.budgetItems) && proposal?.budgetItems.length > 0 && (
                        <div className="flex items-start justify-between p-4 bg-green-500/10 border border-green-500/20">
                          <span className="text-sm text-green-400 font-medium">Total Budget</span>
                          <div className="flex flex-col items-end space-y-1">
                            <span className="text-base font-bold text-green-300">
                            {formatToDollar(proposal?.budgetItems.reduce((sum: number, item: any) => sum + (item.total || 0), 0))}
                          </span>
                          <span className="text-base font-bold text-green-300 text-end">
                            AGIX {getAgixFromDollars(proposal?.budgetItems.reduce((sum: number, item: any) => sum + (item.total || 0), 0))}
                          </span>
                          </div>
                        </div>
                      )}

                      {/* Attachment Indicator - Only if exists */}
                      {proposal?.attachment && (
                        <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg border border-secondary/30">
                          <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-base">📎</span>
                          </div>
                          <span className="text-sm text-slate-300">Attachment available</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Section - Always at bottom */}
                    <div className="border-t border-secondary/50 pt-6 mt-auto">
                      {/* Expiration Date */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <ClockIcon className="h-4 w-4" />
                          <span>Expires {format(new Date(proposal?.expiresAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          {/* Positive Votes */}
                          <div className="flex items-center gap-2">
                            <ThumbsUpIcon className="h-5 w-5 text-green-400" />
                            <span className="text-base font-semibold text-green-400">{proposal?.positiveVotes || 0}</span>
                          </div>

                          {/* Negative Votes */}
                          <div className="flex items-center gap-2">
                            <ThumbsDownIcon className="h-5 w-5 text-red-400" />
                            <span className="text-base font-semibold text-red-400">{proposal?.negativeVotes || 0}</span>
                          </div>

                          {/* Abstain Votes */}
                          <div className="flex items-center gap-2">
                            <HandIcon className="h-5 w-5 text-yellow-400" />
                            <span className="text-base font-semibold text-yellow-400">{proposal?.abstainVotes || 0}</span>
                          </div>
                        </div>

                        {/* Comments */}
                        <div className="flex items-center gap-2">
                          <MessageSquareIcon className="h-5 w-5 text-blue-400" />
                          <span className="text-base font-semibold text-blue-400">{proposal?._count?.comments || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
