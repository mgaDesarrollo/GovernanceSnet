// Ensure this route is treated as dynamic. It reads request.url and depends on runtime data.
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Optional period for analytics (days). Defaults to last 90 days
    const { searchParams } = new URL(request.url)
    const periodDaysParam = parseInt(searchParams.get("periodDays") || "90", 10)
    const periodDays = isNaN(periodDaysParam) ? 90 : Math.max(1, periodDaysParam)
    const compare = (searchParams.get("compare") || "").toLowerCase()
      .split(",")
      .some(v => v === "1" || v === "true" || v === "yes")
  const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)
    const dayMs = 24 * 60 * 60 * 1000
    const prevSince = new Date(since.getTime() - periodDays * dayMs)
    const prevUntil = new Date(since.getTime() - 1)

  const workGroupId = (searchParams.get("workGroupId") || '').trim() || undefined
  const country = (searchParams.get("country") || '').trim() || undefined
  const proposalTypeFilter = (searchParams.get("proposalType") || '').trim() || undefined

    // Fetch datasets in parallel
    const [workgroups, users, proposals, votes, consensusVotes, objections, voterMemberships] = await Promise.all([
      prisma.workGroup.findMany({
        include: {
          _count: { select: { members: true } }
        }
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          country: true
        }
      }),
      prisma.proposal.findMany({
        where: {
          createdAt: { gte: since },
          ...(proposalTypeFilter ? { proposalType: proposalTypeFilter } : {}),
          ...(workGroupId ? {
            OR: [
              { workgroupId: workGroupId },
              { workGroupIds: { has: workGroupId } }
            ]
          } : {})
        },
        select: { id: true, createdAt: true, proposalType: true, budgetItems: true, workGroupIds: true }
      }),
      prisma.vote.findMany({
        where: { createdAt: { gte: since } },
        select: { id: true, userId: true, proposalId: true, createdAt: true }
      }),
      prisma.consensusVote.findMany({
        where: { createdAt: { gte: since } },
        select: { id: true, userId: true, voteType: true, roundId: true, createdAt: true }
      }),
      prisma.objection.findMany({
        where: { createdAt: { gte: since } },
        select: { id: true, status: true, createdAt: true, voteId: true, resolvedAt: true }
      }),
      prisma.workGroupMember.findMany({
        select: { userId: true, workGroup: { select: { id: true, name: true, type: true } } }
      })
    ])



    // Process workgroups data
    const workGroups = {
      total: workgroups.length,
      active: workgroups.filter(wg => wg.status === "Active").length,
      inactive: workgroups.filter(wg => wg.status === "Inactive").length,
      byType: processWorkGroupTypes(workgroups)
    }

    // Process participants data
    const participants = {
      total: users.length,
      // Treat AVAILABLE as active (schema uses availability status)
      active: users.filter(u => u.status === "AVAILABLE").length,
      newThisMonth: users.filter(u => {
        const createdAt = new Date(u.createdAt)
        const now = new Date()
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
      }).length,
      byRole: processUserRoles(users)
    }



  // Activity section removed from UI; keep placeholder for future use
  const activity = { topWorkGroups: [] as any[] }

    // Governance metrics
    const userMap = new Map(users.map(u => [u.id, u]))
    const usersFilteredByCountry = country ? users.filter(u => (u.country || '').toLowerCase() === country.toLowerCase()) : users
    const coreContributors = usersFilteredByCountry.filter(u => u.role === "CORE_CONTRIBUTOR")
    const coreContributorIds = new Set(coreContributors.map(u => u.id))
    // Filter votes by selected proposals (for WG/proposalType)
    const proposalIdSet = new Set(proposals.map(p => p.id))
    const votesFiltered = votes.filter(v => proposalIdSet.has(v.proposalId))
    // Country filter for voters
    const votersAll = new Set<string>([
      ...votesFiltered.filter(v => {
        if (!country) return true
        const u = userMap.get(v.userId)
        return u && (u.country || '').toLowerCase() === country.toLowerCase()
      }).map(v => v.userId),
      ...consensusVotes.filter(cv => {
        if (!country) return true
        const u = userMap.get(cv.userId)
        return u && (u.country || '').toLowerCase() === country.toLowerCase()
      }).map(cv => cv.userId)
    ])
    const votersCore = new Set([...votersAll].filter(id => coreContributorIds.has(id)))
    const participationRate = percentage(votersCore.size, coreContributors.length)

    // Consent Alignment Score (average across rounds): A_FAVOR / (A_FAVOR + EN_CONTRA + OBJETAR)
    const roundsAgg = new Map<string, { favor: number; contra: number; objetar: number }>()
    for (const cv of consensusVotes) {
      if (!roundsAgg.has(cv.roundId)) roundsAgg.set(cv.roundId, { favor: 0, contra: 0, objetar: 0 })
      const a = roundsAgg.get(cv.roundId)!
      if (cv.voteType === "A_FAVOR") a.favor++
      else if (cv.voteType === "EN_CONTRA") a.contra++
      else if (cv.voteType === "OBJETAR") a.objetar++
    }
    const perRoundScores: number[] = []
    roundsAgg.forEach(r => {
      const denom = r.favor + r.contra + r.objetar
      perRoundScores.push(denom > 0 ? r.favor / denom : 0)
    })
    const consentAlignmentScore = average(perRoundScores) * 100

    // Objections
    // Objections: we can filter by country via consensus vote user, not by WG/proposalType (no relation). Keep WG/PT filter ignored for objections.
    const consensusVoteById = new Map(consensusVotes.map(cv => [cv.id, cv]))
    const objectionsCountryFiltered = objections.filter(o => {
      if (!country) return true
      const cv = consensusVoteById.get(o.voteId)
      if (!cv) return false
      const u = userMap.get(cv.userId)
      return u && (u.country || '').toLowerCase() === country.toLowerCase()
    })
    const totalObjections = objectionsCountryFiltered.length
    const resolvedObjections = objectionsCountryFiltered.filter(o => o.status === "VALIDA" || o.status === "INVALIDA").length
    const invalidObjections = objectionsCountryFiltered.filter(o => o.status === "INVALIDA").length
    const objectionResolutionRate = percentage(resolvedObjections, totalObjections)
    const invalidObjectionRate = percentage(invalidObjections, totalObjections)

    const governance = {
      participationRate,
      consentAlignmentScore,
      objectionResolutionRate,
      invalidObjectionRate,
      counts: {
        coreContributors: coreContributors.length,
        coreContributorsParticipating: votersCore.size,
        votesCount: votes.length,
        consensusVotesCount: consensusVotes.length,
        objectionsTotal: totalObjections,
        objectionsResolved: resolvedObjections,
        objectionsInvalid: invalidObjections
      }
    }

    // Diversity & Representation (countries and WG types for recent voters)
    const voterIds = new Set<string>([...votersAll])
    const votersUsers = users.filter(u => voterIds.has(u.id))
    const byCountryCounts: Record<string, number> = {}
    for (const u of votersUsers) {
      const key = (u.country || "Unknown").trim() || "Unknown"
      byCountryCounts[key] = (byCountryCounts[key] || 0) + 1
    }
    const byCountry = Object.entries(byCountryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([country, count]) => ({ country, count, percent: percentage(count, votersUsers.length) }))

    const membershipsByVoters = voterMemberships.filter(m => voterIds.has(m.userId))
    const wgTypeCounts: Record<string, number> = {}
    for (const m of membershipsByVoters) {
      const t = (m as any).workGroup?.type || "Unknown"
      wgTypeCounts[t] = (wgTypeCounts[t] || 0) + 1
    }
    const byWorkGroupType = Object.entries(wgTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count, percent: percentage(count, Math.max(1, membershipsByVoters.length)) }))

    const diversity = {
      score: evennessScore(Object.values(byCountryCounts)) * 100,
      byCountry,
      byWorkGroupType
    }

  // Treasury metrics from proposal budget items (already filtered by WG/PT)
  const treasuryAgg = aggregateTreasury(proposals, workgroups)
    const treasury = {
      totalUSD: treasuryAgg.totalUSD,
      byWorkGroup: treasuryAgg.byWorkGroup,
      byProposalType: treasuryAgg.byProposalType,
      allocation: {
        adminUSD: treasuryAgg.adminUSD,
        operativeUSD: treasuryAgg.operativeUSD,
        adminPercent: percentage(treasuryAgg.adminUSD, treasuryAgg.adminUSD + treasuryAgg.operativeUSD),
        operativePercent: percentage(treasuryAgg.operativeUSD, treasuryAgg.adminUSD + treasuryAgg.operativeUSD)
      }
    }

    // Optional: previous-period comparison
    let previousPeriod: any | undefined
    if (compare) {
      const [proposalsPrev, votesPrev, consensusVotesPrev, objectionsPrev] = await Promise.all([
        prisma.proposal.findMany({
          where: {
            createdAt: { gte: prevSince, lt: since },
            ...(proposalTypeFilter ? { proposalType: proposalTypeFilter } : {}),
            ...(workGroupId ? { OR: [{ workgroupId: workGroupId }, { workGroupIds: { has: workGroupId } }] } : {})
          },
          select: { id: true, createdAt: true, proposalType: true, budgetItems: true, workGroupIds: true }
        }),
        prisma.vote.findMany({
          where: { createdAt: { gte: prevSince, lt: since } },
          select: { id: true, userId: true, proposalId: true }
        }),
        prisma.consensusVote.findMany({
          where: { createdAt: { gte: prevSince, lt: since } },
          select: { id: true, userId: true, voteType: true, roundId: true, createdAt: true }
        }),
        prisma.objection.findMany({
          where: { createdAt: { gte: prevSince, lt: since } },
          select: { id: true, status: true, createdAt: true, voteId: true }
        })
      ])

      // Governance prev
      const votersAllPrev = new Set<string>([
        ...votesPrev.filter(v => {
          if (!country) return true
          const u = userMap.get(v.userId)
          return u && (u.country || '').toLowerCase() === country.toLowerCase()
        }).map(v => v.userId),
        ...consensusVotesPrev.filter(cv => {
          if (!country) return true
          const u = userMap.get(cv.userId)
          return u && (u.country || '').toLowerCase() === country.toLowerCase()
        }).map(cv => cv.userId)
      ])
      const votersCorePrev = new Set([...votersAllPrev].filter(id => coreContributorIds.has(id)))
      const participationRatePrev = percentage(votersCorePrev.size, coreContributors.length)

      const roundsAggPrev = new Map<string, { favor: number; contra: number; objetar: number }>()
      for (const cv of consensusVotesPrev) {
        if (!roundsAggPrev.has(cv.roundId)) roundsAggPrev.set(cv.roundId, { favor: 0, contra: 0, objetar: 0 })
        const a = roundsAggPrev.get(cv.roundId)!
        if (cv.voteType === "A_FAVOR") a.favor++
        else if (cv.voteType === "EN_CONTRA") a.contra++
        else if (cv.voteType === "OBJETAR") a.objetar++
      }
      const perRoundPrev: number[] = []
      roundsAggPrev.forEach(r => {
        const denom = r.favor + r.contra + r.objetar
        perRoundPrev.push(denom > 0 ? r.favor / denom : 0)
      })
      const consentAlignmentPrev = average(perRoundPrev) * 100

      const consensusVotePrevById = new Map(consensusVotesPrev.map(cv => [cv.id, cv]))
      const objectionsPrevCountryFiltered = objectionsPrev.filter(o => {
        if (!country) return true
        const cv = consensusVotePrevById.get(o.voteId)
        if (!cv) return false
        const u = userMap.get(cv.userId)
        return u && (u.country || '').toLowerCase() === country.toLowerCase()
      })
      const totalObjectionsPrev = objectionsPrevCountryFiltered.length
      const resolvedObjectionsPrev = objectionsPrevCountryFiltered.filter(o => o.status === "VALIDA" || o.status === "INVALIDA").length
      const invalidObjectionsPrev = objectionsPrevCountryFiltered.filter(o => o.status === "INVALIDA").length
      const objectionResolutionPrev = percentage(resolvedObjectionsPrev, totalObjectionsPrev)
      const invalidObjectionPrev = percentage(invalidObjectionsPrev, totalObjectionsPrev)

      // Treasury prev
      const treasuryPrevAgg = aggregateTreasury(proposalsPrev, workgroups)
      const treasuryPrev = {
        totalUSD: treasuryPrevAgg.totalUSD,
        allocation: {
          adminPercent: percentage(treasuryPrevAgg.adminUSD, treasuryPrevAgg.adminUSD + treasuryPrevAgg.operativeUSD),
          operativePercent: percentage(treasuryPrevAgg.operativeUSD, treasuryPrevAgg.adminUSD + treasuryPrevAgg.operativeUSD)
        }
      }

      previousPeriod = {
        periodDays,
        start: prevSince.toISOString(),
        end: prevUntil.toISOString(),
        governance: {
          participationRate: participationRatePrev,
          consentAlignmentScore: consentAlignmentPrev,
          objectionResolutionRate: objectionResolutionPrev,
          invalidObjectionRate: invalidObjectionPrev
        },
        treasury: treasuryPrev
      }
    }

    // Monthly time series
    const until = new Date()
  const monthKeys = buildMonthKeys(since, until)
    const proposalsByMonth = initMonthMap(monthKeys)
    const votersByMonth = initMonthSet(monthKeys)
    const coreVotersByMonth = initMonthSet(monthKeys)
  const objectionsByMonth = initMonthObj(monthKeys)
  const consensusByMonth = initMonthConsensus(monthKeys)

    // Precompute
    const proposalsById = new Map(proposals.map(p => [p.id, p]))

    for (const p of proposals) {
      const k = monthKey(p.createdAt as any)
      proposalsByMonth[k] = (proposalsByMonth[k] || 0) + sumBudget(p)
    }
    for (const v of votesFiltered) {
      const k = monthKey(v.createdAt as any)
      if (!monthKeys.includes(k)) continue
      votersByMonth[k].add(v.userId)
      if (coreContributorIds.has(v.userId)) coreVotersByMonth[k].add(v.userId)
    }
    for (const cv of consensusVotes) {
      const k = monthKey(cv.createdAt as any)
      if (!monthKeys.includes(k)) continue
      if (!country) {
        votersByMonth[k].add(cv.userId)
        if (coreContributorIds.has(cv.userId)) coreVotersByMonth[k].add(cv.userId)
        // aggregate consensus
        if (cv.voteType === "A_FAVOR") consensusByMonth[k].favor++
        else if (cv.voteType === "EN_CONTRA") consensusByMonth[k].contra++
        else if (cv.voteType === "OBJETAR") consensusByMonth[k].objetar++
      } else {
        const u = userMap.get(cv.userId)
        if (u && (u.country || '').toLowerCase() === country.toLowerCase()) {
          votersByMonth[k].add(cv.userId)
          if (coreContributorIds.has(cv.userId)) coreVotersByMonth[k].add(cv.userId)
          if (cv.voteType === "A_FAVOR") consensusByMonth[k].favor++
          else if (cv.voteType === "EN_CONTRA") consensusByMonth[k].contra++
          else if (cv.voteType === "OBJETAR") consensusByMonth[k].objetar++
        }
      }
    }
    for (const o of objectionsCountryFiltered) {
      const k = monthKey(o.createdAt as any)
      if (!monthKeys.includes(k)) continue
      const bucket = objectionsByMonth[k]
      bucket.total += 1
      if (o.status === "VALIDA" || o.status === "INVALIDA") bucket.resolved += 1
    }

    const monthly = monthKeys.map((k: string) => ({
      month: k,
      voters: votersByMonth[k].size,
      participationRate: percentage(coreVotersByMonth[k].size, coreContributors.length),
      treasuryUSD: Math.round(proposalsByMonth[k] || 0),
      objectionResolutionRate: percentage(objectionsByMonth[k].resolved, objectionsByMonth[k].total),
      consentAlignmentRate: (() => {
        const agg = consensusByMonth[k]
        const denom = agg.favor + agg.contra + agg.objetar
        return denom > 0 ? Math.round((agg.favor / denom) * 1000) / 10 : 0
      })()
    }))

    return NextResponse.json({
      workGroups,
      participants,
      activity,
      governance,
      diversity,
      treasury,
      timeSeries: { monthly },
      ...(compare && { previousPeriod })
    })

  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}



function processWorkGroupTypes(workgroups: any[]) {
  const typeCounts: { [key: string]: number } = {}
  workgroups?.forEach(wg => {
    const type = wg.type || "Unknown"
    typeCounts[type] = (typeCounts[type] || 0) + 1
  })
  return Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}

function processUserRoles(users: any[]) {
  const roleCounts: { [key: string]: number } = {}
  users.forEach(user => {
    const role = user.role || "USER"
    roleCounts[role] = (roleCounts[role] || 0) + 1
  })
  return Object.entries(roleCounts)
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count)
}

// Helpers
function percentage(part: number, total: number): number {
  if (!total || total <= 0) return 0
  return Math.round((part / total) * 10000) / 100
}

function average(values: number[]): number {
  if (!values.length) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

// Shannon evenness 0..1
function evennessScore(counts: number[]): number {
  const filtered = counts.filter(c => c > 0)
  const n = filtered.length
  if (n <= 1) return n === 1 ? 1 : 0
  const total = filtered.reduce((a, b) => a + b, 0)
  let H = 0
  for (const c of filtered) {
    const p = c / total
    H += -p * Math.log(p)
  }
  const Hmax = Math.log(n)
  return Hmax > 0 ? H / Hmax : 0
}

function aggregateTreasury(proposals: any[], workgroups: any[]) {
  let totalUSD = 0
  let adminUSD = 0
  let operativeUSD = 0

  const byWorkGroupMap = new Map<string, { id: string; name: string; type: string; totalUSD: number }>()
  const byProposalTypeMap = new Map<string, number>()

  const wgIndex = new Map<string, { id: string; name: string; type: string }>()
  for (const wg of workgroups) wgIndex.set((wg as any).id, { id: (wg as any).id, name: (wg as any).name, type: (wg as any).type })

  for (const p of proposals) {
    const items: any[] = Array.isArray(p.budgetItems) ? p.budgetItems : []
    let proposalTotal = 0
    for (const item of items) {
      const qty = toNumber((item as any).quantity, 0)
      const unit = toNumber((item as any).unitPrice, 0)
      const total = toNumber((item as any).total, qty * unit)
      proposalTotal += total
      totalUSD += total
      const t = (typeof (item as any).type === 'string' ? ((item as any).type as string).toLowerCase() : '')
      if (t === 'admin' || t === 'administrative' || t === 'administration') adminUSD += total
      else operativeUSD += total
    }

    const pType = (p as any).proposalType || 'UNKNOWN'
    byProposalTypeMap.set(pType, (byProposalTypeMap.get(pType) || 0) + proposalTotal)

    const wgIds: string[] = Array.isArray((p as any).workGroupIds) ? (p as any).workGroupIds : []
    for (const id of wgIds) {
      const info = wgIndex.get(id) || { id, name: id, type: 'Unknown' }
      const current = byWorkGroupMap.get(id) || { ...info, totalUSD: 0 }
      current.totalUSD += proposalTotal
      byWorkGroupMap.set(id, current)
    }
  }

  const byWorkGroup = [...byWorkGroupMap.values()].sort((a, b) => b.totalUSD - a.totalUSD)
  const byProposalType = [...byProposalTypeMap.entries()].map(([proposalType, totalUSD]) => ({ proposalType, totalUSD })).sort((a, b) => b.totalUSD - a.totalUSD)

  return { totalUSD, byWorkGroup, byProposalType, adminUSD, operativeUSD }
}

function toNumber(value: any, fallback = 0): number {
  const n = Number(value)
  return isNaN(n) ? fallback : n
}
 
// --- Time series helpers ---
function monthKey(d: Date | string): string {
  const dt = typeof d === 'string' ? new Date(d) : d
  const y = dt.getUTCFullYear()
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function buildMonthKeys(start: Date, end: Date): string[] {
  const keys: string[] = []
  const s = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1))
  const e = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1))
  let y = s.getUTCFullYear()
  let m = s.getUTCMonth()
  while (y < e.getUTCFullYear() || (y === e.getUTCFullYear() && m <= e.getUTCMonth())) {
    const key = `${y}-${String(m + 1).padStart(2, '0')}`
    keys.push(key)
    m++
    if (m > 11) { m = 0; y++ }
  }
  return keys
}

function initMonthMap(keys: string[]): Record<string, number> {
  const obj: Record<string, number> = {}
  for (const k of keys) obj[k] = 0
  return obj
}

function initMonthSet(keys: string[]): Record<string, Set<string>> {
  const obj: Record<string, Set<string>> = {}
  for (const k of keys) obj[k] = new Set<string>()
  return obj
}

function initMonthObj(keys: string[]): Record<string, { total: number; resolved: number }> {
  const obj: Record<string, { total: number; resolved: number }> = {}
  for (const k of keys) obj[k] = { total: 0, resolved: 0 }
  return obj
}

function initMonthConsensus(keys: string[]): Record<string, { favor: number; contra: number; objetar: number }> {
  const obj: Record<string, { favor: number; contra: number; objetar: number }> = {}
  for (const k of keys) obj[k] = { favor: 0, contra: 0, objetar: 0 }
  return obj
}

function sumBudget(p: any): number {
  const items: any[] = Array.isArray(p.budgetItems) ? p.budgetItems : []
  let total = 0
  for (const item of items) {
    const qty = toNumber((item as any).quantity, 0)
    const unit = toNumber((item as any).unitPrice, 0)
    const t = toNumber((item as any).total, qty * unit)
    total += t
  }
  return total
}

