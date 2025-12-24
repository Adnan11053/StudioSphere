"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function SetupPage() {
  const [studioName, setStudioName] = useState("")
  const [studioId, setStudioId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Check if user already has a studio
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profile?.studio_id) {
        router.push("/dashboard")
      }
    }

    checkUser()
  }, [router, supabase])

  const handleCreateStudio = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Create studio
      const { data: studio, error: studioError } = await supabase
        .from("studios")
        .insert({
          name: studioName,
          owner_id: user.id,
        })
        .select()
        .single()

      if (studioError) throw studioError

      // Update profile with studio_id and set role to owner
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ studio_id: studio.id, role: "owner" })
        .eq("id", user.id)

      if (profileError) throw profileError

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinStudio = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Verify studio exists - use maybeSingle to handle RLS gracefully
      const { data: studio, error: studioError } = await supabase
        .from("studios")
        .select("id, name")
        .eq("id", studioId)
        .maybeSingle()

      if (studioError) {
        console.error("Studio lookup error:", studioError)
        throw new Error(`Failed to verify studio: ${studioError.message}`)
      }

      if (!studio) {
        throw new Error("Invalid studio ID. Please check the studio ID and try again.")
      }

      // Update profile with studio_id and set role to employee
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ studio_id: studioId, role: "employee" })
        .eq("id", user.id)

      if (profileError) throw profileError

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Tabs defaultValue="join" className="w-full">
          
          <TabsContent value="join">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Join a Studio</CardTitle>
                <CardDescription>Enter the studio ID provided by your studio owner</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinStudio}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="studioId">Studio ID</Label>
                      <Input
                        id="studioId"
                        type="text"
                        placeholder="Enter studio ID"
                        required
                        value={studioId}
                        onChange={(e) => setStudioId(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Ask your studio owner for this ID</p>
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Joining studio..." : "Join Studio"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
