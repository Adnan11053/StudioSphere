import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { IssueDetail } from "@/components/issue-detail"

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: issue } = await supabase
    .from("issues")
    .select(
      `
      *,
      equipment:equipment(*),
      issued_by_profile:profiles!issues_issued_by_fkey(id, full_name, email)
    `,
    )
    .eq("id", id)
    .single()

  if (!issue) {
    redirect("/issues")
  }

  return (
    <div className="flex h-screen">
      <DashboardSidebar userRole={profile.role} userId={user.id} studioId={profile.studio_id} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-3xl p-8">
          <IssueDetail issue={issue} userRole={profile.role} userId={user.id} />
        </div>
      </div>
    </div>
  )
}
