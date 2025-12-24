"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { BarChart3, FileText, Home, LogOut, Package, Users, Wrench } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { EmployeePermissions } from "@/lib/types"

interface DashboardSidebarProps {
  userRole: string
  userId: string
  studioId: string
}

export function DashboardSidebar({ userRole, userId, studioId }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [permissions, setPermissions] = useState<EmployeePermissions | null>(null)

  useEffect(() => {
    const fetchPermissions = async () => {
      if (userRole === "owner") {
        // Owners have access to everything
        setPermissions({
          id: "",
          employee_id: userId,
          studio_id: studioId,
          can_access_dashboard: true,
          can_access_equipment: true,
          can_access_issues: true,
          can_access_employees: true,
          can_access_reports: true,
          can_access_analytics: true,
          created_at: "",
          updated_at: "",
        })
      } else {
        // Fetch employee permissions
        const { data } = await supabase
          .from("employee_permissions")
          .select("*")
          .eq("employee_id", userId)
          .eq("studio_id", studioId)
          .single()
        if (data) {
          setPermissions(data)
        }
      }
    }
    fetchPermissions()
  }, [userRole, userId, studioId, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  // Default permissions if not loaded yet (for employees)
  const canAccess = {
    dashboard: permissions?.can_access_dashboard ?? true,
    equipment: permissions?.can_access_equipment ?? true,
    issues: permissions?.can_access_issues ?? true,
    employees: permissions?.can_access_employees ?? userRole === "owner",
    reports: permissions?.can_access_reports ?? userRole === "owner",
    analytics: permissions?.can_access_analytics ?? userRole === "owner",
  }

  const navItems = [
    canAccess.dashboard && { href: "/dashboard", icon: Home, label: "Dashboard" },
    canAccess.equipment && { href: "/equipment", icon: Package, label: "Equipment" },
    canAccess.issues && { href: "/issues", icon: Wrench, label: "Issued Items" },
    canAccess.employees && { href: "/employees", icon: Users, label: "Employees" },
    canAccess.reports && { href: "/reports", icon: FileText, label: "Reports" },
    canAccess.analytics && { href: "/analytics", icon: BarChart3, label: "Analytics" },
  ].filter(Boolean) as Array<{ href: string; icon: typeof Home; label: string }>

  return (
    <div className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-sidebar-primary" />
          <span className="text-lg font-semibold text-sidebar-foreground">StudioSphere</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
