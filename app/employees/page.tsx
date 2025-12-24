import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { EmployeesTable } from "@/components/employees-table"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import Link from "next/link"

export default async function EmployeesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile?.studio_id) {
    redirect("/setup")
  }

  if (profile.role === "employee") {
    redirect("/dashboard")
  }

  const { data: employees } = await supabase
    .from("profiles")
    .select("*")
    .eq("studio_id", profile.studio_id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex h-screen">
      <DashboardSidebar userRole={profile.role} userId={user.id} studioId={profile.studio_id} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Employees</h1>
              <p className="text-muted-foreground">Manage your team members and their permissions</p>
            </div>
            <Button asChild>
              <Link href="/employees/invite">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Employee
              </Link>
            </Button>
          </div>

          <EmployeesTable employees={employees || []} userRole={profile.role} currentUserId={user.id} />
        </div>
      </div>
    </div>
  )
}
