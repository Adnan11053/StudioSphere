import type { Equipment, Issue, Profile } from "./types"

export function exportEquipmentToCSV(equipment: Equipment[]): string {
  const headers = [
    "Name",
    "Serial Number",
    "Category",
    "Status",
    "Condition",
    "Purchase Date",
    "Purchase Price",
    "Notes",
  ]

  const rows = equipment.map((item) => [
    item.name,
    item.serial_number || "",
    item.category?.name || "",
    item.status,
    item.condition || "",
    item.purchase_date || "",
    item.purchase_price?.toString() || "",
    item.notes || "",
  ])

  const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  return csvContent
}

export function exportIssuesToCSV(issues: Issue[]): string {
  const headers = [
    "Equipment",
    "Issued To",
    "Status",
    "Issue Date",
    "Expected Return",
    "Actual Return",
    "Return Condition",
    "Issue Notes",
    "Return Notes",
  ]

  const rows = issues.map((issue) => [
    issue.equipment?.name || "",
    issue.issued_to_profile?.email || "",
    issue.status,
    issue.issued_at ? new Date(issue.issued_at).toLocaleDateString() : "",
    issue.expected_return_date ? new Date(issue.expected_return_date).toLocaleDateString() : "",
    issue.actual_return_date ? new Date(issue.actual_return_date).toLocaleDateString() : "",
    issue.return_condition || "",
    issue.issue_notes || "",
    issue.return_notes || "",
  ])

  const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  return csvContent
}

export function exportEmployeesToCSV(employees: Profile[]): string {
  const headers = ["Name", "Email", "Role", "Joined Date"]

  const rows = employees.map((employee) => [
    employee.full_name || "",
    employee.email,
    employee.role,
    new Date(employee.created_at).toLocaleDateString(),
  ])

  const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  return csvContent
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export interface EquipmentImportRow {
  name: string
  serial_number?: string
  category?: string
  status?: string
  condition?: string
  purchase_date?: string
  purchase_price?: string
  notes?: string
}

export function parseEquipmentCSV(csvText: string): EquipmentImportRow[] {
  const lines = csvText.trim().split("\n")
  if (lines.length < 2) return []

  // Remove headers
  const dataLines = lines.slice(1)

  return dataLines
    .map((line) => {
      // Simple CSV parser (handles quoted fields)
      const fields: string[] = []
      let currentField = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          fields.push(currentField.trim())
          currentField = ""
        } else {
          currentField += char
        }
      }
      fields.push(currentField.trim())

      if (fields.length < 1 || !fields[0]) return null

      return {
        name: fields[0] || "",
        serial_number: fields[1] || undefined,
        category: fields[2] || undefined,
        status: fields[3] || undefined,
        condition: fields[4] || undefined,
        purchase_date: fields[5] || undefined,
        purchase_price: fields[6] || undefined,
        notes: fields[7] || undefined,
      }
    })
    .filter((row): row is EquipmentImportRow => row !== null && row.name !== "")
}
