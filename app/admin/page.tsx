"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Package } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [studioName, setStudioName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [createdEmail, setCreatedEmail] = useState<string>("")
  const [createdPassword, setCreatedPassword] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    if (!email || !password || !fullName || !studioName) {
      setError("All fields are required")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      // Step 1: Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            role: "owner",
          },
        },
      })

      if (authError) {
        console.error("Auth error:", authError)
        throw new Error(`Failed to create user: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error("Failed to create user account - no user data returned")
      }

      console.log("User created:", authData.user.id)

      // Step 2: Wait for trigger to create profile, with retries
      let profileExists = false
      let retries = 5
      while (!profileExists && retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", authData.user.id)
          .single()
        
        if (existingProfile) {
          profileExists = true
        } else {
          retries--
        }
      }

      // Step 3: Create studio - use direct insert (requires 008_allow_studio_insert.sql to be run)
      const { data: studio, error: studioError } = await supabase
        .from("studios")
        .insert({
          name: studioName,
          owner_id: authData.user.id,
        })
        .select()
        .single()

      if (studioError) {
        console.error("Studio insert error:", studioError)
        throw new Error(
          `Failed to create studio: ${studioError.message}\n\n` +
          `💡 Solution: Run '008_allow_studio_insert.sql' in Supabase SQL Editor to allow studio creation. ` +
          `This script creates a policy that allows studio inserts.`
        )
      }

      if (!studio || !studio.id) {
        throw new Error("Failed to create studio - no studio data returned")
      }

      console.log("Studio created:", studio.id)

      // Step 4: Create or update profile using RPC function to bypass RLS
      const { data: profileData, error: profileRpcError } = await supabase.rpc(
        "update_or_create_profile",
        {
          profile_id: authData.user.id,
          profile_email: email,
          profile_full_name: fullName,
          profile_studio_id: studio.id,
          profile_role: "owner",
        }
      )

      if (profileRpcError) {
        console.error("Profile RPC error:", profileRpcError)
        // Fallback: Try direct update/insert
        if (profileExists) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ 
              studio_id: studio.id, 
              role: "owner", 
              full_name: fullName,
              email: email 
            })
            .eq("id", authData.user.id)

          if (profileError) {
            throw new Error(`Failed to update profile: ${profileError.message}. Make sure you've run '007_fix_studios_insert.sql' to create the helper function.`)
          }
        } else {
          const { error: createProfileError } = await supabase
            .from("profiles")
            .insert({
              id: authData.user.id,
              email: email,
              full_name: fullName,
              studio_id: studio.id,
              role: "owner",
            })

          if (createProfileError) {
            throw new Error(`Failed to create profile: ${createProfileError.message}. Make sure you've run '007_fix_studios_insert.sql' to create the helper function.`)
          }
        }
        console.log("Profile created/updated (direct)")
      } else {
        console.log("Profile created/updated (via RPC function):", profileData)
      }

      // Step 5: Create default categories
      const defaultCategories = [
        "Cameras",
        "Lenses",
        "Lighting",
        "Audio",
        "Tripods & Supports",
        "Accessories",
      ]

      const categoriesData = defaultCategories.map((name) => ({
        studio_id: studio.id,
        name,
      }))

      const { error: categoriesError } = await supabase.from("categories").insert(categoriesData)
      
      if (categoriesError) {
        console.warn("Categories error (non-critical):", categoriesError)
        // Don't throw - categories are optional
      }

      // Success!
      setCreatedEmail(email)
      setCreatedPassword(password)
      setSuccess("created")
      
      // Reset form
      setEmail("")
      setPassword("")
      setFullName("")
      setStudioName("")
    } catch (error: unknown) {
      console.error("Full error:", error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An error occurred while creating the owner account"
      
      // Provide more helpful error messages
      let displayError = errorMessage
      if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
        displayError = `${errorMessage}\n\n💡 Solution: Run the SQL scripts in the 'scripts' folder to create the database tables. Start with '001_create_tables.sql'`
      } else if (errorMessage.includes("new row violates row-level security")) {
        displayError = `${errorMessage}\n\n💡 Solution: Check your RLS (Row Level Security) policies. Run '003_fix_rls_policies.sql' to set them up.`
      } else if (errorMessage.includes("User already registered")) {
        displayError = "This email is already registered. Please use a different email address."
      }
      
      setError(displayError)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-b from-background via-background to-card">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Admin - Create Owner Account</CardTitle>
            </div>
            <CardDescription>
              Enter the owner's details below to create a new owner account. The owner will be able to login with the email and password you provide.
            </CardDescription>
            <div className="mt-2 text-xs text-muted-foreground italic">
              ⚠️ Hidden route - Not linked from public pages
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOwner}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="studioName">Studio Name *</Label>
                  <Input
                    id="studioName"
                    type="text"
                    placeholder="My Creative Studio"
                    required
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Owner Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="owner@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">The email address the owner will use to login</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Owner Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter a secure password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">Minimum 6 characters. Share this password securely with the owner.</p>
                </div>
                {error && (
                  <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive space-y-2">
                    <p className="font-semibold">Error creating account:</p>
                    <pre className="text-xs whitespace-pre-wrap break-words bg-destructive/10 p-2 rounded">
                      {error}
                    </pre>
                    <p className="text-xs mt-2">
                      💡 Check the browser console (F12) for detailed error messages. 
                      Make sure your database tables are set up by running the SQL scripts in the 'scripts' folder.
                    </p>
                  </div>
                )}
                {success && (
                  <div className="rounded-md bg-green-500/15 p-4 text-sm text-green-700 dark:text-green-400 space-y-2">
                    <p className="font-semibold">✓ Owner Account Created Successfully!</p>
                    <div className="space-y-1 text-xs bg-green-50 dark:bg-green-950/30 p-3 rounded border border-green-200 dark:border-green-800">
                      <p><strong>Email:</strong> {createdEmail}</p>
                      <p><strong>Password:</strong> {createdPassword}</p>
                    </div>
                    <p className="text-xs mt-2">Share these credentials securely with the owner. They can now login at the login page.</p>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Owner Account"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                <Link href="/auth/login" className="underline underline-offset-4">
                  Go to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

