"use client"

import type React from "react"
import type { Issue } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, CheckCircle, Package } from "lucide-react"
import Link from "next/link"

interface IssueDetailProps {
  issue: Issue
  userRole: string
  userId: string
}

export function IssueDetail({ issue, userRole, userId }: IssueDetailProps) {
  const [returnCondition, setReturnCondition] = useState("")
  const [returnNotes, setReturnNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()


  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Update issue status to returned - trigger will restore quantity
    const { error: issueError } = await supabase
      .from("issues")
      .update({
        status: "returned",
        actual_return_date: new Date().toISOString(),
        return_condition: returnCondition,
        return_notes: returnNotes || null,
      })
      .eq("id", issue.id)

    if (issueError) {
      alert("Error: " + issueError.message)
    } else {
      router.push("/issues")
      router.refresh()
    }
    setIsLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      issued: "bg-green-100 text-green-800",
      returned: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return variants[status as keyof typeof variants] || variants.pending
  }

  const getConditionColor = (condition: string) => {
    const colors = {
      excellent: "bg-green-500",
      good: "bg-blue-500",
      fair: "bg-yellow-500",
      poor: "bg-orange-500",
      needs_repair: "bg-red-500",
      damaged: "bg-red-600",
    }
    return colors[condition as keyof typeof colors] || colors.good
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/issues">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Issue Details</h1>
            <p className="text-muted-foreground">Request #{issue.id.slice(0, 8)}</p>
          </div>
        </div>
        <Badge className={getStatusBadge(issue.status)}>{issue.status}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Equipment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Equipment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{issue.equipment?.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Serial Number</Label>
              <p className="font-medium">{issue.equipment?.serial_number || "—"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Condition</Label>
              <p className="font-medium">{issue.equipment?.condition?.replace("_", " ") || "—"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Issue Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Issue Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-muted-foreground">Quantity Issued</Label>
              <p className="font-medium">{issue.quantity_issued || 1}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Issued To</Label>
              <p className="font-medium">{issue.person_name || "—"}</p>
            </div>
            {issue.person_contact && (
              <div>
                <Label className="text-muted-foreground">Contact</Label>
                <p className="font-medium">{issue.person_contact}</p>
              </div>
            )}
            <div>
              <Label className="text-muted-foreground">Expected Return</Label>
              <p className="font-medium">
                {issue.expected_return_date ? new Date(issue.expected_return_date).toLocaleDateString() : "—"}
              </p>
            </div>
              <div>
              <Label className="text-muted-foreground">Issued By</Label>
                <p className="font-medium">
                {issue.issued_by_profile?.full_name || issue.issued_by_profile?.email || "—"}
                </p>
              </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {issue.issue_notes && (
        <Card>
          <CardHeader>
            <CardTitle>Issue Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{issue.issue_notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {userRole === "owner" && issue.status === "issued" && (
            <Card>
              <CardHeader>
                <CardTitle>Process Return</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReturn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="returnCondition">Return Condition *</Label>
                    <Select value={returnCondition} onValueChange={setReturnCondition} required>
                      <SelectTrigger>
                    <SelectValue placeholder="Select condition">
                      {returnCondition && (
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${getConditionColor(returnCondition)}`} />
                          <span className="capitalize">{returnCondition.replace("_", " ")}</span>
                        </div>
                      )}
                    </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                    <SelectItem value="excellent">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getConditionColor("excellent")}`} />
                        <span>Excellent</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="good">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getConditionColor("good")}`} />
                        <span>Good</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="fair">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getConditionColor("fair")}`} />
                        <span>Fair</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="poor">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getConditionColor("poor")}`} />
                        <span>Poor</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="needs_repair">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getConditionColor("needs_repair")}`} />
                        <span>Needs Repair</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="damaged">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getConditionColor("damaged")}`} />
                        <span>Damaged</span>
                      </div>
                    </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="returnNotes">Return Notes</Label>
                    <Textarea
                      id="returnNotes"
                      placeholder="Any issues, damage, or notes about the return..."
                      value={returnNotes}
                      onChange={(e) => setReturnNotes(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Complete Return"}
                  </Button>
                </form>
              </CardContent>
            </Card>
      )}

      {/* Return Info */}
      {issue.status === "returned" && (
        <Card>
          <CardHeader>
            <CardTitle>Return Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-muted-foreground">Return Date</Label>
              <p className="font-medium">
                {issue.actual_return_date ? new Date(issue.actual_return_date).toLocaleDateString() : "—"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Return Condition</Label>
              <p className="font-medium">{issue.return_condition?.replace("_", " ") || "—"}</p>
            </div>
            {issue.return_notes && (
              <div>
                <Label className="text-muted-foreground">Return Notes</Label>
                <p className="text-sm leading-relaxed">{issue.return_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
