"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FileTextIcon, 
  UsersIcon, 
  CalendarIcon, 
  BuildingIcon,
  ClockIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  VoteIcon,
  DollarSignIcon,
  UserIcon,
  TrendingUpIcon,
  TargetIcon,
  FilterIcon,
  SearchIcon,
  XIcon
} from "lucide-react"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"

interface Report {
  id: string
  workGroup: {
    id: string
    name: string
  }
  year: number
  quarter: string
  detail: string
  consensusStatus: "PENDING" | "IN_CONSENSUS" | "CONSENSED"
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  participants: Array<{
    user: {
      id: string
      name: string
      email: string
    }
  }>
  budgetItems: Array<{
    id: string
    name: string
    description: string
    amountUsd: number
  }>
  votingRounds: Array<{
    id: string
    roundNumber: number
    status: string
  }>
}

interface Filters {
  status: string
  workGroup: string
  year: string
  quarter: string
  search: string
}

export default function ConsensusPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    status: "",
    workGroup: "",
    year: "",
    quarter: "",
    search: ""
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (status === "loading") {
      return
    }
    
    if (status === "unauthenticated") {
      router.push("/api/auth/signin")
      return
    }
    
    if (status === "authenticated" && session) {
      fetchReports()
    }
  }, [session, status, router])

  useEffect(() => {
    applyFilters()
  }, [reports, filters])

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("Fetching consensus reports...")
      console.log("Session:", session)
      
      const response = await fetch("/api/reports?consensusStatus=PENDING", {
        credentials: 'include'
      })
      
      console.log("Response status:", response.status)
      console.log("Response headers:", response.headers)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Response error text:", errorText)
        throw new Error(`Failed to fetch reports: ${response.status}`)
      }
      
      const contentType = response.headers.get('content-type')
      console.log("Content-Type:", contentType)
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        console.log("Reports fetched:", data)
        setReports(data)
      } else {
        const text = await response.text()
        console.error("Unexpected response type:", text.substring(0, 200))
        throw new Error("Unexpected response type")
      }
    } catch (err) {
      console.error("Error fetching reports:", err)
      setError("Error loading reports")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    if (!reports || !Array.isArray(reports)) {
      setFilteredReports([])
      return
    }
    let filtered = [...reports]

    if (filters.status) {
      filtered = filtered.filter(report => report.consensusStatus === filters.status)
    }

    if (filters.workGroup) {
      filtered = filtered.filter(report => 
        report.workGroup && report.workGroup.name && 
        report.workGroup.name.toLowerCase().includes(filters.workGroup.toLowerCase())
      )
    }

    if (filters.year) {
      filtered = filtered.filter(report => report.year.toString() === filters.year)
    }

    if (filters.quarter) {
      filtered = filtered.filter(report => report.quarter === filters.quarter)
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(report => 
        (report.workGroup && report.workGroup.name && report.workGroup.name.toLowerCase().includes(searchTerm)) ||
        (report.detail && report.detail.toLowerCase().includes(searchTerm)) ||
        (report.createdBy && report.createdBy.name && report.createdBy.name.toLowerCase().includes(searchTerm))
      )
    }

    setFilteredReports(filtered)
  }

  const clearFilters = () => {
    setFilters({
      status: "",
      workGroup: "",
      year: "",
      quarter: "",
      search: ""
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary" className="bg-yellow-900/20 text-yellow-400 border-secondary font-bold">Pending</Badge>
      case "IN_CONSENSUS":
        return <Badge variant="secondary" className="bg-blue-900/20 text-blue-400 border-secondary font-bold">In Consensus</Badge>
      case "CONSENSED":
        return <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-secondary font-bold">Consensed</Badge>
      default:
        return <Badge variant="outline" className="font-bold">{status}</Badge>
    }
  }

  const getTotalBudget = (budgetItems: any[]) => {
    if (!budgetItems || !Array.isArray(budgetItems)) return 0
    return budgetItems.reduce((sum, item) => sum + (item.amountUsd || 0), 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getUniqueWorkGroups = () => {
    if (!reports || !Array.isArray(reports)) return []
    const workGroups = reports
      .filter(report => report.workGroup && report.workGroup.name)
      .map(report => report.workGroup.name)
    return [...new Set(workGroups)]
  }

  const getUniqueYears = () => {
    if (!reports || !Array.isArray(reports)) return []
    const years = reports.map(report => report.year)
    return [...new Set(years)].sort((a, b) => b - a)
  }

  const getUniqueQuarters = () => {
    if (!reports || !Array.isArray(reports)) return []
    const quarters = reports.map(report => report.quarter)
    return [...new Set(quarters)].sort()
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400 font-medium">Verifying authentication...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <LoadingSkeleton type="page" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <VoteIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">
              Consent System
            </h1>
            <p className="text-gray-400 font-medium">
      
            </p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-black border-secondary">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileTextIcon className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400 font-medium">Total Reports</p>
                  <p className="text-2xl font-bold text-white">{filteredReports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black border-secondary">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TargetIcon className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {filteredReports.filter(r => r.consensusStatus === "PENDING").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black border-secondary">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUpIcon className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400 font-medium">In Consent</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {filteredReports.filter(r => r.consensusStatus === "IN_CONSENSUS").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black border-secondary">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400 font-medium">Consensed</p>
                  <p className="text-2xl font-bold text-green-400">
                    {filteredReports.filter(r => r.consensusStatus === "CONSENSED").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="border-secondary" />

      {/* Filters Section */}
      <Card className="bg-black border-secondary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FilterIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">Filters</h3>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-gray-400 hover:text-white border-secondary hover:border-gray-500"
              >
                {showFilters ? <XIcon className="w-4 h-4" /> : <FilterIcon className="w-4 h-4" />}
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
              {(filters.status || filters.workGroup || filters.year || filters.quarter || filters.search) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-400 hover:text-red-300 border-red-600 hover:border-red-500"
                >
                  <XIcon className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 bg-black border-secondary text-white placeholder-gray-400"
                />
              </div>

              {/* Status Filter */}
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger className="bg-black border-secondary text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-black border-secondary">
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_CONSENSUS">In Consent</SelectItem>
                  <SelectItem value="CONSENSED">Consensed</SelectItem>
                </SelectContent>
              </Select>

              {/* Work Group Filter */}
              <Select value={filters.workGroup} onValueChange={(value) => setFilters({ ...filters, workGroup: value })}>
                <SelectTrigger className="bg-black border-secondary text-white">
                  <SelectValue placeholder="Work Group" />
                </SelectTrigger>
                <SelectContent className="bg-black border-secondary">
                  <SelectItem value="">All groups</SelectItem>
                  {getUniqueWorkGroups().map((workGroup) => (
                    <SelectItem key={workGroup} value={workGroup}>{workGroup}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year Filter */}
              <Select value={filters.year} onValueChange={(value) => setFilters({ ...filters, year: value })}>
                <SelectTrigger className="bg-black border-secondary text-white">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="bg-black border-secondary">
                  <SelectItem value="">All years</SelectItem>
                  {getUniqueYears().map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Quarter Filter */}
              <Select value={filters.quarter} onValueChange={(value) => setFilters({ ...filters, quarter: value })}>
                <SelectTrigger className="bg-black border-secondary text-white">
                  <SelectValue placeholder="Quarter" />
                </SelectTrigger>
                <SelectContent className="bg-black border-secondary">
                  <SelectItem value="">All quarters</SelectItem>
                  {getUniqueQuarters().map((quarter) => (
                    <SelectItem key={quarter} value={quarter}>Q{quarter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card className="bg-black border-secondary">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <FileTextIcon className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-wide">
              {reports.length === 0 ? "No Reports Pending Consent" : "No Results Found"}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto font-medium">
              {reports.length === 0 
                ? "Currently there are no reports that require community consent."
                : "Try adjusting the filters to see more results."
              }
            </p>

          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Reports Pending Consent
            </h2>
            <Badge variant="outline" className="text-gray-400 font-bold">
              {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="grid gap-6">
            {filteredReports.map((report) => (
              <Card key={report.id} className="bg-black border-secondary hover:border-secondary transition-all duration-200 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                            <BuildingIcon className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg tracking-wide">
                              {report.workGroup?.name || 'Unknown Work Group'}
                            </h3>
                            <p className="text-sm text-gray-400 font-medium">
                              {report.year} Q{report.quarter}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(report.consensusStatus)}
                          <Button
                            onClick={() => router.push(`/dashboard/consensus/${report.id}`)}
                            className="bg-purple-600 hover:bg-purple-700 font-bold"
                          >
                            Go to Consent
                          </Button>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <UsersIcon className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Participants</p>
                            <p className="text-sm font-bold text-white">{report.participants?.length || 0}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <DollarSignIcon className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Budget</p>
                            <p className="text-sm font-bold text-white">
                              ${getTotalBudget(report.budgetItems).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Created by</p>
                            <p className="text-sm font-bold text-white">{report.createdBy?.name || 'Unknown User'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Date</p>
                            <p className="text-sm font-bold text-white">
                              {formatDate(report.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Separator className="border-secondary mb-4" />
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-bold text-white mb-2 tracking-wide">Report Summary</h4>
                      <p className="text-gray-400 text-sm leading-relaxed font-medium">
                        {report.detail || "No description provided"}
                      </p>
                    </div>
                    
                    <div className="bg-black/50 rounded-lg p-3 border border-secondary">
                      <h5 className="font-bold text-white text-sm mb-2 tracking-wide">Proposal Details</h5>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400 font-medium">Proposed by:</span>
                          <span className="text-xs font-bold text-white">{report.createdBy?.name || 'Unknown User'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400 font-medium">Created:</span>
                          <span className="text-xs font-bold text-white">{formatDate(report.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <UsersIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400 font-medium">Participants:</span>
                          <span className="text-xs font-bold text-white">{report.participants?.length || 0} members</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        {report.votingRounds && report.votingRounds.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <VoteIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400 font-medium">Round:</span>
                            <span className="text-white font-bold">{report.votingRounds[0].roundNumber}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 font-medium">Status:</span>
                        {getStatusBadge(report.consensusStatus)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 