"use client"

import type React from "react"
import type { Equipment, Category } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface EquipmentFormProps {
  categories: Category[]
  studioId: string
  equipment?: Equipment
}

export function EquipmentForm({ categories, studioId, equipment }: EquipmentFormProps) {
  const [name, setName] = useState(equipment?.name || "")
  const [code, setCode] = useState(equipment?.code || "")
  const [serialNumber, setSerialNumber] = useState(equipment?.serial_number || "")
  const [quantity, setQuantity] = useState(equipment?.quantity?.toString() || "1")
  const [categoryId, setCategoryId] = useState(equipment?.category_id || "")
  const [purchaseDate, setPurchaseDate] = useState(equipment?.purchase_date || "")
  const [purchasePrice, setPurchasePrice] = useState(equipment?.purchase_price?.toString() || "")
  const [vendorName, setVendorName] = useState(equipment?.vendor_name || "")
  const [vendorContact, setVendorContact] = useState(equipment?.vendor_contact || "")
  const [vendorEmail, setVendorEmail] = useState(equipment?.vendor_email || "")
  const [condition, setCondition] = useState(equipment?.condition || "excellent")
  const [status, setStatus] = useState(equipment?.status || "available")
  const [notes, setNotes] = useState(equipment?.notes || "")
  const [newCategory, setNewCategory] = useState("")
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return

    setIsLoading(true)
    const { data, error } = await supabase
      .from("categories")
      .insert({ name: newCategory, studio_id: studioId })
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else {
      setCategoryId(data.id)
      setNewCategory("")
      setIsCreatingCategory(false)
      router.refresh()
    }
    setIsLoading(false)
  }

  const getConditionColor = (condition: string) => {
    const colors = {
      excellent: "bg-green-500",
      good: "bg-blue-500",
      fair: "bg-yellow-500",
      poor: "bg-orange-500",
      needs_repair: "bg-red-500",
    }
    return colors[condition as keyof typeof colors] || colors.good
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const equipmentData = {
      name,
      code: code || null,
      serial_number: serialNumber || null,
      quantity: quantity ? Number.parseInt(quantity) : 1,
      category_id: categoryId || null,
      purchase_date: purchaseDate || null,
      purchase_price: purchasePrice ? Number.parseFloat(purchasePrice) : null,
      vendor_name: vendorName || null,
      vendor_contact: vendorContact || null,
      vendor_email: vendorEmail || null,
      condition,
      status,
      notes: notes || null,
      studio_id: studioId,
    }

    try {
      if (equipment) {
        const { error } = await supabase.from("equipment").update(equipmentData).eq("id", equipment.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("equipment").insert(equipmentData)
        if (error) throw error
      }

      router.push("/equipment")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Equipment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Canon EOS R5"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Product Code</Label>
              <Input
                id="code"
                placeholder="PROD001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Unique code for this product (optional)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                placeholder="SN12345"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <div className="flex gap-2">
              {!isCreatingCategory ? (
                <>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={() => setIsCreatingCategory(true)}>
                    New
                  </Button>
                </>
              ) : (
                <>
                  <Input
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <Button type="button" onClick={handleCreateCategory} disabled={isLoading}>
                    Add
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreatingCategory(false)}>
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Price per Unit</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Price for a single product</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-medium">Vendor Information</div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="vendorName">Vendor Name</Label>
                <Input
                  id="vendorName"
                  placeholder="Vendor Company Name"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendorContact">Vendor Contact</Label>
                <Input
                  id="vendorContact"
                  placeholder="Phone number"
                  value={vendorContact}
                  onChange={(e) => setVendorContact(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendorEmail">Vendor Email</Label>
                <Input
                  id="vendorEmail"
                  type="email"
                  placeholder="vendor@example.com"
                  value={vendorEmail}
                  onChange={(e) => setVendorEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="condition">Condition *</Label>
              <Select value={condition} onValueChange={setCondition} required>
                <SelectTrigger>
                  <SelectValue>
                    {condition && (
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getConditionColor(condition)}`} />
                        <span className="capitalize">{condition.replace("_", " ")}</span>
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
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional information about this equipment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : equipment ? "Update Equipment" : "Add Equipment"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/equipment")}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
