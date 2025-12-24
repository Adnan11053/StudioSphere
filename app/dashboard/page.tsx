import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Package, Users, Wrench } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // If user doesn't have a studio, redirect to setup
  if (!profile.studio_id) {
    redirect("/setup")
  }

  // Fetch dashboard stats
  const { data: equipment } = await supabase.from("equipment").select("*").eq("studio_id", profile.studio_id)

  const { data: issues } = await supabase.from("issues").select("*").eq("studio_id", profile.studio_id)

  const { data: employees } = await supabase.from("profiles").select("*").eq("studio_id", profile.studio_id)

  const totalEquipment = equipment?.length || 0
  const availableEquipment = equipment?.filter((e) => e.status === "available").length || 0
  const issuedEquipment = equipment?.filter((e) => e.status === "issued").length || 0
  const maintenanceEquipment = equipment?.filter((e) => e.status === "maintenance").length || 0

  const activeIssues = issues?.filter((i) => i.status === "issued").length || 0

  const totalEmployees = employees?.length || 0

  const recentIssues = issues?.slice(0, 5) || []

  return (
    <div className="flex h-screen">
      <DashboardSidebar userRole={profile.role} userId={user.id} studioId={profile.studio_id} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile.full_name || profile.email}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEquipment}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {availableEquipment} available, {issuedEquipment} issued
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeIssues}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently issued</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{maintenanceEquipment}</div>
                <p className="text-xs text-muted-foreground mt-1">Items requiring attention</p>
              </CardContent>
            </Card>

            {profile.role === "owner" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalEmployees}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active employees</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Issues</CardTitle>
              <CardDescription>Latest equipment issue requests and returns</CardDescription>
            </CardHeader>
            <CardContent>
              {recentIssues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">No recent issues</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium">Equipment ID: {issue.equipment_id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(issue.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          issue.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : issue.status === "approved"
                              ? "bg-blue-100 text-blue-800"
                              : issue.status === "issued"
                                ? "bg-green-100 text-green-800"
                                : issue.status === "returned"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-red-100 text-red-800"
                        }`}
                      >
                        {issue.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
