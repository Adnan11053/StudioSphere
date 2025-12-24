"use client"

import type { Equipment, Issue } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface EquipmentUtilizationReportProps {
  equipment: Equipment[]
  issues: Issue[]
}

export function EquipmentUtilizationReport({ equipment, issues }: EquipmentUtilizationReportProps) {
  // Calculate utilization metrics
  const totalEquipment = equipment.length
  const availableCount = equipment.filter((e) => e.status === "available").length
  const issuedCount = equipment.filter((e) => e.status === "issued").length
  const maintenanceCount = equipment.filter((e) => e.status === "maintenance").length
  const retiredCount = equipment.filter((e) => e.status === "retired").length

  const statusData = [
    { name: "Available", value: availableCount, color: "#22c55e" },
    { name: "Issued", value: issuedCount, color: "#3b82f6" },
    { name: "Maintenance", value: maintenanceCount, color: "#eab308" },
    { name: "Retired", value: retiredCount, color: "#6b7280" },
  ]

  // Equipment usage frequency
  const usageMap = new Map<string, number>()
  issues.forEach((issue) => {
    if (issue.equipment_id) {
      usageMap.set(issue.equipment_id, (usageMap.get(issue.equipment_id) || 0) + 1)
    }
  })

  const mostUsedEquipment = equipment
    .map((item) => ({
      name: item.name,
      usageCount: usageMap.get(item.id) || 0,
      status: item.status,
    }))
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10)

  const utilizationRate = totalEquipment > 0 ? ((issuedCount / totalEquipment) * 100).toFixed(1) : "0"

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEquipment}</div>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Utilization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{utilizationRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{maintenanceCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Equipment Status Distribution</CardTitle>
            <CardDescription>Current status breakdown of all equipment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Used Equipment</CardTitle>
            <CardDescription>Top 10 equipment by checkout frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mostUsedEquipment} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="usageCount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Usage Details</CardTitle>
          <CardDescription>Comprehensive usage statistics for all equipment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Times Used</TableHead>
                  <TableHead>Condition</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mostUsedEquipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No usage data available
                    </TableCell>
                  </TableRow>
                ) : (
                  mostUsedEquipment.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            item.status === "available"
                              ? "bg-green-100 text-green-800"
                              : item.status === "issued"
                                ? "bg-blue-100 text-blue-800"
                                : item.status === "maintenance"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {equipment.find((e) => e.name === item.name)?.category?.name || "—"}
                      </TableCell>
                      <TableCell className="font-semibold">{item.usageCount}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {equipment.find((e) => e.name === item.name)?.condition?.replace("_", " ") || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
