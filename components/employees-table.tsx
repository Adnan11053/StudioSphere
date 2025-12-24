"use client"

import type { Profile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Edit, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { downloadCSV, exportEmployeesToCSV } from "@/lib/excel-utils"

interface EmployeesTableProps {
  employees: Profile[]
  userRole: string
  currentUserId: string
}

export function EmployeesTable({ employees, userRole, currentUserId }: EmployeesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const router = useRouter()
  const supabase = createClient()

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || employee.role === roleFilter

    return matchesSearch && matchesRole
  })

  const handleDelete = async (id: string) => {
    if (id === currentUserId) {
      alert("You cannot delete your own account")
      return
    }

    if (!confirm("Are you sure you want to remove this employee? This will delete their account.")) return

    const { error } = await supabase.from("profiles").delete().eq("id", id)

    if (error) {
      alert("Error removing employee: " + error.message)
    } else {
      router.refresh()
    }
  }

  const handleExport = () => {
    const csvContent = exportEmployeesToCSV(filteredEmployees)
    const timestamp = new Date().toISOString().split("T")[0]
    downloadCSV(csvContent, `employees-export-${timestamp}.csv`)
  }
  // </CHANGE>

  const getRoleBadge = (role: string) => {
    const variants = {
      owner: "bg-purple-100 text-purple-800",
      employee: "bg-green-100 text-green-800",
    }
    return variants[role as keyof typeof variants] || variants.employee
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              {userRole === "owner" && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.full_name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{employee.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadge(employee.role)}>{employee.role}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(employee.created_at).toLocaleDateString()}
                  </TableCell>
                  {userRole === "owner" && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {employee.id !== currentUserId && (
                          <>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/employees/${employee.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(employee.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                        {employee.id === currentUserId && <span className="text-xs text-muted-foreground">You</span>}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
