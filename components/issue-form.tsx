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
import { useState, useEffect } from "react"

interface IssueFormProps {
  equipment: Equipment[]
  userId: string
  studioId: string
  userRole: string
}

export function IssueForm({ equipment, userId, studioId, userRole }: IssueFormProps) {
  const [equipmentId, setEquipmentId] = useState("")
  const [productCode, setProductCode] = useState("")
  const [useCodeLookup, setUseCodeLookup] = useState(false)
  const [codeLookupEquipment, setCodeLookupEquipment] = useState<Equipment | null>(null)
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

  // Handle code lookup with useEffect
  useEffect(() => {
    const lookupCode = async () => {
      if (!useCodeLookup || !productCode.trim()) {
        setCodeLookupEquipment(null)
        if (!useCodeLookup) {
          setEquipmentId("")
        }
        return
      }

      const { data, error: lookupError } = await supabase
        .from("equipment")
        .select("*")
        .eq("studio_id", studioId)
        .eq("code", productCode.trim())
        .eq("status", "available")
        .gt("quantity", 0)
        .single()

      if (lookupError || !data) {
        setCodeLookupEquipment(null)
        setEquipmentId("")
        if (productCode.trim()) {
          setError(`No equipment found with code: ${productCode.trim()}`)
        } else {
          setError(null)
        }
        return
      }

      setCodeLookupEquipment(data as Equipment)
      setEquipmentId(data.id)
      setError(null)
    }

    // Debounce the lookup
    const timeoutId = setTimeout(() => {
      lookupCode()
    }, 300)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productCode, useCodeLookup, studioId])

  // Get available quantity for selected equipment (either from dropdown or code lookup)
  const selectedEquipment = codeLookupEquipment || equipment.find((e) => e.id === equipmentId)
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
    setProductCode("");
    setCodeLookupEquipment(null);
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
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                type="button"
                variant={!useCodeLookup ? "default" : "outline"}
                onClick={() => {
                  setUseCodeLookup(false)
                  setProductCode("")
                  setCodeLookupEquipment(null)
                  setEquipmentId("")
                }}
              >
                Select Equipment
              </Button>
              <Button
                type="button"
                variant={useCodeLookup ? "default" : "outline"}
                onClick={() => {
                  setUseCodeLookup(true)
                  setEquipmentId("")
                }}
              >
                Enter Code
              </Button>
            </div>

            {!useCodeLookup ? (
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
            ) : (
              <div className="space-y-2">
                <Label htmlFor="productCode">Product Code *</Label>
                <Input
                  id="productCode"
                  placeholder="Enter product code (e.g., PROD001)"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                />
                {productCode && !codeLookupEquipment && (
                  <p className="text-xs text-muted-foreground">Looking up product...</p>
                )}
              </div>
            )}

            {/* Display product details when equipment is found via code */}
            {codeLookupEquipment && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="font-semibold text-lg">Product Details</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 font-medium">{codeLookupEquipment.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Code:</span>
                    <span className="ml-2 font-medium">{codeLookupEquipment.code}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Serial Number:</span>
                    <span className="ml-2 font-medium">{codeLookupEquipment.serial_number || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Available Quantity:</span>
                    <span className="ml-2 font-medium">{codeLookupEquipment.quantity}</span>
                  </div>
                  {codeLookupEquipment.purchase_date && (
                    <div>
                      <span className="text-muted-foreground">Purchase Date:</span>
                      <span className="ml-2 font-medium">{new Date(codeLookupEquipment.purchase_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {codeLookupEquipment.purchase_price && (
                    <div>
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="ml-2 font-medium">₹{Number(codeLookupEquipment.purchase_price).toFixed(2)}</span>
                    </div>
                  )}
                  {codeLookupEquipment.vendor_name && (
                    <div>
                      <span className="text-muted-foreground">Vendor Name:</span>
                      <span className="ml-2 font-medium">{codeLookupEquipment.vendor_name}</span>
                    </div>
                  )}
                  {codeLookupEquipment.vendor_contact && (
                    <div>
                      <span className="text-muted-foreground">Vendor Contact:</span>
                      <span className="ml-2 font-medium">{codeLookupEquipment.vendor_contact}</span>
                    </div>
                  )}
                  {codeLookupEquipment.vendor_email && (
                    <div>
                      <span className="text-muted-foreground">Vendor Email:</span>
                      <span className="ml-2 font-medium">{codeLookupEquipment.vendor_email}</span>
                    </div>
                  )}
                  {codeLookupEquipment.condition && (
                    <div>
                      <span className="text-muted-foreground">Condition:</span>
                      <span className="ml-2 font-medium capitalize">{codeLookupEquipment.condition.replace("_", " ")}</span>
                    </div>
                  )}
                </div>
              </div>
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
