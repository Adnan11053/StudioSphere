"use client"

import type React from "react"
import type { Profile, EmployeePermissions } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface EmployeeEditFormProps {
  employee: Profile
  studioId: string
}

export function EmployeeEditForm({ employee, studioId }: EmployeeEditFormProps) {
  const [fullName, setFullName] = useState(employee.full_name || "")
  const [permissions, setPermissions] = useState<EmployeePermissions | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchPermissions = async () => {
      if (employee.role === "employee") {
        const { data } = await supabase
          .from("employee_permissions")
          .select("*")
          .eq("employee_id", employee.id)
          .eq("studio_id", studioId)
          .single()
        if (data) {
          setPermissions(data)
        }
      }
      setIsLoadingPermissions(false)
    }
    fetchPermissions()
  }, [employee.id, employee.role, studioId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName || null,
        })
        .eq("id", employee.id)

      if (profileError) throw profileError

      // Update permissions if employee
      if (employee.role === "employee" && permissions) {
        const { error: permError } = await supabase
          .from("employee_permissions")
          .update({
            can_access_dashboard: permissions.can_access_dashboard,
            can_access_equipment: permissions.can_access_equipment,
            can_access_issues: permissions.can_access_issues,
            can_access_employees: permissions.can_access_employees,
            can_access_reports: permissions.can_access_reports,
            can_access_analytics: permissions.can_access_analytics,
          })
          .eq("id", permissions.id)

        if (permError) throw permError
      }

      router.push("/employees")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const updatePermission = (key: keyof EmployeePermissions, value: boolean) => {
    if (permissions) {
      setPermissions({ ...permissions, [key]: value })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={employee.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {employee.role === "employee" && !isLoadingPermissions && permissions && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Access Permissions</Label>
                <p className="text-xs text-muted-foreground mb-4">
                  Control which tabs and features this employee can access
            </p>
          </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dashboard"
                    checked={permissions.can_access_dashboard}
                    onCheckedChange={(checked) => updatePermission("can_access_dashboard", checked as boolean)}
                  />
                  <Label htmlFor="dashboard" className="font-normal cursor-pointer">
                    Dashboard
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="equipment"
                    checked={permissions.can_access_equipment}
                    onCheckedChange={(checked) => updatePermission("can_access_equipment", checked as boolean)}
                  />
                  <Label htmlFor="equipment" className="font-normal cursor-pointer">
                    Equipment
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="issues"
                    checked={permissions.can_access_issues}
                    onCheckedChange={(checked) => updatePermission("can_access_issues", checked as boolean)}
                  />
                  <Label htmlFor="issues" className="font-normal cursor-pointer">
                    Issues
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="employees"
                    checked={permissions.can_access_employees}
                    onCheckedChange={(checked) => updatePermission("can_access_employees", checked as boolean)}
                  />
                  <Label htmlFor="employees" className="font-normal cursor-pointer">
                    Employees
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reports"
                    checked={permissions.can_access_reports}
                    onCheckedChange={(checked) => updatePermission("can_access_reports", checked as boolean)}
                  />
                  <Label htmlFor="reports" className="font-normal cursor-pointer">
                    Reports
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="analytics"
                    checked={permissions.can_access_analytics}
                    onCheckedChange={(checked) => updatePermission("can_access_analytics", checked as boolean)}
                  />
                  <Label htmlFor="analytics" className="font-normal cursor-pointer">
                    Analytics
                  </Label>
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Update Employee"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/employees")}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
