import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { EquipmentImportForm } from "@/components/equipment-import-form"

export default async function ImportEquipmentPage() {
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
    redirect("/equipment")
  }

  const { data: categories } = await supabase.from("categories").select("*").eq("studio_id", profile.studio_id)

  return (
    <div className="flex h-screen">
      <DashboardSidebar userRole={profile.role} userId={user.id} studioId={profile.studio_id} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-3xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Import Equipment</h1>
            <p className="text-muted-foreground">Upload a CSV file to bulk import equipment</p>
          </div>

          <EquipmentImportForm categories={categories || []} studioId={profile.studio_id} />
        </div>
      </div>
    </div>
  )
}
