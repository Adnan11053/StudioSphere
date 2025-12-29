import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { EquipmentHistory } from "@/components/equipment-history"

export default async function EquipmentHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  // Fetch equipment details
  const { data: equipment } = await supabase
    .from("equipment")
    .select("*, category:categories(*)")
    .eq("id", id)
    .eq("studio_id", profile.studio_id)
    .single()

  if (!equipment) {
    redirect("/equipment")
  }

  // Fetch all issues for this equipment
  const { data: issues } = await supabase
    .from("issues")
    .select(
      `
      *,
      issued_by_profile:profiles!issues_issued_by_fkey(id, full_name, email)
    `
    )
    .eq("equipment_id", id)
    .eq("studio_id", profile.studio_id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex h-screen">
      <DashboardSidebar userRole={profile.role} userId={user.id} studioId={profile.studio_id} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-4xl p-8">
          <EquipmentHistory equipment={equipment} issues={issues || []} />
        </div>
      </div>
    </div>
  )
}

