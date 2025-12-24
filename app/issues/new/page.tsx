import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { IssueForm } from "@/components/issue-form"

export default async function NewIssuePage() {
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

  // Get available equipment (with quantity > 0)
  const { data: equipment } = await supabase
    .from("equipment")
    .select("*")
    .eq("studio_id", profile.studio_id)
    .eq("status", "available")
    .gt("quantity", 0)
    .order("name")

  return (
    <div className="flex h-screen">
      <DashboardSidebar userRole={profile.role} userId={user.id} studioId={profile.studio_id} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-2xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Issue Equipment</h1>
            <p className="text-muted-foreground">Issue equipment to a person</p>
          </div>

          <IssueForm
            equipment={equipment || []}
            userId={user.id}
            studioId={profile.studio_id}
            userRole={profile.role}
          />
        </div>
      </div>
    </div>
  )
}
