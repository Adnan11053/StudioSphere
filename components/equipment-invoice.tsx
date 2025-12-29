"use client"

import type { Equipment } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Printer } from "lucide-react"
import { useRef } from "react"

interface EquipmentInvoiceProps {
  equipment: Equipment
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EquipmentInvoice({ equipment, open, onOpenChange }: EquipmentInvoiceProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (!printRef.current) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Purchase Invoice - ${equipment.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 10px; }
            h2 { font-size: 20px; margin-top: 20px; margin-bottom: 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
            .border-t { border-top: 1px solid #e5e7eb; padding-top: 16px; }
            .border-b { border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; }
            p { margin: 4px 0; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Purchase Invoice</DialogTitle>
        </DialogHeader>
        <div ref={printRef} className="space-y-6 p-6">
          {/* Invoice Header */}
          <div className="border-b pb-4">
            <h1 className="text-2xl font-bold">Purchase Invoice</h1>
            <p className="text-muted-foreground">Equipment Purchase Details</p>
          </div>

          {/* Product Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Product Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Product Name</p>
                <p className="font-medium">{equipment.name}</p>
              </div>
              {equipment.code && (
                <div>
                  <p className="text-sm text-muted-foreground">Product Code</p>
                  <p className="font-medium font-mono">{equipment.code}</p>
                </div>
              )}
              {equipment.serial_number && (
                <div>
                  <p className="text-sm text-muted-foreground">Serial Number</p>
                  <p className="font-medium">{equipment.serial_number}</p>
                </div>
              )}
              {equipment.category && (
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{equipment.category.name}</p>
                </div>
              )}
              {equipment.condition && (
                <div>
                  <p className="text-sm text-muted-foreground">Condition</p>
                  <p className="font-medium capitalize">{equipment.condition.replace("_", " ")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Purchase Details */}
          {(equipment.purchase_date || equipment.purchase_price) && (
            <div className="space-y-4 border-t pt-4">
              <h2 className="text-xl font-semibold">Purchase Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {equipment.purchase_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Purchase Date</p>
                    <p className="font-medium">{new Date(equipment.purchase_date).toLocaleDateString()}</p>
                  </div>
                )}
                {equipment.purchase_price && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Price per Unit</p>
                      <p className="font-medium">₹{Number(equipment.purchase_price).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quantity</p>
                      <p className="font-medium">{equipment.quantity || 1}</p>
                    </div>
                    <div className="col-span-2 border-t pt-2 mt-2">
                      <p className="text-sm text-muted-foreground">Total Price</p>
                      <p className="font-bold text-xl">₹{Number(equipment.purchase_price * (equipment.quantity || 1)).toFixed(2)}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Vendor Information */}
          {(equipment.vendor_name || equipment.vendor_contact || equipment.vendor_email) && (
            <div className="space-y-4 border-t pt-4">
              <h2 className="text-xl font-semibold">Vendor Information</h2>
              <div className="grid grid-cols-2 gap-4">
                {equipment.vendor_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Vendor Name</p>
                    <p className="font-medium">{equipment.vendor_name}</p>
                  </div>
                )}
                {equipment.vendor_contact && (
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">{equipment.vendor_contact}</p>
                  </div>
                )}
                {equipment.vendor_email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{equipment.vendor_email}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {equipment.notes && (
            <div className="space-y-2 border-t pt-4">
              <h2 className="text-xl font-semibold">Notes</h2>
              <p className="text-muted-foreground">{equipment.notes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

