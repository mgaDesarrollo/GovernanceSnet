"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Area, AreaChart } from "recharts"
import { BarChart3Icon, PieChartIcon, TrendingUpIcon } from "lucide-react"

// Mock data para los gráficos
const proposalStatusData = [
  { name: "Active", value: 12, fill: "#3b82f6" },
  { name: "Approved", value: 8, fill: "#10b981" },
  { name: "Rejected", value: 2, fill: "#ef4444" },
  { name: "Pending", value: 5, fill: "#f59e0b" },
]

const monthlyActivityData = [
  { month: "Jan", proposals: 15, votes: 120, members: 45 },
  { month: "Feb", proposals: 18, votes: 145, members: 52 },
  { month: "Mar", proposals: 22, votes: 180, members: 61 },
  { month: "Apr", proposals: 19, votes: 165, members: 58 },
  { month: "May", proposals: 25, votes: 200, members: 67 },
  { month: "Jun", proposals: 27, votes: 220, members: 73 },
]

const participationTrendData = [
  { week: "Week 1", participation: 65 },
  { week: "Week 2", participation: 72 },
  { week: "Week 3", participation: 68 },
  { week: "Week 4", participation: 78 },
  { week: "Week 5", participation: 82 },
  { week: "Week 6", participation: 85 },
]

const chartConfig = {
  proposals: {
    label: "Proposals",
    color: "#3b82f6",
  },
  votes: {
    label: "Votes",
    color: "#10b981",
  },
  members: {
    label: "Members",
    color: "#f59e0b",
  },
  participation: {
    label: "Participation %",
    color: "#8b5cf6",
  },
}

export function DashboardCharts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-orange-500/10 border border-secondary rounded-lg">
          <BarChart3Icon className="h-5 w-5 text-orange-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Analytics & Insights</h2>
          <p className="text-sm text-slate-400">Visual data representation and trends</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proposal Status Pie Chart */}
        <Card className="bg-black border-secondary">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-blue-400" />
              <div>
                <CardTitle className="text-lg text-slate-100">Proposal Status Distribution</CardTitle>
                <CardDescription className="text-slate-400">Current proposal breakdown</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={proposalStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {proposalStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Activity Bar Chart */}
        <Card className="bg-black border-secondary">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3Icon className="h-5 w-5 text-green-400" />
              <div>
                <CardTitle className="text-lg text-slate-100">Monthly Activity</CardTitle>
                <CardDescription className="text-slate-400">Proposals, votes, and member growth</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={monthlyActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="proposals" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="votes" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Participation Trend Area Chart */}
        <Card className="bg-black border-secondary lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5 text-purple-400" />
              <div>
                <CardTitle className="text-lg text-slate-100">Community Participation Trend</CardTitle>
                <CardDescription className="text-slate-400">Weekly participation percentage over time</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={participationTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="participation"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
