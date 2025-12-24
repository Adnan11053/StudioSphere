import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { IssuesTable } from "@/components/issues-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function IssuesPage() {
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

  // Fetch issues with related data
  const { data: issues, error: issuesError } = await supabase
    .from("issues")
    .select(
      `
      *,
      equipment:equipment(*)
    `,
    )
    .eq("studio_id", profile.studio_id)
    .order("created_at", { ascending: false })

  // Log for debugging
  if (issuesError) {
    console.error("Error fetching issues:", issuesError)
  } else {
    console.log("Issues fetched:", issues?.length || 0, "issues")
  }

  return (
    <div className="flex h-screen">
      <DashboardSidebar userRole={profile.role} userId={user.id} studioId={profile.studio_id} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Equipment Issues</h1>
              <p className="text-muted-foreground">Track equipment issued to people</p>
            </div>
            <Button asChild>
              <Link href="/issues/new">
                <Plus className="mr-2 h-4 w-4" />
                Issue Equipment
              </Link>
            </Button>
          </div>

          {issuesError && (
            <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                Error loading issues: {issuesError.message}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Make sure you've run '012_update_issues_for_persons.sql' in Supabase SQL Editor.
              </p>
            </div>
          )}
          <IssuesTable issues={issues || []} userRole={profile.role} userId={user.id} />
        </div>
      </div>
    </div>
  )
}
