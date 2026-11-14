export type Role = "hr" | "manager" | "employee" | "finance";
export type Status =
  | "بانتظار الموافقة"
  | "معتمد"
  | "مرفوض"
  | "مصروف"
  | "قيد المعالجة"
  | "مكتمل"
  | "نشط"
  | "ينتهي قريبًا"
  | "مسلّمة"
  | "مُعادة"
  | "قيد السداد";
export interface Employee {
  id: string;
  name: string;
  job: string;
  department: string;
  branch: string;
  email: string;
  phone: string;
  joined: string;
  status: string;
  base: number;
  housing: number;
  transport: number;
  deductions: number;
  leaveBase: number;
  rating: number;
  avatar: number;
  manager: string;
  grade: string;
}
export interface HistoryEvent {
  date: string;
  text: string;
}
export interface Leave {
  id: string;
  employeeId: string;
  type: string;
  start: string;
  end: string;
  days: number;
  reason: string;
  status: Status;
  history: HistoryEvent[];
}
export interface Commission {
  id: string;
  employeeId: string;
  deal: string;
  eligible: number;
  rate: number;
  month: string;
  status: Status;
  date: string;
}
export type RecordKind =
  | "contracts"
  | "allowances"
  | "bonuses"
  | "advances"
  | "assets"
  | "evaluations"
  | "promotions"
  | "complaints"
  | "offboarding";
export interface DomainRecord {
  id: string;
  kind: RecordKind;
  employeeId: string;
  title: string;
  status: Status;
  date: string;
  end?: string;
  amount: number;
  description: string;
  meta: Record<string, string | number | boolean>;
  history: HistoryEvent[];
  comments?: { by: string; text: string; date: string }[];
}
export interface Activity {
  id: string;
  text: string;
  date: string;
}
export interface AttendanceEntry {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: "حاضر" | "متأخر" | "غائب" | "في إجازة";
  lateMinutes: number;
  overtime: number;
}
export interface AppState {
  attendance: AttendanceEntry[];
  version: number;
  employees: Employee[];
  leaves: Leave[];
  commissions: Commission[];
  records: DomainRecord[];
  activities: Activity[];
  settings: { company: string; currency: string };
  role: Role;
  currentEmployeeId: string;
  notificationsRead: boolean;
}
export interface Payroll {
  otherAllowances: number;
  base: number;
  housing: number;
  transport: number;
  commission: number;
  bonus: number;
  deductions: number;
  gross: number;
  net: number;
}
