"use client"

import type { Issue } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Eye } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { downloadCSV, exportIssuesToCSV } from "@/lib/excel-utils"

interface IssuesTableProps {
  issues: Issue[]
  userRole: string
  userId: string
}

import { ReturnModalButton } from "./return-modal-btn"

export function IssuesTable({ issues, userRole, userId }: IssuesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const router = useRouter()
  const supabase = createClient()

  // Debug logging
  console.log("IssuesTable received issues:", issues?.length || 0, issues)

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.person_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.person_contact?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter

    return matchesSearch && matchesStatus
  })

  console.log("Filtered issues:", filteredIssues.length)

  const handleExport = () => {
    const csvContent = exportIssuesToCSV(filteredIssues)
    const timestamp = new Date().toISOString().split("T")[0]
    downloadCSV(csvContent, `issues-export-${timestamp}.csv`)
  }
  // </CHANGE>

  const getStatusBadge = (status: string) => {
    const variants = {
      issued: "bg-green-100 text-green-800",
      returned: "bg-gray-100 text-gray-800",
    }
    return variants[status as keyof typeof variants] || variants.issued
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Input
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-3"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="issued">Issued</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        {/* </CHANGE> */}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Issued To</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Expected Return</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIssues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {issues.length === 0 
                    ? "No issues found. Create your first issue by clicking 'Issue Equipment' above."
                    : `No issues match your filters. Showing ${issues.length} total issue(s).`}
                </TableCell>
              </TableRow>
            ) : (
              filteredIssues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{issue.equipment?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{issue.equipment?.serial_number || "—"}</p>
                    </div>
                  </TableCell>
                  <TableCell>{issue.quantity_issued || 1}</TableCell>
                  <TableCell>
                    <p className="font-medium">{issue.person_name || "—"}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">{issue.person_contact || "—"}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(issue.status)}>{issue.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {issue.issued_at ? new Date(issue.issued_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {issue.expected_return_date ? new Date(issue.expected_return_date).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {userRole === "owner" && (
                      <>
                        {issue.status === "issued" && (
                          <ReturnModalButton
                            issue={issue}
                            onComplete={() => router.refresh()}
                          />
                        )}
    <Button
      variant="destructive"
      size="sm"
      onClick={async () => {
        if (confirm("Are you sure you want to delete this issue?")) {
          const { error } = await supabase.from("issues").delete().eq("id", issue.id);
          if (error) {
            alert("Error deleting issue: " + error.message);
          } else {
            router.refresh();
          }
        }
      }}
    >
      Delete
    </Button>
  </>
)}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
