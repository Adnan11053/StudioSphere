"use client"

import type { Issue } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState } from "react"

interface IssueHistoryReportProps {
  issues: Issue[]
}

export function IssueHistoryReport({ issues }: IssueHistoryReportProps) {
  const [timeRange, setTimeRange] = useState("30")

  // Filter issues by time range
  const daysAgo = Number.parseInt(timeRange)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysAgo)

  const filteredIssues = issues.filter((issue) => new Date(issue.created_at) >= cutoffDate)

  // Calculate metrics
  const totalIssues = filteredIssues.length
  const issuedCount = filteredIssues.filter((i) => i.status === "issued").length
  const returnedCount = filteredIssues.filter((i) => i.status === "returned").length

  const returnRate = totalIssues > 0 ? ((returnedCount / totalIssues) * 100).toFixed(1) : "0"

  // Issues over time
  const issuesByDate = new Map<string, number>()
  filteredIssues.forEach((issue) => {
    const date = new Date(issue.created_at).toLocaleDateString()
    issuesByDate.set(date, (issuesByDate.get(date) || 0) + 1)
  })

  const timelineData = Array.from(issuesByDate.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30)

  // Person issue frequency
  const personMap = new Map<string, number>()
  filteredIssues.forEach((issue) => {
    const name = issue.person_name || issue.person_contact || "Unknown"
    personMap.set(name, (personMap.get(name) || 0) + 1)
  })

  const topRequesters = Array.from(personMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const getStatusBadge = (status: string) => {
    const variants = {
      issued: "bg-green-100 text-green-800",
      returned: "bg-gray-100 text-gray-800",
    }
    return variants[status as keyof typeof variants] || variants.issued
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
            <SelectItem value="365">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalIssues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Currently Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{issuedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Returned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{returnedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Return Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{returnRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Issue Timeline</CardTitle>
          <CardDescription>Equipment issues over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Requesters */}
        <Card>
          <CardHeader>
            <CardTitle>Top Requesters</CardTitle>
            <CardDescription>People with most equipment issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Person</TableHead>
                    <TableHead className="text-right">Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topRequesters.map((requester, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{requester.name}</TableCell>
                      <TableCell className="text-right font-semibold">{requester.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Issues</CardTitle>
            <CardDescription>Latest equipment issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredIssues.slice(0, 5).map((issue) => (
                <div key={issue.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                  <div>
                    <p className="font-medium text-sm">{issue.equipment?.name}</p>
                    <p className="text-xs text-muted-foreground">{issue.person_name || issue.person_contact || "—"}</p>
                  </div>
                  <Badge className={getStatusBadge(issue.status)}>{issue.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
