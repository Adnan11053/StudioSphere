import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default async function InviteEmployeePage() {
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

  const { data: studio } = await supabase.from("studios").select("*").eq("id", profile.studio_id).single()

  return (
    <div className="flex h-screen">
      <DashboardSidebar userRole={profile.role} userId={user.id} studioId={profile.studio_id} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-2xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Invite Employee</h1>
            <p className="text-muted-foreground">Add new team members to your studio</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Employee Invitation</CardTitle>
              <CardDescription>Share these instructions with your new team member</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  To add an employee, have them sign up at the registration page and use the following studio ID during
                  the setup process.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h3 className="font-semibold">Studio Information</h3>
                <div className="rounded-lg border bg-muted p-4 space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Studio Name</p>
                    <p className="font-mono font-semibold">{studio?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Studio ID</p>
                    <p className="font-mono font-semibold text-lg">{profile.studio_id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Instructions for New Employee</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Go to the sign-up page and create an account</li>
                  <li>After email verification, log in to your account</li>
                  <li>You will be prompted to enter a studio ID</li>
                  <li>Enter the Studio ID shown above</li>
                  <li>You will be added as an employee with access to view equipment and create issue requests</li>
                </ol>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  As an owner, you can manage employee permissions from the employee management page to control which
                  tabs and features each employee can access.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
