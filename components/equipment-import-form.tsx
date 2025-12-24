"use client"

import type React from "react"
import type { Category } from "@/lib/types"
import type { EquipmentImportRow } from "@/lib/excel-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { parseEquipmentCSV } from "@/lib/excel-utils"
import { AlertCircle, FileUp, Info } from "lucide-react"

interface EquipmentImportFormProps {
  categories: Category[]
  studioId: string
}

export function EquipmentImportForm({ categories, studioId }: EquipmentImportFormProps) {
  const [parsedData, setParsedData] = useState<EquipmentImportRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<number | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const parsed = parseEquipmentCSV(text)
        setParsedData(parsed)
        setError(null)
      } catch (err) {
        setError("Error parsing CSV file")
        setParsedData([])
      }
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Create category map
      const categoryMap = new Map(categories.map((cat) => [cat.name.toLowerCase(), cat.id]))

      const equipmentData = parsedData.map((row) => {
        const categoryId = row.category ? categoryMap.get(row.category.toLowerCase()) : null

        return {
          studio_id: studioId,
          name: row.name,
          serial_number: row.serial_number || null,
          category_id: categoryId || null,
          status: row.status || "available",
          condition: row.condition || "good",
          purchase_date: row.purchase_date || null,
          purchase_price: row.purchase_price ? Number.parseFloat(row.purchase_price) : null,
          notes: row.notes || null,
        }
      })

      const { data, error: insertError } = await supabase.from("equipment").insert(equipmentData).select()

      if (insertError) throw insertError

      setSuccess(data.length)
      setParsedData([])

      setTimeout(() => {
        router.push("/equipment")
        router.refresh()
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>Select a CSV file with equipment data to import</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="cursor-pointer"
            />
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">CSV Format Requirements:</p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  <li>
                    Headers: Name, Serial Number, Category, Status, Condition, Purchase Date, Purchase Price, Notes
                  </li>
                  <li>Name is required for each row</li>
                  <li>Status values: available, issued, maintenance, retired</li>
                  <li>Condition values: excellent, good, fair, poor, needs_repair</li>
                  <li>Categories must match existing categories or will be ignored</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully imported {success} items. Redirecting to equipment list...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview ({parsedData.length} items)</CardTitle>
            <CardDescription>Review the data before importing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Condition</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 10).map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.serial_number || "—"}</TableCell>
                      <TableCell>{row.category || "—"}</TableCell>
                      <TableCell>{row.status || "available"}</TableCell>
                      <TableCell>{row.condition || "good"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {parsedData.length > 10 && (
              <p className="text-sm text-muted-foreground mt-2">Showing first 10 of {parsedData.length} items</p>
            )}

            <div className="flex gap-3 mt-4">
              <Button onClick={handleImport} disabled={isLoading}>
                {isLoading ? "Importing..." : `Import ${parsedData.length} Items`}
              </Button>
              <Button variant="outline" onClick={() => router.push("/equipment")}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {parsedData.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileUp className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">Upload a CSV file to preview and import equipment</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
