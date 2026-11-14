import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  UsersRound,
  CalendarDays,
  Wallet,
  Clock3,
  FileText,
  Plus,
  ArrowUpLeft,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Search,
  Download,
  Printer,
  Percent,
  Gift,
  HandCoins,
  UserPlus,
  Package,
  TrendingUp,
  Star,
  Sparkles,
  CircleCheck,
  BriefcaseBusiness,
  MapPin,
  Mail,
  Phone,
  Bell,
  ChevronDown,
  ArrowRight,
  BadgeCheck,
  Ellipsis,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import { useStore } from "./store";
import {
  DEPARTMENTS,
  MONTHS,
  dateLabel,
  getAttendanceSummary,
  getLeaveBalance,
  getPayroll,
  money,
} from "./data";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  Field,
  Modal,
  PageHeader,
  Person,
  Progress,
  Stat,
  Tabs,
} from "./components/ui";
import type { Commission, Employee, Leave, Status } from "./types";
const COLORS = [
  "#3776e7",
  "#6ca8ed",
  "#76b9b4",
  "#9fafe3",
  "#c3d3e8",
  "#d3e2ef",
];
const DEMO_TODAY = "2026-11-14";
const MONTH = "2026-11";
const monthName = (v: string) => MONTHS.find((m) => m.value === v)?.label || v;
function useContext() {
  const store = useStore();
  return {
    ...store,
    personal: store.role === "employee",
    base: store.role === "employee" ? "/portal" : "/admin",
    currency: store.state.settings.currency,
  };
}
export function History({
  items,
}: {
  items: { date: string; text: string }[];
}) {
  return (
    <div className="request-history">
      {items.map((h, i) => (
        <div key={i}>
          <strong>{h.text}</strong>
          <small>{dateLabel(h.date)}</small>
        </div>
      ))}
    </div>
  );
}
function exportCSV(rows: (string | number)[][], name: string) {
  const content =
    "\uFEFF" +
    rows
      .map((r) =>
        r.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(","),
      )
      .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name + ".csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function Dashboard() {
  const { state, currency, role, update, notify } = useContext();
  const navigate = useNavigate();
  const [period, setPeriod] = useState("6");
  const [review, setReview] = useState<Leave | null>(null);
  const employees = state.employees;
  const payroll = employees.reduce(
    (sum, e) => sum + getPayroll(state, e.id, MONTH).net,
    0,
  );
  const pending = state.leaves.filter((l) => l.status === "بانتظار الموافقة");
  const currentLeaves = state.leaves.filter(
    (l) => l.status === "معتمد" && l.start <= DEMO_TODAY && l.end >= DEMO_TODAY,
  );
  const present = state.attendance.filter(
    (a) =>
      a.date === DEMO_TODAY &&
      ["حاضر", "متأخر"].includes(a.status) &&
      !currentLeaves.some((l) => l.employeeId === a.employeeId),
  ).length;
  const departments = DEPARTMENTS.map((name, i) => ({
    name,
    value: employees.filter((e) => e.department === name).length,
    color: COLORS[i % COLORS.length],
  }));
  const totalPending =
    pending.length +
    state.records.filter((r) => r.status === "بانتظار الموافقة").length;
  const hiring = Array.from({ length: Number(period) }, (_, i) => {
    const month = `2026-${String(12 - Number(period) + i).padStart(2, "0")}`;
    return {
      name: monthName(month).split(" ")[0],
      joined: employees.filter((e) => e.joined.startsWith(month)).length,
      total: employees.filter((e) => e.joined <= month + "-31").length,
    };
  });
  const expiring = state.records.filter(
    (r) => r.kind === "contracts" && r.status === "ينتهي قريبًا",
  );
  function decide(id: string, status: Status) {
    const request = state.leaves.find((l) => l.id === id);
    if (!request || request.status !== "بانتظار الموافقة") return;
    if (
      status === "معتمد" &&
      request.days > getLeaveBalance(state, request.employeeId)
    ) {
      notify("الرصيد الحالي لا يكفي لاعتماد هذا الطلب");
      return;
    }
    update((s) => ({
      ...s,
      leaves: s.leaves.map((l) =>
        l.id === id
          ? {
              ...l,
              status,
              history: [
                ...l.history,
                {
                  date: DEMO_TODAY,
                  text: `${status === "معتمد" ? "اعتماد" : "رفض"} الطلب من إدارة الموارد البشرية`,
                },
              ],
            }
          : l,
      ),
      activities: [
        {
          id: crypto.randomUUID(),
          text:
            status === "معتمد"
              ? "تم اعتماد طلب إجازة جديد"
              : "تمت مراجعة طلب إجازة",
          date: DEMO_TODAY,
        },
        ...s.activities,
      ],
    }));
    notify(
      status === "معتمد"
        ? "تم اعتماد الإجازة وتحديث رصيد الموظف"
        : "تم رفض طلب الإجازة",
    );
    setReview(null);
  }
  return (
    <>
      <PageHeader
        eyebrow={
          role === "manager"
            ? "مساحة مدير القسم"
            : role === "finance"
              ? "مساحة الإدارة المالية"
              : "نظرة شاملة على فريقك"
        }
        title="صباح الخير، نورة"
        description="كل التفاصيل التي تحتاجينها، ليبدأ فريقك يومًا أفضل."
        actions={
          <>
            <img
              className="welcome-art"
              src="/assets/banner-team.png"
              alt="رسم أصلي لفريق يتعاون على النمو"
            />
            <span className="date-pill">
              <CalendarDays size={15} />
              السبت، 14 نوفمبر 2026
            </span>
            <Link to="/admin/employees?add=1" className="btn primary">
              <Plus size={16} />
              إضافة موظف
            </Link>
          </>
        }
      />
      <div className="stat-grid">
        <Stat
          label="إجمالي الموظفين"
          value={
            <>
              {employees.length}
              <small>موظفًا</small>
            </>
          }
          hint={
            <>
              <span className="up">
                ↗ {employees.filter((e) => e.joined.startsWith(MONTH)).length}{" "}
                موظفين
              </span>{" "}
              انضموا هذا الشهر
            </>
          }
          icon={<UsersRound size={18} />}
        />
        <Stat
          label="الحضور اليوم"
          value={
            <>
              {present}
              <small>/ {employees.length}</small>
            </>
          }
          hint={
            <>
              <span className="up">
                {Math.round((present / employees.length) * 100)}٪
              </span>{" "}
              نسبة حضور الفريق
            </>
          }
          tone="green"
          icon={<Clock3 size={18} />}
        />
        <Stat
          label="إجمالي رواتب الشهر"
          value={
            <>
              {money(payroll).replace(" ر.س", "")}
              <small>{currency}</small>
            </>
          }
          hint="صافي المسير · نوفمبر 2026"
          tone="navy"
          icon={<Wallet size={18} />}
        />
        <Stat
          label="في إجازة حاليًا"
          value={
            <>
              {currentLeaves.length}
              <small>موظفين</small>
            </>
          }
          hint="إجازات معتمدة حتى اليوم"
          tone="purple"
          icon={<CalendarDays size={18} />}
        />
        <Stat
          label="بانتظار المراجعة"
          value={
            <>
              {totalPending}
              <small>طلبات</small>
            </>
          }
          hint="لنمنح فريقك إجابات أسرع"
          tone="amber"
          icon={<FileText size={18} />}
        />
      </div>
      <div className="dashboard-charts">
        <Card
          className="chart-card"
          title="فريق ينمو، وأفق يتّسع"
          action={
            <select
              className="chart-period"
              aria-label="فترة حركة التوظيف"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="6">آخر 6 أشهر</option>
              <option value="3">آخر 3 أشهر</option>
            </select>
          }
        >
          <div className="growth-summary">
            <div>
              <strong>{hiring.reduce((sum, x) => sum + x.joined, 0)}</strong>
              <span>زملاء جدد خلال الفترة</span>
            </div>
            <div className="chart-legend">
              <span>
                <i style={{ background: "#3979eb" }} />
                حجم الفريق
              </span>
              <span>
                <i style={{ background: "#8fc7c2" }} />
                موظفون جدد
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart
              data={hiring}
              margin={{ top: 12, right: 8, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="growth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4d8bea" stopOpacity={0.19} />
                  <stop offset="100%" stopColor="#4d8bea" stopOpacity={0.015} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="#edf1f7"
                strokeDasharray="3 4"
              />
              <XAxis dataKey="name" axisLine={false} tickLine={false} dy={9} />
              <YAxis axisLine={false} tickLine={false} tickCount={4} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e6edf7" }}
              />
              <Area
                isAnimationActive={false}
                type="monotone"
                dataKey="total"
                name="حجم الفريق"
                stroke="#427fed"
                strokeWidth={2.5}
                fill="url(#growth)"
              />
              <Area
                isAnimationActive={false}
                type="monotone"
                dataKey="joined"
                name="موظفون جدد"
                stroke="#84bcb5"
                strokeWidth={1.8}
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card
          title="توزيع الموظفين"
          action={<span className="pill">{DEPARTMENTS.length} إدارات</span>}
        >
          <p className="card-subtitle">خبرات متنوعة، فريق واحد</p>
          <div className="donut-section">
            <div className="donut-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    isAnimationActive={false}
                    data={departments}
                    innerRadius="72%"
                    outerRadius="93%"
                    paddingAngle={4}
                    cornerRadius={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {departments.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-value">
                <strong>{employees.length}</strong>
                <small>إجمالي الموظفين</small>
              </div>
            </div>
            <div className="dept-list">
              {departments.map((d) => (
                <div key={d.name}>
                  <i style={{ background: d.color }} />
                  <span>{d.name}</span>
                  <b>{d.value}</b>
                  <span>{Math.round((d.value / employees.length) * 100)}٪</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      <div className="dashboard-middle">
        <Card
          title="بانتظار قرارك"
          action={
            <Link className="link" to="/admin/leaves">
              كل الطلبات <ArrowUpLeft size={14} />
            </Link>
          }
        >
          <p className="card-subtitle">قرارات صغيرة تصنع فرقًا في يوم فريقك</p>
          {pending.slice(0, 3).map((l) => {
            const e = employees.find((e) => e.id === l.employeeId)!;
            return (
              <div className="approval-row" key={l.id}>
                <Avatar employee={e} size={33} />
                <div className="approval-info">
                  <strong>
                    {e.name} <span className="muted">· {l.type}</span>
                  </strong>
                  <small>
                    {l.days} أيام · {dateLabel(l.start)} — {dateLabel(l.end)}
                  </small>
                </div>
                <div className="approval-actions">
                  <button
                    className="btn success small"
                    onClick={() => decide(l.id, "معتمد")}
                  >
                    <Check size={12} />
                    قبول
                  </button>
                  <button
                    className="btn secondary small"
                    onClick={() => setReview(l)}
                  >
                    مراجعة
                  </button>
                </div>
              </div>
            );
          })}
          {!pending.length && (
            <div className="notice success">
              <CircleCheck size={20} />
              رائع! تمت مراجعة جميع طلبات الإجازة.
            </div>
          )}
        </Card>
        <Card
          title="خطوتك التالية، أقرب"
          action={<Sparkles size={17} color="#9bafcd" />}
        >
          <div className="quick-action-grid">
            {[
              { label: "إضافة موظف", path: "employees?add=1", icon: UserPlus },
              { label: "مسير الرواتب", path: "payroll", icon: Wallet },
              { label: "مراجعة الإجازات", path: "leaves", icon: CalendarDays },
              { label: "عقود الموظفين", path: "contracts", icon: FileText },
              { label: "دورة التقييم", path: "evaluations", icon: Star },
              { label: "عمولات المبيعات", path: "commissions", icon: Percent },
            ].map((a) => (
              <Link
                className="quick-action"
                key={a.path}
                to={"/admin/" + a.path}
              >
                <div>
                  <a.icon size={18} />
                </div>
                <span>{a.label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
      <div className="dashboard-bottom">
        <Card
          className="flush-table"
          title="أحدث المنضمّين إلى الأفق"
          action={
            <Link className="link" to="/admin/employees">
              دليل الموظفين <ArrowUpLeft size={14} />
            </Link>
          }
        >
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>الموظف</th>
                  <th>الإدارة</th>
                  <th>تاريخ الانضمام</th>
                  <th>الحالة</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {[...employees]
                  .sort((a, b) => b.joined.localeCompare(a.joined))
                  .slice(0, 4)
                  .map((e) => (
                    <tr
                      className="clickable"
                      onClick={() => navigate("/admin/employees/" + e.id)}
                      key={e.id}
                    >
                      <td>
                        <Person employee={e} />
                      </td>
                      <td className="muted" style={{ fontSize: 10 }}>
                        {e.department}
                      </td>
                      <td className="muted" style={{ fontSize: 10 }}>
                        {dateLabel(e.joined)}
                      </td>
                      <td>
                        <Badge>{e.status}</Badge>
                      </td>
                      <td>
                        <Link
                          aria-label={`ملف ${e.name}`}
                          to={"/admin/employees/" + e.id}
                        >
                          <ArrowUpLeft size={15} color="#93a8c5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card
          title="نبض مساحة العمل"
          action={<Clock3 size={16} color="#98abc5" />}
        >
          {state.activities.slice(0, 3).map((a, i) => (
            <div className="activity-row" key={a.id}>
              <div className="activity-dot">
                {i === 0 ? (
                  <Check size={13} />
                ) : i === 1 ? (
                  <UserPlus size={13} />
                ) : (
                  <FileText size={13} />
                )}
              </div>
              <div>
                <strong>{a.text}</strong>
                <small>{dateLabel(a.date)}</small>
              </div>
            </div>
          ))}
          <div className="contract-alert">
            <FileText size={21} />
            <div>
              <strong>{expiring.length} عقود تحتاج انتباهك</strong>
              <small>تستحق التجديد خلال الفترة المقبلة</small>
            </div>
            <Link to="/admin/contracts" aria-label="مراجعة العقود">
              <ArrowUpLeft size={16} color="#bfa069" />
            </Link>
          </div>
        </Card>
      </div>
      {review && (
        <Modal title="مراجعة طلب الإجازة" onClose={() => setReview(null)}>
          <LeaveDetails leave={review} />
          <div className="form-actions">
            <button
              className="btn danger"
              onClick={() => decide(review.id, "مرفوض")}
            >
              رفض الطلب
            </button>
            <button
              className="btn primary"
              onClick={() => decide(review.id, "معتمد")}
            >
              <Check size={16} />
              اعتماد الإجازة
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export function Portal() {
  const { state, employee: e, currency, base } = useContext();
  const salary = getPayroll(state, e.id, MONTH),
    balance = getLeaveBalance(state, e.id),
    attendance = getAttendanceSummary(state, e.id);
  const ownLeaves = state.leaves
    .filter((l) => l.employeeId === e.id)
    .sort((a, b) =>
      (b.history.at(-1)?.date || b.start).localeCompare(
        a.history.at(-1)?.date || a.start,
      ),
    );
  const evaluation = state.records
    .filter(
      (r) =>
        r.kind === "evaluations" &&
        r.employeeId === e.id &&
        ["مكتمل", "معتمد"].includes(r.status),
    )
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const rating = Number(evaluation?.meta["التقييم"] ?? e.rating);
  const goal = Number(evaluation?.meta["إنجاز الأهداف"] ?? 0);
  const serviceMonths = Math.max(
    0,
    (2026 - Number(e.joined.slice(0, 4))) * 12 +
      11 -
      Number(e.joined.slice(5, 7)),
  );
  const ownCommissions = state.commissions.filter(
    (c) => c.employeeId === e.id && c.month === MONTH,
  );
  return (
    <>
      <div className="portal-hero">
        <Avatar employee={e} size={91} />
        <div className="portal-hero-copy">
          <span className="eyebrow">مساحتك الشخصية، ليوم عمل أفضل</span>
          <h1>مرحبًا، {e.name}</h1>
          <p>
            {e.job}
            <span>·</span>
            {e.department}
            <span>·</span>
            <span className="ltr">{e.id}</span>
          </p>
          <Badge>{e.status}</Badge>
        </div>
        <img
          className="hero-art"
          src="/assets/hero-success.png"
          alt="رسم أصلي يرمز للنمو والإنجاز"
        />
        <span className="hero-date">السبت، 14 نوفمبر 2026</span>
      </div>
      <div className="stat-grid">
        <Stat
          label="صافي راتب هذا الشهر"
          value={
            <>
              {money(salary.net).replace(" ر.س", "")}
              <small>{currency}</small>
            </>
          }
          hint="جميع المكونات محسوبة أدناه"
          icon={<Wallet size={18} />}
        />
        <Stat
          label="رصيد إجازاتك"
          value={
            <>
              {balance}
              <small>يومًا متاحًا</small>
            </>
          }
          hint="استراحة تستحقها، وخطط تنتظرك"
          tone="green"
          icon={<CalendarDays size={18} />}
        />
        <Stat
          label="الالتزام بالحضور"
          value={
            <>
              {attendance.commitment}
              <small>٪</small>
            </>
          }
          hint={`${attendance.attended - attendance.late} يوم التزام من ${attendance.days} يوم عمل`}
          tone="navy"
          icon={<Clock3 size={18} />}
        />
        <Stat
          label="آخر تقييم للأداء"
          value={
            <>
              {rating}
              <small>/ 5</small>
            </>
          }
          hint="أداء مميز، ونجاح مستمر"
          tone="amber"
          icon={<Star size={18} />}
        />
        <Stat
          label="رحلتك معنا"
          value={
            <>
              {Math.floor(serviceMonths / 12)}
              <small>سنوات و{serviceMonths % 12} أشهر</small>
            </>
          }
          hint={`انضممت في ${dateLabel(e.joined)}`}
          tone="purple"
          icon={<BriefcaseBusiness size={18} />}
        />
      </div>
      <div className="portal-main-grid">
        <Card
          title="راتبك، بكل تفاصيله"
          action={<span className="pill">نوفمبر 2026</span>}
        >
          <div className="salary-bars">
            {[
              { label: "الراتب الأساسي", value: salary.base, color: "#427feb" },
              {
                label: "بدلات السكن والنقل",
                value:
                  salary.housing + salary.transport + salary.otherAllowances,
                color: "#7ca8ea",
              },
              {
                label: "عمولات المبيعات",
                value: salary.commission,
                color: "#78b9ae",
              },
              { label: "المكافآت", value: salary.bonus, color: "#b1a0d3" },
            ].map((x) => (
              <div className="salary-bar-item" key={x.label}>
                <div className="label">
                  <span>{x.label}</span>
                  <b>{money(x.value, currency)}</b>
                </div>
                <div className="bar">
                  <i
                    style={{
                      width: `${Math.max(3, (x.value / salary.gross) * 100)}%`,
                      background: x.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="salary-total">
            <span>الصافي بعد الاستقطاعات</span>
            <strong>
              {money(salary.net).replace(" ر.س", "")} <small>{currency}</small>
            </strong>
          </div>
          <Link to={base + "/payroll"} className="btn secondary full">
            عرض كشف راتبي <ArrowUpLeft size={15} />
          </Link>
        </Card>
        <Card
          title="مساحة للراحة"
          action={<CalendarDays size={17} color="#9aabc0" />}
        >
          <p className="card-subtitle">رصيد إجازاتك السنوية</p>
          <LeaveDonut balance={balance} total={e.leaveBase} />
          <div className="leave-meta">
            <div>
              <span>الرصيد السنوي</span>
              <strong>{e.leaveBase} يومًا</strong>
            </div>
            <div>
              <span>المستخدم</span>
              <strong>{e.leaveBase - balance} أيام</strong>
            </div>
            <div>
              <span>المتاح</span>
              <strong style={{ color: "#3c82d5" }}>{balance} يومًا</strong>
            </div>
          </div>
          <Link className="btn primary full" to={base + "/leaves?new=1"}>
            <Plus size={15} />
            طلب إجازة جديدة
          </Link>
        </Card>
        <Card
          title="حضورك في آخر 30 يومًا"
          action={<Clock3 size={17} color="#9aabc0" />}
        >
          <p className="card-subtitle">الانتظام بداية كل إنجاز</p>
          <div className="attendance-summary">
            <strong className="attendance-number">
              {attendance.commitment}
              <small>٪</small>
            </strong>
            <div>
              نسبة الالتزام<Badge>أداء منتظم</Badge>
            </div>
          </div>
          <WeekDays employeeId={e.id} />
          <div className="leave-meta">
            <div>
              <span>أيام الحضور</span>
              <strong>{attendance.attended} يومًا</strong>
            </div>
            <div>
              <span>التأخير</span>
              <strong>{attendance.late} يوم</strong>
            </div>
            <div>
              <span>الغياب</span>
              <strong>{attendance.absent} أيام</strong>
            </div>
          </div>
          <Link className="btn secondary full" to={base + "/attendance"}>
            سجل الحضور <ArrowUpLeft size={15} />
          </Link>
        </Card>
      </div>
      <div className="portal-bottom-grid">
        <Card
          title="احتياجاتك، بخطوة واحدة"
          action={<Sparkles size={17} color="#9aabc0" />}
        >
          <div className="quick-action-grid">
            {[
              { label: "طلب إجازة", path: "leaves?new=1", icon: CalendarDays },
              { label: "طلب سلفة", path: "advances?new=1", icon: HandCoins },
              { label: "كشف الراتب", path: "payroll", icon: Wallet },
              { label: "عقدي الوظيفي", path: "contracts", icon: FileText },
              { label: "عهدي المسلّمة", path: "assets", icon: Package },
              { label: "تقديم شكوى", path: "complaints?new=1", icon: Send },
            ].map((a) => (
              <Link
                className="quick-action"
                to={base + "/" + a.path}
                key={a.path}
              >
                <div>
                  <a.icon size={18} />
                </div>
                <span>{a.label}</span>
              </Link>
            ))}
          </div>
        </Card>
        <Card
          title="آخر مستجداتك"
          action={
            <Link className="link" to={base + "/leaves"}>
              كل الطلبات <ArrowUpLeft size={13} />
            </Link>
          }
        >
          {ownLeaves.slice(0, 2).map((l) => (
            <Link className="personal-service" to={base + "/leaves"} key={l.id}>
              <div className="service-icon">
                <CalendarDays size={17} />
              </div>
              <div>
                <strong>
                  {l.type} · {l.days} أيام
                </strong>
                <small>
                  {dateLabel(l.start)} <Badge>{l.status}</Badge>
                </small>
              </div>
              <ChevronLeft size={15} />
            </Link>
          ))}
          <Link className="personal-service" to={base + "/commissions"}>
            <div className="service-icon">
              <Percent size={17} />
            </div>
            <div>
              <strong>عمولاتك لهذا الشهر</strong>
              <small>
                {ownCommissions.length} عمليات ·{" "}
                {money(salary.commission, currency)}
              </small>
            </div>
            <ChevronLeft size={15} />
          </Link>
          <Link className="personal-service" to={base + "/contracts"}>
            <div className="service-icon">
              <FileText size={17} />
            </div>
            <div>
              <strong>عقدك الوظيفي متاح</strong>
              <small>اطّلع على التفاصيل والمرفقات</small>
            </div>
            <ChevronLeft size={15} />
          </Link>
        </Card>
        <Card title="تطوّر تفخر به" action={<Star size={17} color="#9aabc0" />}>
          <div className="rating-panel">
            <strong>{rating}</strong>
            <div>
              <div className="stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={15}
                    fill={i < Math.round(rating) ? "#e3b765" : "none"}
                  />
                ))}
              </div>
              <small>آخر دورة تقييم · الربع الثالث</small>
            </div>
          </div>
          <div className="performance-goal">
            <div>
              <span>إنجاز الأهداف الفصلية</span>
              <strong>{goal}٪</strong>
            </div>
            <Progress value={goal} />
          </div>
          <p className="muted" style={{ fontSize: 10, margin: "15px 0" }}>
            كل خطوة تضيف إلى رحلتك المهنية معنا.
          </p>
          <Link className="link" to={base + "/evaluations"}>
            تفاصيل تقييمي وأهدافي <ArrowUpLeft size={14} />
          </Link>
        </Card>
      </div>
    </>
  );
}
export function LeaveDonut({
  balance,
  total,
}: {
  balance: number;
  total: number;
}) {
  return (
    <div className="leave-donut">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            isAnimationActive={false}
            data={[
              { name: "متاح", value: Math.max(0, balance) },
              { name: "مستخدم", value: Math.max(0, total - balance) },
            ]}
            dataKey="value"
            innerRadius="79%"
            outerRadius="96%"
            startAngle={90}
            endAngle={-270}
            stroke="none"
            cornerRadius={6}
          >
            <Cell fill="#4f88e5" />
            <Cell fill="#edf2f9" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-value">
        <strong>
          {balance}
          <small>يومًا</small>
        </strong>
        <small>رصيدك المتاح</small>
      </div>
    </div>
  );
}
export function WeekDays({ employeeId }: { employeeId?: string }) {
  const { state, employee } = useStore();
  const logs = getAttendanceSummary(
    state,
    employeeId || employee.id,
  ).logs.slice(-5);
  return (
    <div className="week-days">
      {logs.map((log) => (
        <div
          className="week-day"
          key={log.id}
          title={`${dateLabel(log.date)} — ${log.status} ${log.checkIn}`}
        >
          <small>
            {new Intl.DateTimeFormat("ar", {
              weekday: "long",
              timeZone: "UTC",
            }).format(new Date(log.date))}
          </small>
          <span
            style={
              log.status === "متأخر"
                ? { background: "#fff5e5", color: "#d1a456" }
                : { background: "#eef7f3", color: "#52a188" }
            }
          >
            {log.status === "متأخر" ? (
              <Clock3 size={13} />
            ) : (
              <Check size={14} />
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Employees() {
  const { state, update, notify } = useContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState(""),
    [dept, setDept] = useState("all"),
    [status, setStatus] = useState("all"),
    [branch, setBranch] = useState("all"),
    [page, setPage] = useState(1),
    [add, setAdd] = useState(new URLSearchParams(location.search).has("add"));
  const filtered = state.employees.filter(
    (e) =>
      `${e.name} ${e.id} ${e.job}`.includes(search) &&
      (dept === "all" || e.department === dept) &&
      (status === "all" || e.status === status) &&
      (branch === "all" || e.branch === branch),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  function submit(form: FormData) {
    const name = String(form.get("name")).trim();
    if (!name) return;
    const seq =
      Math.max(...state.employees.map((e) => Number(e.id.replace(/\D/g, "")))) +
      1;
    const employee: Employee = {
      id: `EMP-${seq}`,
      name,
      job: String(form.get("job")),
      department: String(form.get("department")),
      branch: String(form.get("branch")),
      email: String(form.get("email")),
      phone: String(form.get("phone")),
      joined: String(form.get("joined")),
      status: "على رأس العمل",
      base: Number(form.get("base")),
      housing: 1500,
      transport: 1000,
      deductions: 0,
      leaveBase: 30,
      rating: 4.5,
      avatar: seq % 12,
      manager: "نورة عبدالرحمن",
      grade: "الدرجة السادسة",
    };
    update((s) => ({
      ...s,
      employees: [...s.employees, employee],
      activities: [
        {
          id: crypto.randomUUID(),
          text: `انضم ${employee.name} إلى فريق ${employee.department}`,
          date: DEMO_TODAY,
        },
        ...s.activities,
      ],
    }));
    setAdd(false);
    setSearch(name);
    setPage(1);
    notify("تمت إضافة الموظف وحفظ بياناته محليًا");
  }
  return (
    <>
      <PageHeader
        eyebrow="إدارة الفريق"
        title="كل الخبرات، في مكان واحد"
        description={`${state.employees.length} زميلًا وزميلة يصنعون أفقنا كل يوم.`}
        actions={
          <>
            <button
              className="btn secondary hide-mobile"
              onClick={() => {
                exportCSV(
                  [
                    [
                      "الرقم الوظيفي",
                      "الاسم",
                      "المسمى",
                      "الإدارة",
                      "الفرع",
                      "الحالة",
                    ],
                    ...filtered.map((e) => [
                      e.id,
                      e.name,
                      e.job,
                      e.department,
                      e.branch,
                      e.status,
                    ]),
                  ],
                  "دليل-الموظفين",
                );
                notify("تم تصدير دليل الموظفين");
              }}
            >
              <Download size={15} />
              تصدير
            </button>
            <button className="btn primary" onClick={() => setAdd(true)}>
              <Plus size={16} />
              إضافة موظف
            </button>
          </>
        }
      />
      <div className="filters">
        <div className="search-field">
          <Search size={16} />
          <input
            aria-label="البحث عن موظف"
            placeholder="ابحث بالاسم أو الرقم الوظيفي…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          aria-label="تصفية الإدارة"
          value={dept}
          onChange={(e) => {
            setDept(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">جميع الإدارات</option>
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select
          aria-label="تصفية حالة الموظف"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">جميع الحالات</option>
          <option>على رأس العمل</option>
          <option>في إجازة</option>
        </select>
        <select
          aria-label="تصفية الفرع"
          value={branch}
          onChange={(e) => {
            setBranch(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">جميع الفروع</option>
          {Array.from(new Set(state.employees.map((e) => e.branch))).map(
            (b) => (
              <option key={b}>{b}</option>
            ),
          )}
        </select>
        <span className="filter-end muted" style={{ fontSize: 10 }}>
          {filtered.length} نتيجة
        </span>
      </div>
      <Card className="flush-table">
        {filtered.length ? (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>الموظف</th>
                    <th>الرقم الوظيفي</th>
                    <th>الإدارة</th>
                    <th>الفرع</th>
                    <th>تاريخ الانضمام</th>
                    <th>الحالة</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .slice(
                      (Math.min(page, pages) - 1) * 8,
                      Math.min(page, pages) * 8,
                    )
                    .map((e) => (
                      <tr
                        className="clickable"
                        key={e.id}
                        onClick={() => navigate("/admin/employees/" + e.id)}
                      >
                        <td>
                          <Person employee={e} />
                        </td>
                        <td>
                          <span className="ltr muted" style={{ fontSize: 10 }}>
                            {e.id}
                          </span>
                        </td>
                        <td>{e.department}</td>
                        <td className="muted" style={{ fontSize: 10 }}>
                          {e.branch}
                        </td>
                        <td className="muted" style={{ fontSize: 10 }}>
                          {dateLabel(e.joined)}
                        </td>
                        <td>
                          <Badge>{e.status}</Badge>
                        </td>
                        <td>
                          <Link
                            className="icon-btn"
                            aria-label={`عرض ملف ${e.name}`}
                            to={"/admin/employees/" + e.id}
                          >
                            <ArrowUpLeft size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>
                عرض {Math.min((page - 1) * 8 + 1, filtered.length)}–
                {Math.min(page * 8, filtered.length)} من {filtered.length}{" "}
                موظفًا
              </span>
              <div className="pagination">
                <button
                  aria-label="الصفحة السابقة"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronRight size={13} />
                </button>
                {Array.from({ length: pages }, (_, i) => (
                  <button
                    className={page === i + 1 ? "active" : ""}
                    key={i}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  aria-label="الصفحة التالية"
                  disabled={page === pages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronLeft size={13} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="لم نعثر على موظف مطابق"
            action={
              <button
                className="btn secondary"
                onClick={() => {
                  setSearch("");
                  setDept("all");
                  setStatus("all");
                  setBranch("all");
                }}
              >
                مسح التصفيات
              </button>
            }
          />
        )}
      </Card>
      {add && (
        <Modal
          title="زميل جديد، بداية جديدة"
          onClose={() => setAdd(false)}
          wide
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(new FormData(e.currentTarget));
            }}
          >
            <div className="notice" style={{ marginBottom: 22 }}>
              <UserPlus size={20} />
              أضف موظفًا افتراضيًا. ستظهر بياناته مباشرة في الدليل ومؤشرات
              الفريق.
            </div>
            <div className="form-grid">
              <Field label="الاسم الكامل">
                <input
                  name="name"
                  required
                  placeholder="مثال: فيصل أحمد السالم"
                  minLength={3}
                />
              </Field>
              <Field label="المسمى الوظيفي">
                <input name="job" required placeholder="أخصائي مبيعات" />
              </Field>
              <Field label="الإدارة">
                <select name="department">
                  {DEPARTMENTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </Field>
              <Field label="الفرع">
                <select name="branch">
                  <option>الرياض — المقر الرئيسي</option>
                  <option>جدة</option>
                  <option>الدمام</option>
                </select>
              </Field>
              <Field label="البريد الإلكتروني">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@ofuq.example"
                  dir="ltr"
                />
              </Field>
              <Field label="رقم الجوال">
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+966 5X XXX XXXX"
                  dir="ltr"
                />
              </Field>
              <Field label="تاريخ الانضمام">
                <input
                  type="date"
                  name="joined"
                  required
                  defaultValue={DEMO_TODAY}
                />
              </Field>
              <Field label="الراتب الأساسي (تجريبي)">
                <input
                  type="number"
                  name="base"
                  required
                  min={1000}
                  max={100000}
                  defaultValue={10000}
                />
              </Field>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={() => setAdd(false)}
              >
                إلغاء
              </button>
              <button type="submit" className="btn primary">
                <Plus size={16} />
                إضافة الموظف
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
export function EmployeeProfile({ id }: { id?: string }) {
  const params = useParams();
  const { state, employee, personal, base, currency, notify } = useContext();
  const found = state.employees.find((e) => e.id === (id || params.id));
  const e = found || employee;
  const [tab, setTab] = useState("البيانات الأساسية");
  const [document, setDocument] = useState(false);
  const contract = state.records.find(
    (r) => r.kind === "contracts" && r.employeeId === e.id,
  );
  if ((id || params.id) && !found)
    return (
      <EmptyState
        title="لم نعثر على هذا الموظف"
        description="قد يكون رابط الملف غير صحيح. يمكنك متابعة البحث في دليل الموظفين."
        action={
          <Link className="btn primary" to={base + "/employees"}>
            العودة إلى الدليل
          </Link>
        }
      />
    );
  return (
    <>
      <PageHeader
        eyebrow={personal ? "مساحتي الشخصية" : "دليل الموظفين"}
        title={personal ? "ملفي الشخصي" : "ملف الموظف"}
        description="تفاصيل واضحة لكل خطوة في الرحلة الوظيفية."
        actions={
          !personal ? (
            <Link className="btn secondary" to="/admin/employees">
              <ArrowRight size={15} />
              العودة للدليل
            </Link>
          ) : undefined
        }
      />
      <Card className="employee-summary">
        <Avatar employee={e} size={80} />
        <div>
          <h2>{e.name}</h2>
          <p>
            {e.job} · {e.department}
          </p>
          <div className="profile-meta">
            <span className="ltr">{e.id}</span>
            <span>
              <MapPin
                size={12}
                style={{ display: "inline", verticalAlign: "middle" }}
              />{" "}
              {e.branch}
            </span>
          </div>
        </div>
        <div className="profile-status">
          <Badge>{e.status}</Badge>
          <small>زميلنا منذ {dateLabel(e.joined)}</small>
        </div>
      </Card>
      <Card>
        <Tabs
          items={[
            "البيانات الأساسية",
            "البيانات الوظيفية",
            "التواصل",
            "المستندات",
            "التاريخ الوظيفي",
          ]}
          value={tab}
          onChange={setTab}
        />
        {tab === "البيانات الأساسية" && (
          <>
            <div className="profile-details">
              {[
                ["الاسم الكامل", e.name],
                ["الرقم الوظيفي", e.id],
                ["الفرع", e.branch],
                ["حالة التوظيف", e.status],
                ["تاريخ الانضمام", dateLabel(e.joined)],
                ["مدة الخدمة", `${2026 - Number(e.joined.slice(0, 4))} سنوات`],
                ["البريد الوظيفي", e.email],
                ["الهاتف", e.phone],
                ["المدير المباشر", e.manager],
              ].map(([l, v]) => (
                <div key={l}>
                  <small>{l}</small>
                  <strong
                    className={
                      ["الرقم الوظيفي", "البريد الوظيفي", "الهاتف"].includes(l)
                        ? "ltr"
                        : ""
                    }
                  >
                    {v}
                  </strong>
                </div>
              ))}
            </div>
            <div className="notice">
              <BadgeCheck size={19} />
              بيانات افتراضية مخصصة للعرض، ويمكن مراجعة العقد والحضور من الأقسام
              المرتبطة.
            </div>
          </>
        )}
        {tab === "البيانات الوظيفية" && (
          <>
            <div className="profile-details">
              {[
                ["المسمى الوظيفي", e.job],
                ["الإدارة", e.department],
                ["الدرجة الوظيفية", e.grade],
                ["المدير المباشر", e.manager],
                ["الراتب الأساسي", money(e.base, currency)],
                ["التقييم الأخير", `${e.rating} / 5`],
              ].map(([l, v]) => (
                <div key={l}>
                  <small>{l}</small>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
            <div className="grid-2">
              <Link
                className="document-tile"
                to={
                  base + "/contracts" + (!personal ? "?employee=" + e.id : "")
                }
              >
                <FileText size={27} />
                <div>
                  <strong>العقد الوظيفي</strong>
                  <small>{contract?.id || "لم يرفق عقد بعد"}</small>
                </div>
                <ArrowUpLeft size={17} />
              </Link>
              <Link
                className="document-tile"
                to={
                  base + "/attendance" + (!personal ? "?employee=" + e.id : "")
                }
              >
                <Clock3 size={27} />
                <div>
                  <strong>سجل الحضور</strong>
                  <small>الحضور والانصراف وتفاصيل الأيام</small>
                </div>
                <ArrowUpLeft size={17} />
              </Link>
            </div>
          </>
        )}
        {tab === "التواصل" && (
          <div className="detail-grid">
            <div>
              <small>البريد الإلكتروني</small>
              <strong className="ltr">{e.email}</strong>
            </div>
            <div>
              <small>رقم الجوال</small>
              <strong className="ltr">{e.phone}</strong>
            </div>
            <div>
              <small>مقر العمل</small>
              <strong>{e.branch}</strong>
            </div>
            <div>
              <small>المدير المسؤول</small>
              <strong>{e.manager}</strong>
            </div>
          </div>
        )}
        {tab === "المستندات" && (
          <div className="stack">
            {[
              "العقد الوظيفي",
              "خطاب التعريف بالراتب",
              "إقرار استلام العهد",
            ].map((d, i) => (
              <div className="document-tile" key={d}>
                <FileText size={30} />
                <div>
                  <strong>{d}</strong>
                  <small>مستند توضيحي · بيانات افتراضية</small>
                </div>
                <button
                  className="btn secondary small"
                  onClick={() => {
                    setDocument(true);
                    notify("معاينة مستند تجريبي");
                  }}
                >
                  معاينة
                </button>
              </div>
            ))}
          </div>
        )}
        {tab === "التاريخ الوظيفي" && (
          <History
            items={[
              {
                date: e.joined,
                text: `الانضمام إلى ${state.settings.company}`,
              },
              {
                date: "2025-01-15",
                text: `تحديث الملف الوظيفي — ${e.department}`,
              },
              {
                date: "2026-09-30",
                text: `اكتمال تقييم الأداء بنتيجة ${e.rating} من 5`,
              },
            ].sort((a, b) => a.date.localeCompare(b.date))}
          />
        )}
      </Card>
      {document && (
        <Modal title="معاينة المستند" onClose={() => setDocument(false)}>
          <div className="payslip-banner">
            <div>
              <small>نموذج مستند داخلي</small>
              <h3>{state.settings.company}</h3>
            </div>
            <FileText size={35} />
          </div>
          <h3>إلى من يهمه الأمر</h3>
          <p className="muted" style={{ marginTop: 15, lineHeight: 2.2 }}>
            تشهد الشركة في هذا النموذج الافتراضي بأن الزميل {e.name} يعمل بمسمى{" "}
            {e.job} ضمن إدارة {e.department} منذ {dateLabel(e.joined)}.
          </p>
          <div className="notice warning" style={{ marginTop: 25 }}>
            مستند للمعاينة فقط؛ لا يُستخدم كشهادة أو عقد رسمي.
          </div>
          <div className="form-actions">
            <button
              className="btn secondary"
              onClick={() => setDocument(false)}
            >
              إغلاق المعاينة
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

function LeaveDetails({ leave: l }: { leave: Leave }) {
  const { state } = useStore();
  const e = state.employees.find((e) => e.id === l.employeeId)!;
  return (
    <div className="stack">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Person employee={e} />
        <Badge>{l.status}</Badge>
      </div>
      <div className="detail-grid">
        <div>
          <small>نوع الإجازة</small>
          <strong>{l.type}</strong>
        </div>
        <div>
          <small>مدة الإجازة</small>
          <strong>{l.days} أيام</strong>
        </div>
        <div>
          <small>تاريخ البداية</small>
          <strong>{dateLabel(l.start)}</strong>
        </div>
        <div>
          <small>تاريخ العودة</small>
          <strong>{dateLabel(l.end)}</strong>
        </div>
      </div>
      <div>
        <small className="muted">سبب الطلب</small>
        <p style={{ fontSize: 12, marginTop: 7 }}>{l.reason}</p>
      </div>
      <div>
        <h3>تاريخ الطلب</h3>
        <History items={l.history} />
      </div>
    </div>
  );
}
export function Leaves() {
  const { state, employee, personal, currency, update, notify } = useContext();
  const [create, setCreate] = useState(
      new URLSearchParams(location.search).has("new"),
    ),
    [selected, setSelected] = useState<string | null>(null),
    [filter, setFilter] = useState("all"),
    [query, setQuery] = useState(""),
    [start, setStart] = useState("2026-11-22"),
    [end, setEnd] = useState("2026-11-24"),
    [error, setError] = useState(""),
    [forEmployee, setForEmployee] = useState(employee.id);
  const own = personal
    ? state.leaves.filter((l) => l.employeeId === employee.id)
    : state.leaves;
  const rows = own.filter(
    (l) =>
      (filter === "all" || l.status === filter) &&
      (state.employees
        .find((e) => e.id === l.employeeId)
        ?.name.includes(query) ||
        l.id.includes(query)),
  );
  const selectedLeave = state.leaves.find((l) => l.id === selected);
  const balance = getLeaveBalance(state, employee.id);
  const days = Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1;
  const pending = own.filter((l) => l.status === "بانتظار الموافقة").length;
  const requestingId = personal ? employee.id : forEmployee;
  const newBalance = getLeaveBalance(state, requestingId);
  function submit(form: FormData) {
    if (!Number.isFinite(days) || days <= 0) {
      setError("اختر تاريخ نهاية بعد تاريخ البداية.");
      return;
    }
    if (days > newBalance) {
      setError("مدة الطلب تتجاوز الرصيد المتاح لهذا الموظف.");
      return;
    }
    if (
      state.leaves.some(
        (l) =>
          l.employeeId === requestingId &&
          l.status !== "مرفوض" &&
          l.start <= end &&
          l.end >= start,
      )
    ) {
      setError("يتداخل هذا الطلب مع إجازة قائمة. اختر تواريخ أخرى.");
      return;
    }
    const l: Leave = {
      id: `LV-${Date.now().toString().slice(-6)}`,
      employeeId: requestingId,
      type: String(form.get("type")),
      start,
      end,
      days,
      reason: String(form.get("reason")).trim(),
      status: "بانتظار الموافقة",
      history: [
        { date: DEMO_TODAY, text: "تم تقديم الطلب — بانتظار موافقة المدير" },
      ],
    };
    update((s) => ({
      ...s,
      leaves: [l, ...s.leaves],
      activities: [
        {
          id: crypto.randomUUID(),
          text: `طلب إجازة جديد من ${s.employees.find((e) => e.id === requestingId)?.name}`,
          date: DEMO_TODAY,
        },
        ...s.activities,
      ],
      notificationsRead: false,
    }));
    setCreate(false);
    setError("");
    notify("تم إرسال الطلب إلى المدير للمراجعة");
  }
  function decide(l: Leave, status: Status) {
    if (l.status !== "بانتظار الموافقة") return;
    if (status === "معتمد" && l.days > getLeaveBalance(state, l.employeeId)) {
      notify("الرصيد الحالي لا يكفي لاعتماد هذا الطلب");
      return;
    }
    update((s) => ({
      ...s,
      leaves: s.leaves.map((x) =>
        x.id === l.id && x.status === "بانتظار الموافقة"
          ? {
              ...x,
              status,
              history: [
                ...x.history,
                {
                  date: DEMO_TODAY,
                  text:
                    status === "معتمد"
                      ? "تم اعتماد الطلب وتحديث رصيد الإجازات"
                      : "تم رفض الطلب بعد المراجعة",
                },
              ],
            }
          : x,
      ),
      activities: [
        {
          id: crypto.randomUUID(),
          text: `${status === "معتمد" ? "اعتماد" : "رفض"} طلب إجازة ${s.employees.find((e) => e.id === l.employeeId)?.name}`,
          date: DEMO_TODAY,
        },
        ...s.activities,
      ],
      notificationsRead: false,
    }));
    notify(
      status === "معتمد"
        ? "تم اعتماد الطلب وخصم الأيام من الرصيد"
        : "تم رفض الطلب؛ لم يتغيّر الرصيد",
    );
  }
  return (
    <>
      <PageHeader
        eyebrow={personal ? "مساحة للراحة" : "شؤون الموظفين"}
        title={personal ? "إجازاتي، وخططي القادمة" : "الإجازات"}
        description={
          personal
            ? "خطّط لاستراحتك، وتابع طلباتك بكل وضوح."
            : "خطّط لاستمرارية العمل، وامنح فريقك مساحة للراحة."
        }
        actions={
          <button
            className="btn primary"
            onClick={() => {
              setCreate(true);
              setError("");
            }}
          >
            <Plus size={16} />
            طلب إجازة
          </button>
        }
      />
      {!personal && (
        <div className="finance-overview">
          <Stat
            label="إجمالي الطلبات"
            value={own.length}
            hint="جميع طلبات الإجازة"
            icon={<CalendarDays size={18} />}
          />
          <Stat
            label="بانتظار الموافقة"
            value={pending}
            hint="تحتاج مراجعتك"
            tone="amber"
            icon={<Clock3 size={18} />}
          />
          <Stat
            label="طلبات معتمدة"
            value={own.filter((l) => l.status === "معتمد").length}
            hint="تم تحديث الأرصدة"
            tone="green"
            icon={<CircleCheck size={18} />}
          />
          <Stat
            label="أيام الإجازة المعتمدة"
            value={own
              .filter((l) => l.status === "معتمد")
              .reduce((s, l) => s + l.days, 0)}
            hint="مجموع المدد في سجل العرض"
            tone="purple"
            icon={<CalendarDays size={18} />}
          />
        </div>
      )}
      <div className={personal ? "leave-layout" : "stack"}>
        {personal && (
          <Card className="leave-balance-card">
            <h2>رصيد إجازاتي السنوية</h2>
            <LeaveDonut balance={balance} total={employee.leaveBase} />
            <div className="leave-meta">
              <div>
                <span>الرصيد الكلي</span>
                <strong>{employee.leaveBase} يومًا</strong>
              </div>
              <div>
                <span>المستخدم</span>
                <strong>{employee.leaveBase - balance} أيام</strong>
              </div>
            </div>
            <div className="notice">
              <CalendarDays size={18} />
              يُحدّث رصيدك فور اعتماد الطلب من المدير. الطلبات المعلّقة لا تخصم
              أيامًا.
            </div>
            <div className="mini-profile">
              <div>
                <small>طلبات معلّقة</small>
                <strong>{pending} طلبات</strong>
              </div>
              <div>
                <small>المتبقي بعد الاعتماد</small>
                <strong>
                  {balance -
                    own
                      .filter((l) => l.status === "بانتظار الموافقة")
                      .reduce((s, l) => s + l.days, 0)}{" "}
                  يومًا
                </strong>
              </div>
            </div>
          </Card>
        )}
        <div className="stack">
          <Card
            title={personal ? "طلبات إجازاتي" : "طلبات الفريق"}
            action={<span className="pill">{rows.length} طلبًا</span>}
          >
            <div className="filters">
              {!personal && (
                <div className="search-field">
                  <Search size={15} />
                  <input
                    aria-label="البحث في الإجازات"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث عن موظف أو طلب…"
                  />
                </div>
              )}
              <select
                aria-label="حالة الإجازة"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">جميع الحالات</option>
                <option>بانتظار الموافقة</option>
                <option>معتمد</option>
                <option>مرفوض</option>
              </select>
            </div>
            {rows.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      {!personal && <th>الموظف</th>}
                      <th>نوع الإجازة</th>
                      <th>الفترة</th>
                      <th>المدة</th>
                      <th>الحالة</th>
                      <th>الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((l) => (
                      <tr key={l.id}>
                        {!personal && (
                          <td>
                            <Person
                              employee={
                                state.employees.find(
                                  (e) => e.id === l.employeeId,
                                )!
                              }
                            />
                          </td>
                        )}
                        <td>
                          {l.type}
                          <small
                            className="muted ltr"
                            style={{
                              display: "block",
                              fontSize: 8,
                              marginTop: 4,
                            }}
                          >
                            {l.id}
                          </small>
                        </td>
                        <td style={{ fontSize: 10, color: "#8696ac" }}>
                          {dateLabel(l.start)}
                          <br />
                          {dateLabel(l.end)}
                        </td>
                        <td>{l.days} أيام</td>
                        <td>
                          <Badge>{l.status}</Badge>
                        </td>
                        <td>
                          <button
                            className="btn secondary small"
                            onClick={() => setSelected(l.id)}
                          >
                            {!personal && l.status === "بانتظار الموافقة"
                              ? "مراجعة الطلب"
                              : "التفاصيل"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="لا توجد طلبات بهذه الحالة"
                description="ستظهر طلبات الإجازات وتحديثاتها هنا."
              />
            )}
          </Card>
          <Card
            title="نظرة على الأسبوع القادم"
            action={
              <span className="muted" style={{ fontSize: 10 }}>
                نوفمبر 2026
              </span>
            }
          >
            <div className="calendar-strip">
              {Array.from({ length: 7 }, (_, i) => {
                const day = 15 + i;
                const count = own.filter(
                  (l) =>
                    l.status === "معتمد" &&
                    l.start <= `2026-11-${day}` &&
                    l.end >= `2026-11-${day}`,
                ).length;
                return (
                  <div
                    className={`calendar-cell ${count ? "marked" : ""}`}
                    key={day}
                  >
                    <small>
                      {
                        [
                          "الأحد",
                          "الاثنين",
                          "الثلاثاء",
                          "الأربعاء",
                          "الخميس",
                          "الجمعة",
                          "السبت",
                        ][i]
                      }
                    </small>
                    <strong>{day}</strong>
                    {count > 0 && (
                      <small style={{ color: "#6794dc" }}>
                        {count} {personal ? "إجازة" : "موظفين"}
                      </small>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
      {create && (
        <Modal
          title="استراحة جديدة، طاقة متجددة"
          onClose={() => setCreate(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(new FormData(e.currentTarget));
            }}
          >
            <div className="notice" style={{ marginBottom: 23 }}>
              <img
                className="leave-form-art"
                src="/assets/leave-illustration.png"
                alt="رسم أصلي لحقيبة سفر"
              />
              <div>
                رصيد الإجازات المتاح <strong>{newBalance} يومًا</strong>
                <p style={{ fontSize: 10 }}>
                  يُخصم الرصيد بعد موافقة المدير فقط.
                </p>
              </div>
            </div>
            <div className="form-grid">
              {!personal && (
                <div className="span-2">
                  <Field label="الموظف">
                    <select
                      value={forEmployee}
                      onChange={(e) => setForEmployee(e.target.value)}
                    >
                      {state.employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              )}
              <div className="span-2">
                <Field label="نوع الإجازة">
                  <select name="type">
                    <option>إجازة سنوية</option>
                    <option>إجازة شخصية</option>
                    <option>إجازة مرضية</option>
                  </select>
                </Field>
              </div>
              <Field label="من تاريخ">
                <input
                  required
                  type="date"
                  value={start}
                  min={DEMO_TODAY}
                  onChange={(e) => {
                    setStart(e.target.value);
                    setError("");
                  }}
                />
              </Field>
              <Field label="إلى تاريخ">
                <input
                  required
                  type="date"
                  value={end}
                  min={start}
                  onChange={(e) => {
                    setEnd(e.target.value);
                    setError("");
                  }}
                />
              </Field>
              <div className="span-2">
                <Field label="سبب الطلب">
                  <textarea
                    name="reason"
                    required
                    minLength={4}
                    placeholder="أخبرنا بما تحتاجه لتنظيم العمل أثناء إجازتك…"
                  />
                </Field>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 18,
                fontSize: 12,
              }}
            >
              <span className="muted">مدة الطلب</span>
              <strong>
                {Number.isFinite(days) && days > 0 ? days : 0} أيام
              </strong>
            </div>
            <p className="muted" style={{ fontSize: 9, marginTop: 5 }}>
              الحساب التجريبي يشمل جميع أيام الفترة المختارة.
            </p>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <div className="form-actions">
              <button
                type="button"
                className="btn secondary"
                onClick={() => setCreate(false)}
              >
                إلغاء
              </button>
              <button type="submit" className="btn primary">
                <Send size={15} />
                إرسال الطلب
              </button>
            </div>
          </form>
        </Modal>
      )}
      {selectedLeave && (
        <Modal title="تفاصيل طلب الإجازة" onClose={() => setSelected(null)}>
          <LeaveDetails leave={selectedLeave} />
          {!personal && selectedLeave.status === "بانتظار الموافقة" && (
            <div className="form-actions">
              <button
                className="btn danger"
                onClick={() => decide(selectedLeave, "مرفوض")}
              >
                <X size={15} />
                رفض الطلب
              </button>
              <button
                className="btn primary"
                onClick={() => decide(selectedLeave, "معتمد")}
              >
                <Check size={15} />
                اعتماد الإجازة
              </button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

export function Payslip({
  employee: e,
  month,
  onClose,
}: {
  employee: Employee;
  month: string;
  onClose: () => void;
}) {
  const { state, currency, notify } = useContext();
  const p = getPayroll(state, e.id, month);
  const [printed, setPrinted] = useState(false);
  return (
    <Modal title="كشف الراتب الشهري" onClose={onClose} wide>
      <div className="payslip">
        <div className="payslip-banner">
          <div>
            <small>{state.settings.company}</small>
            <h3>كشف راتب · {monthName(month)}</h3>
            <span className="payslip-id ltr">
              PAY-{month.replace("-", "")}-{e.id}
            </span>
          </div>
          <div style={{ textAlign: "left" }}>
            <strong>{money(p.net, currency)}</strong>
            <Badge>كشف تجريبي</Badge>
          </div>
        </div>
        <div className="payslip-meta">
          {[
            ["اسم الموظف", e.name],
            ["الرقم الوظيفي", e.id],
            ["الإدارة", e.department],
            ["المسمى الوظيفي", e.job],
            ["شهر الاستحقاق", monthName(month)],
            ["تاريخ الإصدار", dateLabel(month + "-28")],
          ].map(([k, v]) => (
            <div key={k}>
              <small>{k}</small>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
        <div className="grid-2">
          <div className="payslip-section">
            <h3>الاستحقاقات</h3>
            {[
              ["الراتب الأساسي", p.base],
              ["بدل السكن", p.housing],
              ["بدل النقل", p.transport],
              ...(p.otherAllowances ? [["بدلات أخرى", p.otherAllowances]] : []),
              ["عمولات المبيعات", p.commission],
              ["المكافآت", p.bonus],
            ].map(([l, v]) => (
              <div className="payslip-row" key={l}>
                <span>{l}</span>
                <strong>{money(Number(v), currency)}</strong>
              </div>
            ))}
            <div className="payslip-row">
              <span>إجمالي الاستحقاقات</span>
              <strong>{money(p.gross, currency)}</strong>
            </div>
          </div>
          <div className="payslip-section">
            <h3>الاستقطاعات</h3>
            <div className="payslip-row">
              <span>استقطاعات افتراضية</span>
              <strong>{money(p.deductions, currency)}</strong>
            </div>
            <div className="notice" style={{ marginTop: 22, fontSize: 10 }}>
              <FileText size={20} />
              جميع المكونات محسوبة من بيانات العرض. لا يتضمن هذا النموذج قواعد
              نظامية أو حسابات تأمينات فعلية.
            </div>
          </div>
        </div>
        <div className="payslip-net">
          <span>صافي الراتب المستحق</span>
          <strong>{money(p.net, currency)}</strong>
        </div>
        <p className="payslip-note">
          بيانات تجريبية — نموذج أولي، غير صالح للاستخدام كمستند مالي رسمي.
        </p>
        <div className="form-actions print-actions">
          <button className="btn secondary" onClick={onClose}>
            إغلاق
          </button>
          <button
            className="btn primary"
            onClick={() => {
              setPrinted(true);
              notify("اختر حفظ بصيغة PDF من نافذة الطباعة");
              window.print();
            }}
          >
            <Printer size={16} />
            {printed ? "طباعة الكشف مجددًا" : "طباعة / حفظ PDF"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
export function PayrollPage() {
  const { state, employee, personal, currency, notify } = useContext();
  const [month, setMonth] = useState(MONTH),
    [department, setDepartment] = useState("all"),
    [search, setSearch] = useState(""),
    [slip, setSlip] = useState<{ id: string; month: string } | null>(null);
  const employees = (personal ? [employee] : state.employees).filter(
    (e) =>
      (department === "all" || e.department === department) &&
      `${e.name} ${e.id}`.includes(search),
  );
  const totals = employees.reduce(
    (t, e) => {
      const p = getPayroll(state, e.id, month);
      return {
        base: t.base + p.base,
        gross: t.gross + p.gross,
        commission: t.commission + p.commission,
        deductions: t.deductions + p.deductions,
        net: t.net + p.net,
      };
    },
    { base: 0, gross: 0, commission: 0, deductions: 0, net: 0 },
  );
  return (
    <>
      <PageHeader
        eyebrow={personal ? "تعويضاتي ومزاياي" : "التعويضات والمزايا"}
        title={personal ? "راتبي، بكل وضوح" : "مسير الرواتب"}
        description={
          personal
            ? "تفاصيل مستحقاتك الشهرية وكشوفك في مكان واحد."
            : "صورة مالية واضحة للفريق، من الاستحقاقات إلى صافي الراتب."
        }
        actions={
          <button
            className="btn secondary"
            onClick={() => {
              exportCSV(
                [
                  [
                    "الاسم",
                    "الشهر",
                    "الأساسي",
                    "إجمالي الاستحقاقات",
                    "الاستقطاعات",
                    "الصافي",
                  ],
                  ...employees.map((e) => {
                    const p = getPayroll(state, e.id, month);
                    return [
                      e.name,
                      month,
                      p.base,
                      p.gross,
                      p.deductions,
                      p.net,
                    ];
                  }),
                ],
                "مسير-" + month,
              );
              notify("تم تصدير بيانات المسير المختار");
            }}
          >
            <Download size={15} />
            تصدير المسير
          </button>
        }
      />
      <div className="filters">
        <select
          aria-label="شهر الراتب"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          {MONTHS.map((m) => (
            <option value={m.value} key={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        {!personal && (
          <>
            <select
              aria-label="إدارة الرواتب"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="all">جميع الإدارات</option>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <div className="search-field">
              <Search size={16} />
              <input
                aria-label="البحث في الرواتب"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن موظف…"
              />
            </div>
          </>
        )}
        <span className="filter-end">
          <Badge>مسير تجريبي</Badge>
        </span>
      </div>
      <div className="finance-overview">
        <Stat
          label={personal ? "راتبي الأساسي" : "إجمالي الرواتب الأساسية"}
          value={
            <>
              {money(totals.base).replace(" ر.س", "")}
              <small>{currency}</small>
            </>
          }
          hint={monthName(month)}
          icon={<Wallet size={18} />}
        />
        <Stat
          label="إجمالي الاستحقاقات"
          value={
            <>
              {money(totals.gross).replace(" ر.س", "")}
              <small>{currency}</small>
            </>
          }
          hint="الأساسي + البدلات + العمولات + المكافآت"
          tone="green"
          icon={<TrendingUp size={18} />}
        />
        <Stat
          label="إجمالي الاستقطاعات"
          value={
            <>
              {money(totals.deductions).replace(" ر.س", "")}
              <small>{currency}</small>
            </>
          }
          hint="قيم افتراضية لأغراض العرض"
          tone="amber"
          icon={<FileText size={18} />}
        />
        <Stat
          label="صافي الراتب"
          value={
            <>
              {money(totals.net).replace(" ر.س", "")}
              <small>{currency}</small>
            </>
          }
          hint={
            personal
              ? "المستحق لهذا الشهر"
              : `${employees.length} موظفًا في المسير`
          }
          tone="navy"
          icon={<BadgeCheck size={18} />}
        />
      </div>
      {personal && (
        <div className="monthly-note">
          <Wallet size={24} />
          <div>
            كشف راتبك لشهر {monthName(month)} متاح الآن.{" "}
            <button
              className="btn text"
              onClick={() => setSlip({ id: employee.id, month })}
            >
              عرض الكشف <ArrowUpLeft size={14} />
            </button>
          </div>
        </div>
      )}
      <Card
        className="flush-table"
        title={
          personal ? "أرشيف كشوف راتبي" : `تفاصيل مسير ${monthName(month)}`
        }
        action={
          <span className="pill">
            {personal ? "12 شهرًا" : `${employees.length} موظفًا`}
          </span>
        }
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{personal ? "الشهر" : "الموظف"}</th>
                <th>الأساسي</th>
                <th>البدلات</th>
                <th>العمولات</th>
                <th>المكافآت</th>
                <th>الاستقطاعات</th>
                <th>الصافي</th>
                <th>الكشف</th>
              </tr>
            </thead>
            <tbody>
              {(personal
                ? MONTHS.map((m) => ({ e: employee, m: m.value }))
                : employees.map((e) => ({ e, m: month }))
              ).map(({ e, m }) => {
                const p = getPayroll(state, e.id, m);
                return (
                  <tr key={e.id + m}>
                    <td>
                      {personal ? (
                        <strong style={{ fontWeight: 500, fontSize: 11 }}>
                          {monthName(m)}
                        </strong>
                      ) : (
                        <Person employee={e} />
                      )}
                    </td>
                    <td className="money-cell">
                      {money(p.base).replace(" ر.س", "")}
                    </td>
                    <td className="muted" style={{ fontSize: 11 }}>
                      {money(
                        p.housing + p.transport + p.otherAllowances,
                      ).replace(" ر.س", "")}
                    </td>
                    <td className="muted" style={{ fontSize: 11 }}>
                      {money(p.commission).replace(" ر.س", "")}
                    </td>
                    <td className="muted" style={{ fontSize: 11 }}>
                      {money(p.bonus).replace(" ر.س", "")}
                    </td>
                    <td style={{ color: "#c38b93", fontSize: 11 }}>
                      − {money(p.deductions).replace(" ر.س", "")}
                    </td>
                    <td className="money-cell">
                      {money(p.net).replace(" ر.س", "")}
                      <small>{currency}</small>
                    </td>
                    <td>
                      <button
                        className="btn secondary small"
                        onClick={() => setSlip({ id: e.id, month: m })}
                      >
                        <FileText size={13} />
                        عرض
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!employees.length && (
          <EmptyState title="لا يوجد موظفون وفق التصفيات" />
        )}
      </Card>
      <div className="notice warning" style={{ marginTop: 20, fontSize: 10 }}>
        <FileText size={17} />
        الحسابات والمبالغ للتوضيح البصري فقط، وتُشتق من بيانات النموذج دون تطبيق
        قوانين رواتب فعلية.
      </div>
      {slip && (
        <Payslip
          employee={state.employees.find((e) => e.id === slip.id)!}
          month={slip.month}
          onClose={() => setSlip(null)}
        />
      )}
    </>
  );
}

export function Commissions() {
  const { state, employee, personal, currency, update, notify } = useContext();
  const [month, setMonth] = useState(MONTH),
    [emp, setEmp] = useState("all"),
    [status, setStatus] = useState("all"),
    [selected, setSelected] = useState<string | null>(null);
  const all = state.commissions.filter(
    (c) => !personal || c.employeeId === employee.id,
  );
  const rows = all.filter(
    (c) =>
      (month === "all" || c.month === month) &&
      (emp === "all" || c.employeeId === emp) &&
      (status === "all" || c.status === status),
  );
  const total = rows.reduce(
    (s, c) => s + Math.round((c.eligible * c.rate) / 100),
    0,
  );
  const eligible = rows.reduce((s, c) => s + c.eligible, 0);
  const paid = rows
    .filter((c) => c.status === "مصروف")
    .reduce((s, c) => s + Math.round((c.eligible * c.rate) / 100), 0);
  const people = Array.from(new Set(all.map((c) => c.employeeId))).map(
    (id) => state.employees.find((e) => e.id === id)!,
  );
  const chart = MONTHS.slice(0, 6)
    .reverse()
    .map((m) => ({
      name: m.label.split(" ")[0],
      value: all
        .filter(
          (c) => c.month === m.value && (emp === "all" || c.employeeId === emp),
        )
        .reduce((s, c) => s + Math.round((c.eligible * c.rate) / 100), 0),
    }));
  const detail = state.commissions.find((c) => c.id === selected);
  function change(c: Commission, status: Status) {
    update((s) => ({
      ...s,
      commissions: s.commissions.map((x) =>
        x.id === c.id ? { ...x, status } : x,
      ),
      activities: [
        {
          id: crypto.randomUUID(),
          text: `تحديث العمولة ${c.id} إلى ${status}`,
          date: DEMO_TODAY,
        },
        ...s.activities,
      ],
    }));
    notify(`تم تحديث حالة العمولة إلى ${status}`);
  }
  return (
    <>
      <PageHeader
        eyebrow={personal ? "ثمرة إنجازك" : "التعويضات والمزايا"}
        title={personal ? "عمولاتي" : "عمولات المبيعات"}
        description={
          personal
            ? "كل صفقة تنجح، تنعكس هنا. تابع استحقاقاتك وحالة الصرف."
            : "من نجاح الصفقة إلى استحقاق الفريق، تفاصيل تصنع الثقة."
        }
        actions={
          <button
            className="btn secondary"
            onClick={() => {
              exportCSV(
                [
                  [
                    "العملية",
                    "الموظف",
                    "الشهر",
                    "المبيعات المؤهلة",
                    "النسبة",
                    "العمولة",
                    "الحالة",
                  ],
                  ...rows.map((c) => [
                    c.deal,
                    state.employees.find((e) => e.id === c.employeeId)!.name,
                    c.month,
                    c.eligible,
                    c.rate,
                    Math.round((c.eligible * c.rate) / 100),
                    c.status,
                  ]),
                ],
                "عمولات-المبيعات",
              );
              notify("تم تصدير العمولات الظاهرة");
            }}
          >
            <Download size={15} />
            تصدير
          </button>
        }
      />
      <div className="finance-overview">
        <Stat
          label="المبيعات المؤهلة"
          value={
            <>
              {money(eligible).replace(" ر.س", "")}
              <small>{currency}</small>
            </>
          }
          hint={`${rows.length} عمليات في الفترة المختارة`}
          icon={<TrendingUp size={18} />}
        />
        <Stat
          label="إجمالي العمولات"
          value={
            <>
              {money(total).replace(" ر.س", "")}
              <small>{currency}</small>
            </>
          }
          hint="مشتقة من قيمة المبيعات ونسبة الاستحقاق"
          tone="navy"
          icon={<Percent size={18} />}
        />
        <Stat
          label="عمولات مصروفة"
          value={
            <>
              {money(paid).replace(" ر.س", "")}
              <small>{currency}</small>
            </>
          }
          hint={`${rows.filter((c) => c.status === "مصروف").length} عمليات مكتملة الصرف`}
          tone="green"
          icon={<CircleCheck size={18} />}
        />
        <Stat
          label="متبقي للصرف"
          value={
            <>
              {money(total - paid).replace(" ر.س", "")}
              <small>{currency}</small>
            </>
          }
          hint="معتمد أو بانتظار الموافقة"
          tone="amber"
          icon={<Clock3 size={18} />}
        />
      </div>
      <div className="commission-layout">
        <Card
          title="إنجاز يُترجم إلى استحقاق"
          action={<span className="pill">آخر 6 أشهر</span>}
        >
          <p className="card-subtitle">مقارنة العمولات الشهرية · {currency}</p>
          <ResponsiveContainer width="100%" height={185}>
            <BarChart
              data={chart}
              margin={{ left: -15, top: 8, right: 10, bottom: 0 }}
              barSize={26}
            >
              <CartesianGrid
                vertical={false}
                stroke="#edf1f7"
                strokeDasharray="3 3"
              />
              <XAxis dataKey="name" axisLine={false} tickLine={false} dy={6} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? v / 1000 + "ألف" : String(v)
                }
              />
              <Tooltip
                cursor={{ fill: "#f3f7fd" }}
                contentStyle={{ border: "1px solid #e5ecf7", borderRadius: 8 }}
                formatter={(v) => [money(Number(v), currency), "العمولات"]}
              />
              <Bar
                isAnimationActive={false}
                dataKey="value"
                radius={[5, 5, 0, 0]}
              >
                {chart.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === chart.length - 1 ? "#3778e8" : "#b9d0f1"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="commission-highlight">
          <Percent size={100} />
          <span className="eyebrow">كل إنجاز يستحق التقدير</span>
          <h2>
            عندما ينمو العمل،
            <br />
            ينمو الأثر.
          </h2>
          <p>نظرة واضحة إلى استحقاقات المبيعات، من أول صفقة حتى الصرف.</p>
          <div className="highlight-value">
            {total ? Math.round((paid / total) * 100) : 0}
            <small>٪ مكتمل الصرف</small>
          </div>
          <Progress value={total ? (paid / total) * 100 : 0} />
          <div className="highlight-foot">
            <span>المصروف {money(paid, currency)}</span>
            <span>{month === "all" ? "جميع الأشهر" : monthName(month)}</span>
          </div>
        </Card>
      </div>
      <Card
        title={personal ? "سجل عمولاتي" : "سجل عمولات الفريق"}
        action={<span className="pill">{rows.length} عمليات</span>}
      >
        <div className="filters">
          <select
            aria-label="شهر العمولات"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="all">جميع الأشهر</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          {!personal && (
            <select
              aria-label="موظف العمولات"
              value={emp}
              onChange={(e) => setEmp(e.target.value)}
            >
              <option value="all">جميع الموظفين</option>
              {people.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          )}
          <select
            aria-label="حالة صرف العمولة"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">جميع حالات الصرف</option>
            <option>بانتظار الموافقة</option>
            <option>معتمد</option>
            <option>مصروف</option>
          </select>
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {!personal && <th>الموظف</th>}
                  <th>الصفقة / المبيعات</th>
                  <th>المبلغ المؤهل</th>
                  <th>النسبة</th>
                  <th>العمولة</th>
                  <th>الاستحقاق</th>
                  <th>حالة الصرف</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr
                    key={c.id}
                    className="clickable"
                    onClick={() => setSelected(c.id)}
                  >
                    {!personal && (
                      <td>
                        <Person
                          employee={
                            state.employees.find((e) => e.id === c.employeeId)!
                          }
                        />
                      </td>
                    )}
                    <td
                      style={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.deal}
                      <small
                        className="ltr muted"
                        style={{ display: "block", fontSize: 8 }}
                      >
                        {c.id}
                      </small>
                    </td>
                    <td className="money-cell">
                      {money(c.eligible).replace(" ر.س", "")}
                      <small>{currency}</small>
                    </td>
                    <td>
                      <span className="pill">{c.rate}٪</span>
                    </td>
                    <td className="money-cell" style={{ color: "#3a7fcd" }}>
                      {money(Math.round((c.eligible * c.rate) / 100)).replace(
                        " ر.س",
                        "",
                      )}
                      <small>{currency}</small>
                    </td>
                    <td className="muted" style={{ fontSize: 10 }}>
                      {monthName(c.month)}
                    </td>
                    <td>
                      <Badge>{c.status}</Badge>
                    </td>
                    <td>
                      <button
                        className="icon-btn"
                        aria-label={`تفاصيل العمولة ${c.id}`}
                        onClick={() => setSelected(c.id)}
                      >
                        <ArrowUpLeft size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="لا توجد عمولات وفق التصفيات"
            description="اختر شهرًا أو موظفًا آخر لعرض العمولات."
          />
        )}
      </Card>
      {detail && (
        <Modal title="تفاصيل استحقاق العمولة" onClose={() => setSelected(null)}>
          <div className="stack">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Person
                employee={
                  state.employees.find((e) => e.id === detail.employeeId)!
                }
              />
              <Badge>{detail.status}</Badge>
            </div>
            <div className="payslip-banner">
              <div>
                <small>{detail.deal}</small>
                <h3>قيمة العمولة المستحقة</h3>
              </div>
              <strong>
                {money(
                  Math.round((detail.eligible * detail.rate) / 100),
                  currency,
                )}
              </strong>
            </div>
            <div className="detail-grid">
              {[
                ["رقم العملية", detail.id],
                ["شهر الاستحقاق", monthName(detail.month)],
                ["المبيعات المؤهلة", money(detail.eligible, currency)],
                ["نسبة العمولة", `${detail.rate}٪`],
                ["تاريخ العملية", dateLabel(detail.date)],
                [
                  "آلية الحساب",
                  `${money(detail.eligible, currency)} × ${detail.rate}٪`,
                ],
              ].map(([k, v]) => (
                <div key={k}>
                  <small>{k}</small>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
            <div className="notice">
              <Percent size={20} />
              تظهر العمولة نفسها في بوابة الموظف وكشف راتب شهر الاستحقاق. تغيير
              حالة الصرف لا ينشئ عمولة جديدة.
            </div>
          </div>
          {!personal && detail.status !== "مصروف" && (
            <div className="form-actions">
              {detail.status === "بانتظار الموافقة" && (
                <button
                  className="btn secondary"
                  onClick={() => change(detail, "معتمد")}
                >
                  <Check size={16} />
                  اعتماد الاستحقاق
                </button>
              )}
              <button
                className="btn primary"
                onClick={() => change(detail, "مصروف")}
              >
                <Wallet size={16} />
                تأكيد الصرف التجريبي
              </button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
