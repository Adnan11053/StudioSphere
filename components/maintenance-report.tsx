"use client"

import type { MaintenanceRecord } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MaintenanceReportProps {
  maintenanceRecords: MaintenanceRecord[]
}

export function MaintenanceReport({ maintenanceRecords }: MaintenanceReportProps) {
  // Calculate metrics
  const totalRecords = maintenanceRecords.length
  const totalCost = maintenanceRecords.reduce((sum, record) => sum + (Number(record.cost) || 0), 0)
  const repairCount = maintenanceRecords.filter((r) => r.maintenance_type === "repair").length
  const routineCount = maintenanceRecords.filter((r) => r.maintenance_type === "routine").length

  // Maintenance by type
  const typeData = [
    { type: "Repair", count: repairCount },
    { type: "Routine", count: routineCount },
    { type: "Inspection", count: maintenanceRecords.filter((r) => r.maintenance_type === "inspection").length },
    { type: "Upgrade", count: maintenanceRecords.filter((r) => r.maintenance_type === "upgrade").length },
  ]

  // Equipment with most maintenance
  const equipmentMap = new Map<string, { count: number; cost: number }>()
  maintenanceRecords.forEach((record) => {
    const name = record.equipment?.name || "Unknown"
    const current = equipmentMap.get(name) || { count: 0, cost: 0 }
    equipmentMap.set(name, {
      count: current.count + 1,
      cost: current.cost + (Number(record.cost) || 0),
    })
  })

  const topMaintenance = Array.from(equipmentMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const getTypeBadge = (type: string) => {
    const variants = {
      repair: "bg-red-100 text-red-800",
      routine: "bg-blue-100 text-blue-800",
      inspection: "bg-yellow-100 text-yellow-800",
      upgrade: "bg-green-100 text-green-800",
    }
    return variants[type as keyof typeof variants] || variants.routine
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRecords}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Repairs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{repairCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Routine Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{routineCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance by Type</CardTitle>
            <CardDescription>Distribution of maintenance activities</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipment Requiring Most Maintenance</CardTitle>
            <CardDescription>Items with highest maintenance frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topMaintenance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Maintenance Records</CardTitle>
          <CardDescription>Latest maintenance activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No maintenance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  maintenanceRecords.slice(0, 10).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.equipment?.name || "Unknown"}</TableCell>
                      <TableCell>
                        <Badge className={getTypeBadge(record.maintenance_type)}>{record.maintenance_type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">{record.description}</TableCell>
                      <TableCell className="font-semibold">
                        {record.cost ? `₹${Number(record.cost).toFixed(2)}` : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(record.performed_at).toLocaleDateString()}
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
