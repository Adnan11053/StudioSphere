import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { EquipmentTable } from "@/components/equipment-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function EquipmentPage() {
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

  // Fetch equipment with categories
  const { data: equipment } = await supabase
    .from("equipment")
    .select("*, category:categories(*)")
    .eq("studio_id", profile.studio_id)
    .order("created_at", { ascending: false })

  const { data: categories } = await supabase.from("categories").select("*").eq("studio_id", profile.studio_id)

  return (
    <div className="flex h-screen">
      <DashboardSidebar userRole={profile.role} userId={user.id} studioId={profile.studio_id} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Equipment</h1>
              <p className="text-muted-foreground">Manage your studio equipment inventory</p>
            </div>
            {profile.role === "owner" && (
              <Button asChild>
                <Link href="/equipment/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Equipment
                </Link>
              </Button>
            )}
          </div>

          <EquipmentTable
            equipment={equipment || []}
            categories={categories || []}
            userRole={profile.role}
            studioId={profile.studio_id}
          />
        </div>
      </div>
    </div>
  )
}
