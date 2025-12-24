import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { EmployeeEditForm } from "@/components/employee-edit-form"

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile?.studio_id || profile.role !== "owner") {
    redirect("/employees")
  }

  const { data: employee } = await supabase.from("profiles").select("*").eq("id", id).single()

  if (!employee || employee.studio_id !== profile.studio_id) {
    redirect("/employees")
  }

  return (
    <div className="flex h-screen">
      <DashboardSidebar userRole={profile.role} userId={user.id} studioId={profile.studio_id} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-2xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Edit Employee</h1>
            <p className="text-muted-foreground">Update employee details and permissions</p>
          </div>

          <EmployeeEditForm employee={employee} studioId={profile.studio_id} />
        </div>
      </div>
    </div>
  )
}
