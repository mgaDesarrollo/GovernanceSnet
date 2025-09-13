"use client"

// Client component: data is fetched on the client via useEffect

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  BarChart3Icon,
  TrendingUpIcon,
  PieChartIcon,
  ActivityIcon,
  UsersIcon,
  DollarSignIcon,
  CalendarIcon,
  TargetIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  BuildingIcon,
  FileTextIcon,
  UserPlusIcon
} from "lucide-react"
import { LoadingSkeleton, SimpleLoading } from "@/components/ui/loading-skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line
} from "recharts"
import { formatToDollar, getAgixFromDollars } from "@/lib/utils"

interface AnalyticsData {
  workGroups: {
    total: number
    active: number
    inactive: number
    byType: { type: string; count: number }[]
  }
  participants: {
    total: number
    active: number
    newThisMonth: number
    byRole: { role: string; count: number }[]
  }
  activity: {
    topWorkGroups: {
      id: string
      name: string
      memberCount: number
      status: string
    }[]
  }
  governance: {
    participationRate: number
    consentAlignmentScore: number
    objectionResolutionRate: number
    invalidObjectionRate: number
    counts: {
      coreContributors: number
      coreContributorsParticipating: number
      votesCount: number
      consensusVotesCount: number
      objectionsTotal: number
      objectionsResolved: number
      objectionsInvalid: number
    }
  }
  diversity: {
    score: number
    byCountry: { country: string; count: number; percent: number }[]
    byWorkGroupType: { type: string; count: number; percent: number }[]
  }
  treasury: {
    totalUSD: number
    byWorkGroup: { id: string; name: string; type: string; totalUSD: number }[]
    byProposalType: { proposalType: string; totalUSD: number }[]
    allocation: { adminUSD: number; operativeUSD: number; adminPercent: number; operativePercent: number }
  }
  timeSeries?: {
    monthly: { month: string; voters: number; participationRate: number; treasuryUSD: number; objectionResolutionRate: number; consentAlignmentRate: number }[]
  }
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodDays, setPeriodDays] = useState<number>(90)
  const [compare, setCompare] = useState<boolean>(true)
  const [workGroupId, setWorkGroupId] = useState<string>("__all__")
  const [country, setCountry] = useState<string>("__all__")
  const [proposalType, setProposalType] = useState<string>("__all__")
  const [workgroupOptions, setWorkgroupOptions] = useState<{ id: string; name: string }[]>([])
  const [countryOptions, setCountryOptions] = useState<string[]>([])
  const [proposalTypeOptions, setProposalTypeOptions] = useState<string[]>([])

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({ periodDays: String(periodDays), compare: compare ? '1' : '0' })
        if (workGroupId && workGroupId !== '__all__') params.set('workGroupId', workGroupId)
        if (country && country !== '__all__') params.set('country', country)
        if (proposalType && proposalType !== '__all__') params.set('proposalType', proposalType)
        const response = await fetch(`/api/analytics?${params.toString()}`)
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data")
        }

        const data = await response.json()
        setAnalyticsData(data)
        // Seed filter options on first fetch
        if (workgroupOptions.length === 0 && data?.workGroups) {
          // We only have counts; fall back to treasury.byWorkGroup names
          setWorkgroupOptions((data.treasury?.byWorkGroup || []).map((w: any) => ({ id: w.id, name: w.name })))
        }
        if (countryOptions.length === 0 && data?.diversity?.byCountry) {
          setCountryOptions(data.diversity.byCountry.map((c: any) => c.country).filter((c: string) => c))
        }
        if (proposalTypeOptions.length === 0 && data?.treasury?.byProposalType) {
          setProposalTypeOptions(data.treasury.byProposalType.map((p: any) => p.proposalType))
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [periodDays, compare, workGroupId, country, proposalType])

  if (loading) {
    return <SimpleLoading size="lg" className="min-h-[400px]" />
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-linear-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
            <AlertCircleIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">Analytics & Insights</h1>
            <p className="text-gray-400 font-medium">Error loading analytics data</p>
          </div>
        </div>
      </div>
    )
  }

  // Always show numeric % (0.0% min) to avoid empty displays
  const pct = (n: any) => {
    const v = Number(n)
    return Number.isFinite(v) ? `${v.toFixed(1)}%` : '0.0%'
  }
  const participationRateDisplay = pct(analyticsData.governance.participationRate)
  const consentAlignmentDisplay = pct(analyticsData.governance.consentAlignmentScore)
  const objectionResolutionDisplay = pct(analyticsData.governance.objectionResolutionRate)
  const invalidObjectionDisplay = pct(analyticsData.governance.invalidObjectionRate)

  // Comparison helpers
  const prev = (analyticsData as any).previousPeriod as any | undefined
  const deltaPct = (curr: number, prevVal?: number) => {
    if (!prevVal && prevVal !== 0) return null
    const d = curr - prevVal
    const sign = d > 0 ? '+' : d < 0 ? '' : ''
    return `${sign}${d.toFixed(1)}%`
  }
  const deltaColor = (d: number | null, positiveIsGood = true) => {
    if (d === null) return 'text-gray-400'
    const v = d
    const good = positiveIsGood ? v > 0 : v < 0
    return good ? 'text-green-400' : v === 0 ? 'text-gray-400' : 'text-red-400'
  }

  const partDeltaVal = prev ? (analyticsData.governance.participationRate - prev.governance.participationRate) : null
  const consentDeltaVal = prev ? (analyticsData.governance.consentAlignmentScore - prev.governance.consentAlignmentScore) : null
  const objResDeltaVal = prev ? (analyticsData.governance.objectionResolutionRate - prev.governance.objectionResolutionRate) : null
  const invalidObjDeltaVal = prev ? (analyticsData.governance.invalidObjectionRate - prev.governance.invalidObjectionRate) : null

  // Diversity helpers
  const totalVoters = analyticsData.diversity.byCountry.reduce((s, x) => s + x.count, 0)
  const unknownCountry = analyticsData.diversity.byCountry.find(
    (c) => (c.country || '').toLowerCase() === 'unknown'
  )
  const knownCountries = analyticsData.diversity.byCountry.filter(
    (c) => (c.country || '').toLowerCase() !== 'unknown'
  )
  const topCountries = knownCountries.slice(0, 5)
  const otherCountriesCount = knownCountries.slice(5).reduce((s, x) => s + x.count, 0)
  const otherCountriesPercent = totalVoters > 0 ? Math.round((otherCountriesCount / totalVoters) * 1000) / 10 : 0

  const wgTotal = analyticsData.diversity.byWorkGroupType.reduce((s, x) => s + x.count, 0)
  const topWgTypes = analyticsData.diversity.byWorkGroupType.slice(0, 5)
  const otherWgCount = analyticsData.diversity.byWorkGroupType.slice(5).reduce((s, x) => s + x.count, 0)
  const otherWgPercent = wgTotal > 0 ? Math.round((otherWgCount / wgTotal) * 1000) / 10 : 0

  const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
  const fmtUSD = (n: number) => currency.format(n)

  const exportTreasuryCSV = () => {
    const rows = [['workgroup_id', 'workgroup_name', 'workgroup_type', 'total_usd'], ...analyticsData.treasury.byWorkGroup.map(wg => [wg.id, wg.name, wg.type, String(wg.totalUSD)])]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `treasury_by_workgroup_${periodDays}d.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONSENSED": return "text-green-400"
      case "IN_CONSENSUS": return "text-yellow-400"
      case "PENDING": return "text-blue-400"
      default: return "text-gray-400"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "CONSENSED": return "bg-green-500/20 text-green-300 border-secondary"
      case "IN_CONSENSUS": return "bg-yellow-500/20 text-yellow-300 border-secondary"
      case "PENDING": return "bg-blue-500/20 text-blue-300 border-secondary"
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">Analytics & Insights</h1>
          <p className="text-gray-400 font-medium">Comprehensive analytics and performance insights</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className="text-sm text-gray-400">Period</span>
          <Select
            value={String(periodDays)}
            onValueChange={(v) => setPeriodDays(parseInt(v, 10))}
          >
            <SelectTrigger className="w-[140px] bg-black border-secondary text-white">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="bg-black border-secondary text-white">
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 180 days</SelectItem>
              <SelectItem value="365">Last 365 days</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 pl-2">
            <label className="text-sm text-gray-400" htmlFor="compare-toggle">Compare prev</label>
            <input id="compare-toggle" type="checkbox" className="accent-blue-500" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
          </div>
          <Select value={workGroupId} onValueChange={setWorkGroupId}>
            <SelectTrigger className="w-[180px] bg-black border-secondary text-white"><SelectValue placeholder="Workgroup" /></SelectTrigger>
            <SelectContent className="bg-black border-secondary text-white">
              <SelectItem value="__all__">All Workgroups</SelectItem>
              {workgroupOptions.filter(wg => wg?.id && wg?.name).map((wg) => (
                <SelectItem key={wg.id} value={wg.id}>{wg.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-[160px] bg-black border-secondary text-white"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent className="bg-black border-secondary text-white">
              <SelectItem value="__all__">All Countries</SelectItem>
              {countryOptions.filter(c => !!c).map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={proposalType} onValueChange={setProposalType}>
            <SelectTrigger className="w-[200px] bg-black border-secondary text-white"><SelectValue placeholder="Proposal type" /></SelectTrigger>
            <SelectContent className="bg-black border-secondary text-white">
              <SelectItem value="__all__">All Types</SelectItem>
              {proposalTypeOptions.filter(t => !!t).map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-black border-secondary overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400 font-medium">Active Participants</p>
                <p className="text-2xl font-bold text-white">{analyticsData.participants.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-secondary overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ActivityIcon className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400 font-medium">Participation Rate (Core)</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-white">{participationRateDisplay}</p>
                  {prev && (
                    <span className={`text-xs ${deltaColor(partDeltaVal ?? null, true)}`}>{deltaPct(analyticsData.governance.participationRate, prev.governance.participationRate)}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-secondary overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400 font-medium">Consent Alignment</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-white">{consentAlignmentDisplay}</p>
                  {prev && (
                    <span className={`text-xs ${deltaColor(consentDeltaVal ?? null, true)}`}>{deltaPct(analyticsData.governance.consentAlignmentScore, prev.governance.consentAlignmentScore)}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-secondary overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400 font-medium">Objection Resolution</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-white">{objectionResolutionDisplay}</p>
                  {prev && (
                    <span className={`text-xs ${deltaColor(objResDeltaVal ?? null, true)}`}>{deltaPct(analyticsData.governance.objectionResolutionRate, prev.governance.objectionResolutionRate)}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="border-secondary" />

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


        {/* Work Groups Overview */}
        <Card className="bg-black border-secondary overflow-hidden">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BuildingIcon className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">Work Groups Overview</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Total Groups</span>
                <Badge variant="outline" className="text-gray-400">{analyticsData.workGroups.total}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Active Groups</span>
                <Badge variant="outline" className="text-green-400">{analyticsData.workGroups.active}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Inactive Groups</span>
                <Badge variant="outline" className="text-gray-400">{analyticsData.workGroups.inactive}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Participant Demographics */}
        <Card className="bg-black border-secondary overflow-hidden">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">Participant Demographics</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.participants.byRole.map((role, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{role.role}</span>
                  <Badge variant="outline" className="text-purple-400">{role.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Removed Top Work Groups section as requested */}

      {/* Diversity & Treasury */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Diversity & Representation */}
        <Card className="bg-black border-secondary overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PieChartIcon className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white tracking-wide">Diversity & Representation</h3>
              </div>
              <div className="text-xs text-gray-500">{totalVoters} voters</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Diversity Score</span>
                <Badge variant="outline" className="text-purple-400">{analyticsData.diversity.score.toFixed(1)}%</Badge>
              </div>

              {/* By Country with progress bars */}
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">By Country</p>
                <div className="space-y-2">
                  {topCountries.map((c, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{c.country || 'Unknown'}</span>
                        <span className="text-gray-400">{c.count} • {c.percent}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${c.percent}%` }}></div>
                      </div>
                    </div>
                  ))}
                  {(otherCountriesCount > 0 || unknownCountry) && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{unknownCountry ? 'Unknown' : 'Other'}</span>
                        <span className="text-gray-400">{(unknownCountry?.count || otherCountriesCount)} • {unknownCountry ? unknownCountry.percent : otherCountriesPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-sky-700 h-1.5 rounded-full" style={{ width: `${unknownCountry ? unknownCountry.percent : otherCountriesPercent}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* By Workgroup Type with progress bars */}
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">By Workgroup Type</p>
                <div className="space-y-2">
                  {topWgTypes.map((t, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{t.type || 'Unknown'}</span>
                        <span className="text-gray-400">{t.count} • {t.percent}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${t.percent}%` }}></div>
                      </div>
                    </div>
                  ))}
                  {otherWgCount > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">Other</span>
                        <span className="text-gray-400">{otherWgCount} • {otherWgPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-emerald-700 h-1.5 rounded-full" style={{ width: `${otherWgPercent}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Treasury Overview */}
        <Card className="bg-black border-secondary overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSignIcon className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-bold text-white tracking-wide">Treasury Overview</h3>
              </div>
              <button onClick={exportTreasuryCSV} className="text-xs px-2 py-1 rounded border border-secondary text-gray-300 hover:bg-white/5">Export CSV</button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Total Budget</span>
                <div className="flex justify-center items-center gap-2">
                  <Badge variant="outline" className="text-green-400">
                    {formatToDollar(analyticsData.treasury.totalUSD)}
                  </Badge>
                  <Badge variant="outline" className="text-green-400">
                    AGIX {getAgixFromDollars(analyticsData.treasury.totalUSD)}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Allocation</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Administrative', value: analyticsData.treasury.allocation.adminUSD },
                            { name: 'Operations', value: analyticsData.treasury.allocation.operativeUSD }
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                        >
                          <Cell fill="#a855f7" />
                          <Cell fill="#22c55e" />
                        </Pie>
                        <RechartsTooltip formatter={(v: any) => fmtUSD(Number(v))} />
                        <RechartsLegend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Administrative</span>
                      <span className="text-gray-400">{analyticsData.treasury.allocation.adminPercent}% ({formatToDollar(analyticsData.treasury.allocation.adminUSD)} / AGIX {getAgixFromDollars(analyticsData.treasury.allocation.adminUSD)})</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${analyticsData.treasury.allocation.adminPercent}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2">
                      <span className="text-gray-300">Operations</span>
                      <span className="text-gray-400">{analyticsData.treasury.allocation.operativePercent}% ({formatToDollar(analyticsData.treasury.allocation.operativeUSD)} / AGIX {getAgixFromDollars(analyticsData.treasury.allocation.operativeUSD)})</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${analyticsData.treasury.allocation.operativePercent}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">By Workgroup</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.treasury.byWorkGroup.slice(0, 6)}>
                      <XAxis dataKey="name" hide />
                      <YAxis hide />

                      <RechartsTooltip formatter={(v: any) => formatToDollar(Number(v))} />
                      <Bar dataKey="totalUSD" fill="#22c55e" radius={[4, 4, 0, 0]} />

                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">By Proposal Type</p>
                <div className="space-y-2">
                  {analyticsData.treasury.byProposalType.slice(0, 6).map((pt, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{pt.proposalType}</span>
                      <span className="text-sm text-gray-400">{formatToDollar(pt.totalUSD)} / AGIX {getAgixFromDollars(pt.totalUSD)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts: Diversity by Country */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black border-secondary overflow-hidden">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ActivityIcon className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">Diversity by Country</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.diversity.byCountry.slice(0, 10)}>
                  <XAxis dataKey="country" tick={{ fill: '#9CA3AF', fontSize: 12 }} interval={0} angle={-20} dy={10} height={50} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trends */}
        <Card className="bg-black border-secondary overflow-hidden">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUpIcon className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">Trends (Monthly)</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.timeSeries?.monthly || []}>
                  <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <RechartsTooltip />
                  <Line yAxisId="left" type="monotone" dataKey="voters" name="Voters" stroke="#60a5fa" dot={false} strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="treasuryUSD" name="USD" stroke="#22c55e" dot={false} strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="consentAlignmentRate" name="Consent %" stroke="#a855f7" dot={false} strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="objectionResolutionRate" name="Objections %" stroke="#f59e0b" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-gray-500 mt-2">Includes voters and treasury allocation per month for the selected filters.</div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black border-secondary overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlusIcon className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400 font-medium">New This Month</p>
                <p className="text-2xl font-bold text-white">{analyticsData.participants.newThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>



        <Card className="bg-black border-secondary overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TargetIcon className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400 font-medium">Total Participants</p>
                <p className="text-2xl font-bold text-white">{analyticsData.participants.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-secondary overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircleIcon className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm text-gray-400 font-medium">Invalid Objections</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-white">{invalidObjectionDisplay}</p>
                  {prev && (
                    <span className={`text-xs ${deltaColor(invalidObjDeltaVal ?? null, false)}`}>{deltaPct(analyticsData.governance.invalidObjectionRate, prev.governance.invalidObjectionRate)}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {analyticsData.governance.counts.objectionsInvalid} of {analyticsData.governance.counts.objectionsTotal}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 