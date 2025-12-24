export type UserRole = "owner" | "employee"

export type EquipmentStatus = "available" | "issued" | "maintenance" | "retired"

export type EquipmentCondition = "excellent" | "good" | "fair" | "poor" | "needs_repair"

export type IssueStatus = "issued" | "returned"

export type MaintenanceType = "repair" | "routine" | "inspection" | "upgrade"

export interface Studio {
  id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  studio_id: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  studio_id: string
  name: string
  created_at: string
}

export interface Equipment {
  id: string
  studio_id: string
  name: string
  category_id: string | null
  serial_number: string | null
  quantity: number
  purchase_date: string | null
  purchase_price: number | null
  condition: EquipmentCondition | null
  status: EquipmentStatus
  notes: string | null
  created_at: string
  updated_at: string
  category?: Category
}

export interface EmployeePermissions {
  id: string
  employee_id: string
  studio_id: string
  can_access_dashboard: boolean
  can_access_equipment: boolean
  can_access_issues: boolean
  can_access_employees: boolean
  can_access_reports: boolean
  can_access_analytics: boolean
  created_at: string
  updated_at: string
}

export interface Issue {
  id: string
  studio_id: string
  equipment_id: string
  issued_to: string | null
  person_name: string | null
  person_contact: string | null
  quantity_issued: number
  issued_by: string
  issued_at: string
  expected_return_date: string | null
  actual_return_date: string | null
  return_condition: EquipmentCondition | null
  issue_notes: string | null
  return_notes: string | null
  status: IssueStatus
  created_at: string
  updated_at: string
  equipment?: Equipment
  issued_to_profile?: Profile
  issued_by_profile?: Profile
}

export interface MaintenanceRecord {
  id: string
  studio_id: string
  equipment_id: string
  maintenance_type: MaintenanceType
  description: string
  cost: number | null
  performed_by: string | null
  performed_at: string
  created_by: string
  created_at: string
  equipment?: Equipment
}

export interface AuditLog {
  id: string
  studio_id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  created_at: string
}
