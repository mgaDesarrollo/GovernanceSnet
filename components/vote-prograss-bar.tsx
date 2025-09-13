"use client"

import React from "react"
import clsx from "clsx"

type Props = {
  totalContributors: number
  positiveVotes: number
  negativeVotes: number
  className?: string
}

export function VoteProgressBar({
  totalContributors,
  positiveVotes,
  negativeVotes,
  className,
}: Props) {
  const safeTotal = Math.max(0, totalContributors)
  const counted = Math.max(0, positiveVotes) + Math.max(0, negativeVotes)
  const abstain = Math.max(0, safeTotal - counted)

  const toPct = (n: number) =>
    safeTotal > 0 ? Number(((n / safeTotal) * 100).toFixed(1)) : 0

  const yesPct = toPct(positiveVotes)
  const noPct = toPct(negativeVotes)
  const abstainPct = toPct(abstain)

  const widths = (() => {
    const base = [yesPct, noPct, abstainPct]
    const total = base.reduce((a, b) => a + b, 0)
    if (total === 100 || safeTotal === 0) return base
    const idx = base.indexOf(Math.max(...base))
    const copy = [...base]
    copy[idx] = Number((copy[idx] + (100 - total)).toFixed(1))
    return copy
  })()

  return (
    <div className={clsx("w-full", className)}>
      <div
        className="w-full h-3 rounded-full bg-slate-700 overflow-hidden"
        role="img"
        aria-label={`Yes ${yesPct} percent, No ${noPct} percent, Abstain ${abstainPct} percent`}
        title={`Yes ${yesPct}% • No ${noPct}% • Abstain ${abstainPct}%`}
      >
        <div
          className={clsx(
            "h-full inline-block transition-all duration-500",
            widths[0] > 0 ? "bg-green-500!" : "bg-transparent",
            "rounded-l-full"
          )}
          style={{ width: `${widths[0]}%` }}
        />
        <div
          className={clsx(
            "h-full inline-block transition-all duration-500",
            widths[1] > 0 ? "bg-red-500!" : "bg-transparent"
          )}
          style={{ width: `${widths[1]}%` }}
        />
        <div
          className={clsx(
            "h-full inline-block transition-all duration-500",
            widths[2] > 0 ? "bg-yellow-500!" : "bg-transparent",
            "rounded-r-full"
          )}
          style={{ width: `${widths[2]}%` }}
        />
      </div>

      <div className="mt-3 flex  flex-col  items-start justify-start gap-3 text-sm">
        <LegendDot colorClass="bg-green-500!" label={`Consent votes (${yesPct}%)`} />
        <LegendDot colorClass="bg-red-500!" label={`Object votes (${noPct}%)`} />
        <LegendDot colorClass="bg-yellow-500!" label={`Abstain votes / No votes (${abstainPct}%)`} />
      </div>
    </div>
  )
}

function LegendDot({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-slate-300">
      <span className={clsx("h-2.5 w-2.5 rounded-full", colorClass)} />
      <span>{label}</span>
    </div>
  )
}
