"use client"

import type { Equipment, Issue } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EquipmentHistoryProps {
  equipment: Equipment
  issues: Issue[]
}

export function EquipmentHistory({ equipment, issues }: EquipmentHistoryProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      issued: "bg-green-100 text-green-800",
      returned: "bg-gray-100 text-gray-800",
    }
    return variants[status as keyof typeof variants] || variants.issued
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/equipment">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Equipment
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Usage History</h1>
            <p className="text-muted-foreground">{equipment.name}</p>
          </div>
        </div>
      </div>

      {/* Equipment Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Product Code</p>
              <p className="font-medium font-mono">{equipment.code || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Serial Number</p>
              <p className="font-medium">{equipment.serial_number || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="font-medium">{equipment.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{equipment.category?.name || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usage History ({issues.length} record{issues.length !== 1 ? "s" : ""})</CardTitle>
        </CardHeader>
        <CardContent>
          {issues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No usage history found for this equipment.
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Person Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Quantity Issued</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expected Return</TableHead>
                    <TableHead>Actual Return</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issued By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">{issue.person_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{issue.person_contact || "—"}</TableCell>
                      <TableCell>{issue.quantity_issued}</TableCell>
                      <TableCell>
                        {issue.issued_at ? new Date(issue.issued_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        {issue.expected_return_date
                          ? new Date(issue.expected_return_date).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {issue.actual_return_date
                          ? new Date(issue.actual_return_date).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(issue.status)}>{issue.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {issue.issued_by_profile?.full_name || issue.issued_by_profile?.email || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

