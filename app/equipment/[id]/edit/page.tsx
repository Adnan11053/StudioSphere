import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { EquipmentForm } from "@/components/equipment-form"

export default async function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (profile.role === "employee") {
    redirect("/equipment")
  }

  const { data: equipment } = await supabase.from("equipment").select("*").eq("id", id).single()

  if (!equipment) {
    redirect("/equipment")
  }

  const { data: categories } = await supabase.from("categories").select("*").eq("studio_id", profile.studio_id)

  return (
    <div className="flex h-screen">
      <DashboardSidebar userRole={profile.role} userId={user.id} studioId={profile.studio_id} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-2xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Edit Equipment</h1>
            <p className="text-muted-foreground">Update equipment details</p>
          </div>

          <EquipmentForm categories={categories || []} studioId={profile.studio_id} equipment={equipment} />
        </div>
      </div>
    </div>
  )
}
