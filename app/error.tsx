"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  const isEnvError = error.message?.includes("Missing Supabase environment variables")

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-2xl">Something went wrong</CardTitle>
          </div>
          <CardDescription>
            {isEnvError
              ? "Configuration error detected"
              : "An unexpected error occurred"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
            <p className="font-semibold mb-2">Error Details:</p>
            <p className="break-words">{error.message}</p>
          </div>

          {isEnvError && (
            <div className="rounded-md bg-blue-500/15 p-4 text-sm text-blue-700 dark:text-blue-400">
              <p className="font-semibold mb-2">How to fix:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Create a <code className="bg-background px-1 rounded">.env.local</code> file in the root directory</li>
                <li>Add your Supabase credentials:</li>
                <li className="ml-4">
                  <code className="bg-background px-1 rounded block mt-1">
                    NEXT_PUBLIC_SUPABASE_URL=your_url_here
                  </code>
                  <code className="bg-background px-1 rounded block mt-1">
                    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
                  </code>
                </li>
                <li>Restart your development server</li>
              </ol>
              <p className="mt-3 text-xs">
                See <Link href="/ENV_SETUP.md" className="underline">ENV_SETUP.md</Link> for detailed instructions.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={reset} variant="default">
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

