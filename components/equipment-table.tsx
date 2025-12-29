"use client"

import type { Equipment, Category } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Edit, FileText, History, Search, Trash2, Upload } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { downloadCSV, exportEquipmentToCSV } from "@/lib/excel-utils"
import { EquipmentInvoice } from "@/components/equipment-invoice"

interface EquipmentTableProps {
  equipment: Equipment[]
  categories: Category[]
  userRole: string
  studioId: string
}

export function EquipmentTable({ equipment, categories, userRole, studioId }: EquipmentTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [invoiceEquipment, setInvoiceEquipment] = useState<Equipment | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesCategory = categoryFilter === "all" || item.category_id === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return

    const { error } = await supabase.from("equipment").delete().eq("id", id)

    if (error) {
      alert("Error deleting equipment: " + error.message)
    } else {
      router.refresh()
    }
  }

  const handleExport = () => {
    const csvContent = exportEquipmentToCSV(filteredEquipment)
    const timestamp = new Date().toISOString().split("T")[0]
    downloadCSV(csvContent, `equipment-export-${timestamp}.csv`)
  }
  // </CHANGE>

  const getStatusBadge = (status: string) => {
    const variants = {
      available: "bg-green-100 text-green-800",
      issued: "bg-blue-100 text-blue-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      retired: "bg-gray-100 text-gray-800",
    }
    return variants[status as keyof typeof variants] || variants.available
  }

  const getConditionBadge = (condition: string | null) => {
    if (!condition) return "bg-gray-100 text-gray-800"
    const variants = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      fair: "bg-yellow-100 text-yellow-800",
      poor: "bg-orange-100 text-orange-800",
      needs_repair: "bg-red-100 text-red-800",
    }
    return variants[condition as keyof typeof variants] || variants.good
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, code, or serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="issued">Issued</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {userRole === "owner" && (
            <Button variant="outline" asChild>
              <Link href="/equipment/import">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Link>
            </Button>
          )}
        </div>
        {/* </CHANGE> */}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEquipment.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No equipment found
                </TableCell>
              </TableRow>
            ) : (
              filteredEquipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">{item.code || "—"}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category?.name || "—"}</TableCell>
                  <TableCell>{item.quantity || 1}</TableCell>
                  <TableCell>{item.purchase_price ? `₹${Number(item.purchase_price).toFixed(2)}` : "—"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(item.status)}>{item.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setInvoiceEquipment(item)}
                        title="Print Invoice"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        title="View History"
                      >
                        <Link href={`/equipment/${item.id}/history`}>
                          <History className="h-4 w-4" />
                        </Link>
                      </Button>
                      {userRole === "owner" && (
                        <>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/equipment/${item.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invoice Dialog */}
      {invoiceEquipment && (
        <EquipmentInvoice
          equipment={invoiceEquipment}
          open={!!invoiceEquipment}
          onOpenChange={(open) => !open && setInvoiceEquipment(null)}
        />
      )}
    </div>
  )
}
