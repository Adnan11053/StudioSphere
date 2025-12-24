import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EquipmentUtilizationReport } from "@/components/equipment-utilization-report"
import { IssueHistoryReport } from "@/components/issue-history-report"
import { MaintenanceReport } from "@/components/maintenance-report"

export default async function ReportsPage() {
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

  // Fetch all data for reports
  const { data: equipment } = await supabase
    .from("equipment")
    .select("*, category:categories(*)")
    .eq("studio_id", profile.studio_id)

  const { data: issues } = await supabase
    .from("issues")
    .select(
      `
      *,
      equipment:equipment(*)
    `,
    )
    .eq("studio_id", profile.studio_id)
    .order("created_at", { ascending: false })

  const { data: maintenanceRecords } = await supabase
    .from("maintenance_records")
    .select("*, equipment:equipment(*)")
    .eq("studio_id", profile.studio_id)
    .order("performed_at", { ascending: false })

  return (
    <div className="flex h-screen">
      <DashboardSidebar userRole={profile.role} userId={user.id} studioId={profile.studio_id} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Comprehensive insights into your studio operations</p>
          </div>

          <Tabs defaultValue="utilization" className="space-y-6">
            <TabsList>
              <TabsTrigger value="utilization">Equipment Utilization</TabsTrigger>
              <TabsTrigger value="history">Issue History</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="utilization">
              <EquipmentUtilizationReport equipment={equipment || []} issues={issues || []} />
            </TabsContent>

            <TabsContent value="history">
              <IssueHistoryReport issues={issues || []} />
            </TabsContent>

            <TabsContent value="maintenance">
              <MaintenanceReport maintenanceRecords={maintenanceRecords || []} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
