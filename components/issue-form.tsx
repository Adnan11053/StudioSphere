"use client"

import type React from "react"
import type { Equipment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface IssueFormProps {
  equipment: Equipment[]
  userId: string
  studioId: string
  userRole: string
}

export function IssueForm({ equipment, userId, studioId, userRole }: IssueFormProps) {
  const [equipmentId, setEquipmentId] = useState("")
  const [personName, setPersonName] = useState("")
  const [personContact, setPersonContact] = useState("")
  const [quantityIssued, setQuantityIssued] = useState("1")
  const [expectedReturnDate, setExpectedReturnDate] = useState("")
  const [issueNotes, setIssueNotes] = useState("")
  const [cart, setCart] = useState<{ equipmentId: string, name: string, serial: string | null, quantity: number, max: number }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Get available quantity for selected equipment
  const selectedEquipment = equipment.find((e) => e.id === equipmentId)
  const availableQuantity = selectedEquipment?.quantity || 0

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number.parseInt(quantityIssued) || 1;
    if (!equipmentId || !selectedEquipment) return;
    if (qty < 1 || qty > availableQuantity) {
      setError(`Insufficient quantity. Available: ${availableQuantity}, Requested: ${qty}`);
      return;
    }
    if (cart.find(item => item.equipmentId === equipmentId)) {
      setError("This equipment is already in your cart");
      return;
    }
    setCart([...cart, { equipmentId, name: selectedEquipment.name, serial: selectedEquipment.serial_number || null, quantity: qty, max: availableQuantity }]);
    setEquipmentId("");
    setQuantityIssued("1");
    setError(null);
  }

  const handleRemoveFromCart = (equipmentId:string) => {
    setCart(cart.filter(item => item.equipmentId !== equipmentId));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (!personName) {
        throw new Error("Person Name is required");
      }
      if (cart.length === 0) {
        throw new Error("Please add at least one product to the cart");
      }
      let toInsert = cart.map((item) => ({
        studio_id: studioId,
        equipment_id: item.equipmentId,
        issued_to: null, // Not required anymore - using person_name instead
        person_name: personName || null,
        person_contact: personContact || null,
        quantity_issued: item.quantity,
        issued_by: userId,
        expected_return_date: expectedReturnDate || null,
        issue_notes: issueNotes || null,
        status: "issued",
      }));
      const { error } = await supabase.from("issues").insert(toInsert);
      if (error) {
        console.error("Issue creation error:", error);
        throw new Error(`Failed to issue equipment: ${error.message}. Make sure you've run '012_update_issues_for_persons.sql' in Supabase SQL Editor.`);
      }
      router.push("/issues");
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      console.error("Error issuing equipment:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Issue Equipment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="equipment">Equipment *</Label>
            <Select value={equipmentId} onValueChange={setEquipmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                {equipment.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No available equipment</div>
                ) : (
                  equipment.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} {item.serial_number && `(${item.serial_number})`} (Available: {item.quantity})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedEquipment && (
              <p className="text-xs text-muted-foreground">
                Available quantity: {availableQuantity}
              </p>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="personName">Person Name *</Label>
              <Input
                id="personName"
                placeholder="Enter person name"
                required
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personContact">Contact (Phone/Email)</Label>
              <Input
                id="personContact"
                placeholder="Phone or email"
                value={personContact}
                onChange={(e) => setPersonContact(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 flex gap-3 items-end">
            <div className="flex-1">
              <Label htmlFor="quantityIssued">Quantity to Issue *</Label>
              <Input
                id="quantityIssued"
                type="number"
                min="1"
                max={availableQuantity}
                value={quantityIssued}
                onChange={(e) => setQuantityIssued(e.target.value)}
                disabled={!equipmentId}
              />
            </div>
            <Button type="button" variant="outline" className="mt-6" onClick={handleAddToCart} disabled={!equipmentId || Number(quantityIssued) < 1}>
              Add to Cart
            </Button>
          </div>
          {/* Cart table */}
          {cart.length > 0 && (
            <div className="space-y-2">
              <Label>Equipment Cart</Label>
              <div className="rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b"><th>Equipment</th><th>Serial</th><th>Qty</th><th></th></tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.equipmentId} className="border-b">
                        <td>{item.name}</td>
                        <td>{item.serial || "—"}</td>
                        <td>{item.quantity}</td>
                        <td><Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveFromCart(item.equipmentId)}>-</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="expectedReturnDate">Expected Return Date</Label>
            <Input
              id="expectedReturnDate"
              type="date"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="issueNotes">Notes</Label>
            <Textarea
              id="issueNotes"
              placeholder="Purpose, location, usage details, etc..."
              value={issueNotes}
              onChange={(e) => setIssueNotes(e.target.value)}
              rows={4}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading || cart.length === 0 || !personName}>
              {isLoading ? "Issuing..." : "Issue Equipment"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/issues")}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
