import { useState, type FormEvent } from "react";
import {
  Plus,
  Search,
  ArrowUpLeft,
  FileText,
  Check,
  X,
  CalendarDays,
  ShieldCheck,
  Wallet,
  Package,
  Star,
  TrendingUp,
  MessageSquare,
  Send,
  Laptop,
  Clock3,
  CheckCircle2,
  ChevronLeft,
  AlertCircle,
  Building2,
  Gift,
  RefreshCw,
} from "lucide-react";
import { useStore } from "./store";
import { money, dateLabel, getAttendanceSummary } from "./data";
import type {
  DomainRecord,
  RecordKind,
  Status,
  Employee,
  AttendanceEntry,
} from "./types";
import {
  Card,
  PageHeader,
  Badge,
  Avatar,
  Modal,
  EmptyState,
  Stat,
  Tabs,
  Field,
  Progress,
} from "./components/ui";
import "./modules.css";
const TODAY = "2026-11-14";
function workDuration(log?: AttendanceEntry | null) {
  if (!log || !["حاضر", "متأخر"].includes(log.status)) return "—";
  if (log.checkOut === "—") return "يوم عمل جارٍ";
  const toMinutes = (time: string) =>
    Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  const minutes = toMinutes(log.checkOut) - toMinutes(log.checkIn);
  if (!Number.isFinite(minutes) || minutes < 0) return "—";
  return `${Math.floor(minutes / 60)} س ${minutes % 60} د`;
}
const configs: Record<
  string,
  { title: string; description: string; eyebrow: string; action: string }
> = {
  contracts: {
    title: "العقود الوظيفية",
    description: "علاقة عمل واضحة، من أول يوم إلى التجديد التالي.",
    eyebrow: "الموظفون والوثائق",
    action: "إضافة عقد",
  },
  allowances: {
    title: "البدلات والمزايا",
    description: "تفاصيل المزايا الشهرية التي تدعم فريقك.",
    eyebrow: "التعويضات والمزايا",
    action: "إضافة بدل",
  },
  bonuses: {
    title: "المكافآت والتقدير",
    description: "نحتفي بالإنجاز ونكافئ الأداء الاستثنائي.",
    eyebrow: "التعويضات والمزايا",
    action: "منح مكافأة",
  },
  attendance: {
    title: "الحضور والانصراف",
    description: "صورة واضحة عن التزام الفريق وساعات العمل.",
    eyebrow: "الوقت والحضور",
    action: "تسجيل حضور",
  },
  advances: {
    title: "السلف المالية",
    description: "طلبات السلف وخطط السداد، في مكان واحد.",
    eyebrow: "التعويضات والمزايا",
    action: "طلب سلفة",
  },
  assets: {
    title: "العهد والممتلكات",
    description: "كل عهدة موثقة، من التسليم إلى الإرجاع.",
    eyebrow: "خدمات الموظفين",
    action: "تسليم عهدة",
  },
  evaluations: {
    title: "تقييم الأداء",
    description: "نحو نمو مستمر وأهداف مشتركة قابلة للقياس.",
    eyebrow: "التطوير والأداء",
    action: "بدء تقييم",
  },
  promotions: {
    title: "الترقيات والمسار المهني",
    description: "خطوات مدروسة نحو المرحلة المهنية التالية.",
    eyebrow: "التطوير والأداء",
    action: "اقتراح ترقية",
  },
  complaints: {
    title: "الشكاوى والملاحظات",
    description: "مساحة آمنة للإصغاء، والمعالجة، والتحسين.",
    eyebrow: "خدمات الموظفين",
    action: "تقديم شكوى",
  },
  offboarding: {
    title: "نهاية الخدمة",
    description: "تجربة مغادرة منظمة تحفظ وضوح الإجراءات.",
    eyebrow: "خدمات الموظفين",
    action: "طلب نهاية خدمة",
  },
};
function Meta({ record }: { record: DomainRecord }) {
  return (
    <div className="module-meta">
      {Object.entries(record.meta).map(([key, value]) => (
        <div key={key}>
          <span>{key}</span>
          <strong>
            {typeof value === "boolean"
              ? value
                ? "مكتمل"
                : "بانتظار الإجراء"
              : String(value)}
          </strong>
        </div>
      ))}
    </div>
  );
}
function History({ record }: { record: DomainRecord }) {
  return (
    <div className="module-history">
      {record.history.map((event, i) => (
        <div key={i}>
          <i />
          <div>
            <strong>{event.text}</strong>
            <small>{dateLabel(event.date)}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
function Person({ employee }: { employee: Employee }) {
  return (
    <div className="person">
      <Avatar employee={employee} />
      <div>
        <strong>{employee.name}</strong>
        <small>{employee.department}</small>
      </div>
    </div>
  );
}
export default function Modules({ kind }: { kind: string }) {
  const { state, update, notify, employee, role } = useStore();
  const personal = role === "employee";
  const currency = state.settings.currency;
  const cfg = configs[kind] || configs.contracts;
  const [attLog, setAttLog] = useState<AttendanceEntry | null>(null);
  const [query, setQuery] = useState(
      state.employees.find(
        (e) =>
          e.id === new URLSearchParams(window.location.search).get("employee"),
      )?.name || "",
    ),
    [status, setStatus] = useState("الكل"),
    [selected, setSelected] = useState<string | null>(null),
    [form, setForm] = useState(
      new URLSearchParams(window.location.search).has("new"),
    ),
    [tab, setTab] = useState("نظرة عامة"),
    [reply, setReply] = useState(""),
    [attendanceDay, setAttendanceDay] = useState(TODAY),
    [attEmployee, setAttEmployee] = useState<Employee | null>(null);
  const records = state.records.filter(
    (r) => r.kind === kind && (!personal || r.employeeId === employee.id),
  );
  const filtered = records.filter(
    (r) =>
      (status === "الكل" || r.status === status) &&
      `${r.title} ${r.id} ${state.employees.find((e) => e.id === r.employeeId)?.name || ""}`.includes(
        query,
      ),
  );
  const current = state.records.find((r) => r.id === selected);
  const person = (id: string) =>
    state.employees.find((e) => e.id === id) || employee;
  const summary = getAttendanceSummary(state, employee.id);
  const todayLogs = state.attendance.filter((a) => a.date === attendanceDay);
  const visibleLogs = (
    personal
      ? state.attendance.filter(
          (a) => a.employeeId === employee.id && a.date <= attendanceDay,
        )
      : todayLogs
  )
    .filter((a) => {
      const e = person(a.employeeId);
      return e.name.includes(query) || e.id.includes(query);
    })
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
  const sum = (list: DomainRecord[]) => list.reduce((v, r) => v + r.amount, 0);
  const cash = (v: number) => money(v, currency);
  const open = (r: DomainRecord) => {
    setSelected(r.id);
    setTab("نظرة عامة");
  };
  function change(r: DomainRecord, next: Status) {
    update((s) => ({
      ...s,
      records: s.records.map((x) =>
        x.id === r.id
          ? {
              ...x,
              status: next,
              history: [
                ...x.history,
                { date: TODAY, text: `تم تغيير الحالة إلى ${next}` },
              ],
            }
          : x,
      ),
      activities: [
        {
          id: `ACT-${Date.now()}`,
          text: `${cfg.title}: ${r.title} — ${next}`,
          date: TODAY,
        },
        ...s.activities,
      ],
    }));
    notify(`تم تحديث الحالة إلى «${next}»`);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const employeeId = personal
      ? employee.id
      : String(data.get("employeeId") || employee.id);
    if (kind === "attendance") {
      const day = String(data.get("date") || TODAY);
      const status = String(
        data.get("attendanceStatus") || "حاضر",
      ) as AttendanceEntry["status"];
      const checkIn = String(data.get("checkIn") || "08:00");
      const checkOut = String(data.get("checkOut") || "16:00");
      const log: AttendanceEntry = {
        id: `ATT-${employeeId}-${day}`,
        employeeId,
        date: day,
        checkIn: status === "غائب" || status === "في إجازة" ? "—" : checkIn,
        checkOut: status === "غائب" || status === "في إجازة" ? "—" : checkOut,
        status,
        lateMinutes:
          status === "متأخر"
            ? Math.max(
                1,
                (Number(checkIn.slice(0, 2)) - 8) * 60 +
                  Number(checkIn.slice(3)),
              )
            : 0,
        overtime: 0,
      };
      update((s) => ({
        ...s,
        attendance: [...s.attendance.filter((a) => a.id !== log.id), log],
      }));
      setAttendanceDay(day);
      setForm(false);
      notify("تم تحديث سجل الحضور التجريبي");
      return;
    }
    const amount = Number(data.get("amount") || 0);
    const type = String(data.get("title") || cfg.title);
    const date = String(data.get("date") || TODAY);
    let meta: DomainRecord["meta"] = {};
    let next: Status = "بانتظار الموافقة";
    if (kind === "advances") {
      const n = Number(data.get("installments") || 6);
      meta = {
        "عدد الأقساط": n,
        "القسط الشهري": Math.round(amount / n),
        المسدد: 0,
        المتبقي: amount,
      };
    }
    if (kind === "complaints")
      meta = {
        الأولوية: String(data.get("priority") || "متوسطة"),
        "جهة المعالجة": "الموارد البشرية",
      };
    if (kind === "contracts") {
      meta = { "نوع العقد": type, التجديد: "بمراجعة الطرفين" };
      next = "نشط";
    }
    if (kind === "assets") {
      meta = {
        "الرقم التسلسلي": String(
          data.get("serial") || `SN-${Date.now().toString().slice(-6)}`,
        ),
        الفئة: "أجهزة وممتلكات",
        "حالة الجهاز": "جيد",
      };
      next = "مسلّمة";
    }
    if (kind === "evaluations")
      meta = { التقييم: 4.5, الدورة: "الربع الرابع 2026", "إنجاز الأهداف": 85 };
    if (kind === "promotions")
      meta = {
        "الدرجة السابقة": person(employeeId).grade,
        "الدرجة الجديدة": String(data.get("grade") || "الدرجة السادسة"),
        "المسمى السابق": person(employeeId).job,
        "المسمى الجديد": type,
        "الراتب السابق": person(employeeId).base,
        "الراتب الجديد": amount,
      };
    if (kind === "offboarding")
      meta = {
        "سبب المغادرة": type,
        "تسليم المهام": false,
        "إرجاع العهد": false,
        "المراجعة المالية": false,
        "إخلاء الطرف": false,
      };
    if (kind === "allowances")
      meta = { التكرار: "شهري", "موعد الاستحقاق": "نوفمبر 2026" };
    if (kind === "bonuses")
      meta = { النوع: type, "دورة الاستحقاق": "نوفمبر 2026" };
    const record: DomainRecord = {
      id: `${kind.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-7)}`,
      kind: kind as RecordKind,
      employeeId,
      title: type,
      status: next,
      date,
      end: String(data.get("end") || "") || undefined,
      amount,
      description: String(
        data.get("description") || "طلب تجريبي ضمن نموذج العرض.",
      ),
      meta,
      history: [
        {
          date: TODAY,
          text: personal
            ? "تم تقديم الطلب من بوابة الموظف"
            : "تم إنشاء السجل من إدارة الموارد البشرية",
        },
      ],
      comments: [],
    };
    update((s) => ({
      ...s,
      records: [record, ...s.records],
      activities: [
        {
          id: `ACT-${Date.now()}`,
          text: `${person(employeeId).name}: ${type}`,
          date: TODAY,
        },
        ...s.activities,
      ],
    }));
    setForm(false);
    notify("تم حفظ الطلب بنجاح وإضافته إلى السجل");
    setSelected(record.id);
  }
  function addReply() {
    if (!current || !reply.trim()) return;
    const comment = {
      by: personal ? employee.name : "إدارة الموارد البشرية",
      text: reply.trim(),
      date: TODAY,
    };
    update((s) => ({
      ...s,
      records: s.records.map((r) =>
        r.id === current.id
          ? {
              ...r,
              comments: [...(r.comments || []), comment],
              history: [
                ...r.history,
                { date: TODAY, text: "تمت إضافة رد على الطلب" },
              ],
            }
          : r,
      ),
    }));
    setReply("");
    notify("تمت إضافة الرد");
  }
  function toggleStep(r: DomainRecord, key: string) {
    const meta = { ...r.meta, [key]: !r.meta[key] };
    const complete = [
      "تسليم المهام",
      "إرجاع العهد",
      "المراجعة المالية",
      "إخلاء الطرف",
    ].every((k) => meta[k]);
    update((s) => ({
      ...s,
      records: s.records.map((x) =>
        x.id === r.id
          ? {
              ...x,
              meta,
              status: complete ? "مكتمل" : "قيد المعالجة",
              history: [
                ...x.history,
                {
                  date: TODAY,
                  text: `${meta[key] ? "اكتمل" : "أعيد فتح"}: ${key}`,
                },
              ],
            }
          : x,
      ),
    }));
    notify("تم تحديث قائمة إخلاء الطرف");
  }
  const renderFilters = () => (
    <div className="filters">
      <div className="search-field">
        <Search size={17} />
        <input
          aria-label="بحث في السجلات"
          placeholder={
            personal ? "ابحث في سجلاتك..." : "ابحث بالاسم أو الرقم أو النوع..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <select
        aria-label="تصفية حسب الحالة"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option>الكل</option>
        {Array.from(new Set(records.map((r) => r.status))).map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <span className="muted module-result">{filtered.length} سجل</span>
    </div>
  );
  const title = personal
    ? {
        contracts: "عقدي الوظيفي",
        allowances: "بدلاتي ومزاياي",
        bonuses: "مكافآتي",
        attendance: "حضوري وانصرافي",
        advances: "سلفي المالية",
        assets: "عهدي وممتلكاتي",
        evaluations: "تقييم أدائي",
        promotions: "مساري المهني",
        complaints: "شكاواي وملاحظاتي",
        offboarding: "نهاية الخدمة",
      }[kind] || cfg.title
    : cfg.title;
  return (
    <div className={`module-page module-${kind}`}>
      <PageHeader
        eyebrow={cfg.eyebrow}
        title={title}
        description={cfg.description}
        actions={
          personal &&
          [
            "contracts",
            "allowances",
            "bonuses",
            "assets",
            "evaluations",
            "promotions",
            "attendance",
          ].includes(kind) ? undefined : (
            <button className="btn primary" onClick={() => setForm(true)}>
              <Plus size={17} />
              {cfg.action}
            </button>
          )
        }
      />
      {kind === "contracts" && (
        <>
          <div className="grid-3">
            <Stat
              label="العقود المسجلة"
              value={records.length}
              hint="موثقة في ملف الموظف"
              icon={<FileText size={20} />}
            />
            <Stat
              label="عقود سارية"
              value={records.filter((r) => r.status === "نشط").length}
              hint="علاقة عمل مستمرة"
              tone="green"
              icon={<ShieldCheck size={20} />}
            />
            <Stat
              label="تحتاج إلى تجديد"
              value={records.filter((r) => r.status === "ينتهي قريبًا").length}
              hint="راجع تواريخ انتهاء العقود"
              tone="amber"
              icon={<CalendarDays size={20} />}
            />
          </div>
          <Card title="سجل العقود" className="module-spaced">
            {renderFilters()}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>الموظف</th>
                    <th>رقم العقد</th>
                    <th>نوع العقد</th>
                    <th>البداية</th>
                    <th>النهاية</th>
                    <th>الحالة</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => open(r)}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && open(r)}
                    >
                      <td>
                        <Person employee={person(r.employeeId)} />
                      </td>
                      <td>
                        <span dir="ltr" className="module-code">
                          {r.id}
                        </span>
                      </td>
                      <td>{String(r.meta["نوع العقد"] || r.title)}</td>
                      <td>{dateLabel(r.date)}</td>
                      <td>{r.end ? dateLabel(r.end) : "غير محدد المدة"}</td>
                      <td>
                        <Badge>{r.status}</Badge>
                      </td>
                      <td>
                        <button
                          className="icon-btn"
                          aria-label={`عرض عقد ${person(r.employeeId).name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            open(r);
                          }}
                        >
                          <ArrowUpLeft size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!filtered.length && <EmptyState title="لا توجد عقود مطابقة" />}
          </Card>
        </>
      )}
      {kind === "allowances" && (
        <>
          <div className="module-benefit-hero">
            <div className="module-hero-icon">
              <Wallet size={30} />
            </div>
            <div>
              <span>مزايا تصنع فرقًا في يومك</span>
              <h2>تعويضات واضحة، واهتمام بالتفاصيل.</h2>
              <p>السكن والنقل ومزايا العمل، ضمن سياسة الشركة التجريبية.</p>
            </div>
            <strong>
              {cash(sum(records.filter((r) => r.status === "معتمد")))}
              <small>إجمالي البدلات المعتمدة</small>
            </strong>
          </div>
          <div className="grid-3 module-spaced">
            {["سكن", "نقل", "اتصال"].map((type, i) => {
              const rows = records.filter((r) => r.title.includes(type));
              return (
                <Card key={type} className="module-benefit-type">
                  <div className={`module-symbol symbol-${i}`}>
                    <Building2 size={25} />
                  </div>
                  <h3>بدل {type}</h3>
                  <strong>{cash(sum(rows))}</strong>
                  <p>{rows.length} مستفيد · استحقاق شهري</p>
                </Card>
              );
            })}
          </div>
          <Card title="تفاصيل البدلات" className="module-spaced">
            {renderFilters()}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>المستفيد</th>
                    <th>نوع البدل</th>
                    <th>المبلغ</th>
                    <th>التكرار</th>
                    <th>تاريخ الاستحقاق</th>
                    <th>الحالة</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Person employee={person(r.employeeId)} />
                      </td>
                      <td>{r.title}</td>
                      <td className="module-amount">{cash(r.amount)}</td>
                      <td>{String(r.meta["التكرار"] || "شهري")}</td>
                      <td>{dateLabel(r.date)}</td>
                      <td>
                        <Badge>{r.status}</Badge>
                      </td>
                      <td>
                        <button
                          className="icon-btn"
                          aria-label="تفاصيل البدل"
                          onClick={() => open(r)}
                        >
                          <ArrowUpLeft size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!filtered.length && <EmptyState title="لا توجد بدلات مطابقة" />}
          </Card>
        </>
      )}
      {kind === "bonuses" && (
        <>
          <div className="grid-3">
            <Stat
              label="إجمالي المكافآت"
              value={cash(sum(records))}
              hint={`${records.length} مكافأة موثقة`}
              icon={<Gift size={20} />}
            />
            <Stat
              label="مكافآت معتمدة"
              value={cash(
                sum(
                  records.filter(
                    (r) => r.status === "معتمد" || r.status === "مصروف",
                  ),
                ),
              )}
              hint="تقديرًا للجهود والإنجاز"
              tone="green"
            />
            <Stat
              label="بانتظار الاعتماد"
              value={
                records.filter((r) => r.status === "بانتظار الموافقة").length
              }
              hint="قرارات بانتظار المراجعة"
              tone="amber"
            />
          </div>
          <Card className="module-spaced">{renderFilters()}</Card>
          <div className="module-reward-grid module-spaced">
            {filtered.map((r) => (
              <Card key={r.id} className="module-reward">
                <div className="module-card-top">
                  <div className="module-reward-icon">
                    <Gift size={23} />
                  </div>
                  <Badge>{r.status}</Badge>
                </div>
                <p className="eyebrow">{dateLabel(r.date)}</p>
                <h3>{r.title}</h3>
                <p className="module-description">{r.description}</p>
                <strong className="module-reward-amount">
                  {cash(r.amount)}
                </strong>
                <div className="module-card-bottom">
                  <Person employee={person(r.employeeId)} />
                  <button
                    className="icon-btn"
                    onClick={() => open(r)}
                    aria-label="تفاصيل المكافأة"
                  >
                    <ArrowUpLeft size={18} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
          {!filtered.length && <EmptyState title="لا توجد مكافآت مطابقة" />}
        </>
      )}
      {kind === "attendance" && (
        <>
          <div className="grid-4">
            <Stat
              label={personal ? "الالتزام لآخر 30 يومًا" : "حضور اليوم"}
              value={
                personal
                  ? `${summary.commitment}%`
                  : todayLogs.filter(
                      (a) => a.status === "حاضر" || a.status === "متأخر",
                    ).length
              }
              hint={
                personal
                  ? `${summary.attended - summary.late} يوم التزام من ${summary.days} يومًا`
                  : "من إجمالي موظفي الشركة"
              }
              tone="green"
              icon={<CheckCircle2 size={20} />}
            />
            <Stat
              label="التأخير"
              value={
                personal
                  ? `${summary.late} يوم`
                  : todayLogs.filter((a) => a.status === "متأخر").length
              }
              hint="حالات التأخير المسجلة"
              tone="amber"
              icon={<Clock3 size={20} />}
            />
            <Stat
              label="الغياب"
              value={
                personal
                  ? summary.absent
                  : todayLogs.filter((a) => a.status === "غائب").length
              }
              hint={
                personal ? "حضور منتظم خلال الفترة" : "تحتاج لمراجعة المشرف"
              }
              tone="red"
            />
            <Stat
              label="العمل الإضافي"
              value={`${(personal ? summary.logs : todayLogs).reduce((n, a) => n + a.overtime, 0)} ساعات`}
              hint="ساعات تجريبية مسجلة"
              icon={<TrendingUp size={20} />}
            />
          </div>
          <div className="module-attendance-week module-spaced">
            <div>
              <span className="eyebrow">أسبوع العمل</span>
              <h3>حضورك يصنع الأثر</h3>
              <p>8 – 12 نوفمبر 2026</p>
            </div>
            {["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"].map(
              (day, i) => {
                const date = `2026-11-${String(8 + i).padStart(2, "0")}`;
                const log = state.attendance.find(
                  (a) => a.employeeId === employee.id && a.date === date,
                );
                return (
                  <button
                    key={day}
                    className={`module-day ${log?.status === "متأخر" ? "late" : ""}`}
                    onClick={() => {
                      setAttendanceDay(date);
                      notify(`تم عرض سجل ${day}`);
                    }}
                  >
                    <small>{day}</small>
                    <strong>{8 + i}</strong>
                    <CheckCircle2 size={20} />
                    <span>
                      {personal
                        ? log?.checkIn || "—"
                        : `${state.attendance.filter((a) => a.date === date && ["حاضر", "متأخر"].includes(a.status)).length} حاضر`}
                    </span>
                  </button>
                );
              },
            )}
          </div>
          <Card
            title={personal ? "سجل حضوري" : "سجل حضور الفريق"}
            className="module-spaced"
          >
            <div className="filters">
              <div className="search-field">
                <Search size={17} />
                <input
                  placeholder="ابحث عن موظف..."
                  aria-label="البحث في الحضور"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <input
                type="date"
                aria-label={personal ? "السجل حتى تاريخ" : "تاريخ الحضور"}
                value={attendanceDay}
                onChange={(e) => setAttendanceDay(e.target.value)}
              />
              <span className="muted">الدوام الرسمي: 08:00 – 16:00</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>الموظف</th>
                    <th>التاريخ</th>
                    <th>الدخول</th>
                    <th>الخروج</th>
                    <th>ساعات العمل</th>
                    <th>الحالة</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visibleLogs.map((a) => {
                    const e = person(a.employeeId);
                    return (
                      <tr key={a.id}>
                        <td>
                          <Person employee={e} />
                        </td>
                        <td>{dateLabel(a.date)}</td>
                        <td dir="ltr">{a.checkIn}</td>
                        <td dir="ltr">{a.checkOut}</td>
                        <td>{workDuration(a)}</td>
                        <td>
                          <Badge>{a.status}</Badge>
                        </td>
                        <td>
                          <button
                            className="icon-btn"
                            aria-label="تفاصيل الحضور"
                            onClick={() => {
                              setAttEmployee(e);
                              setAttLog(a);
                            }}
                          >
                            <ArrowUpLeft size={17} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!visibleLogs.length && (
              <EmptyState
                title="لا توجد سجلات حضور مطابقة"
                description="اختر يومًا يتضمن بيانات أو غيّر معايير البحث."
              />
            )}
          </Card>
        </>
      )}
      {kind === "advances" && (
        <>
          <div className="grid-3">
            <Stat
              label="إجمالي السلف"
              value={cash(sum(records))}
              hint={`${records.length} طلب سلفة`}
              icon={<Wallet size={20} />}
            />
            <Stat
              label="المسدد حتى الآن"
              value={cash(
                records.reduce((n, r) => n + Number(r.meta["المسدد"] || 0), 0),
              )}
              hint="أقساط مسجلة في النموذج"
              tone="green"
            />
            <Stat
              label="بانتظار الموافقة"
              value={
                records.filter((r) => r.status === "بانتظار الموافقة").length
              }
              hint="تتم المراجعة من الموارد البشرية"
              tone="amber"
            />
          </div>
          <div className="module-info-banner module-spaced">
            <ShieldCheck size={20} />
            <p>
              تُعرض مبالغ السلف وخطة السداد للتوضيح، دون ربط مالي أو استقطاع
              فعلي.
            </p>
          </div>
          <Card className="module-spaced" title="الطلبات وخطط السداد">
            {renderFilters()}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>الموظف</th>
                    <th>السلفة</th>
                    <th>القسط الشهري</th>
                    <th>المسدد / الإجمالي</th>
                    <th>المتبقي</th>
                    <th>الحالة</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const paid = Number(r.meta["المسدد"] || 0);
                    return (
                      <tr key={r.id}>
                        <td>
                          <Person employee={person(r.employeeId)} />
                        </td>
                        <td>
                          <strong>{cash(r.amount)}</strong>
                          <small className="module-cell-sub">
                            {dateLabel(r.date)}
                          </small>
                        </td>
                        <td>
                          {cash(Number(r.meta["القسط الشهري"] || r.amount / 6))}
                        </td>
                        <td>
                          <div className="module-payment">
                            <span>{cash(paid)}</span>
                            <Progress
                              value={r.amount ? (paid / r.amount) * 100 : 0}
                            />
                          </div>
                        </td>
                        <td>{cash(r.amount - paid)}</td>
                        <td>
                          <Badge>{r.status}</Badge>
                        </td>
                        <td>
                          <button
                            className="icon-btn"
                            aria-label="تفاصيل السلفة"
                            onClick={() => open(r)}
                          >
                            <ArrowUpLeft size={17} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!filtered.length && (
              <EmptyState
                title="لا توجد سلف مطابقة"
                action={
                  <button className="btn primary" onClick={() => setForm(true)}>
                    طلب سلفة جديدة
                  </button>
                }
              />
            )}
          </Card>
        </>
      )}
      {kind === "assets" && (
        <>
          <div className="grid-3">
            <Stat
              label="إجمالي العهد"
              value={records.length}
              hint="أجهزة وممتلكات موثقة"
              icon={<Package size={20} />}
            />
            <Stat
              label="عهد مسلّمة"
              value={records.filter((r) => r.status === "مسلّمة").length}
              hint="بحوزة الموظفين"
              tone="green"
            />
            <Stat
              label="قيمة العهد"
              value={cash(sum(records))}
              hint="قيمة تقديرية تجريبية"
            />
          </div>
          <Card className="module-spaced">{renderFilters()}</Card>
          <div className="module-asset-grid module-spaced">
            {filtered.map((r) => (
              <Card key={r.id} className="module-asset">
                <div className="module-card-top">
                  <Badge>{r.status}</Badge>
                  <span className="module-code" dir="ltr">
                    {r.id}
                  </span>
                </div>
                <div className="module-device-art">
                  {r.title.includes("هاتف") ? (
                    <Package size={60} strokeWidth={1.2} />
                  ) : (
                    <Laptop size={78} strokeWidth={1.15} />
                  )}
                </div>
                <h3>{r.title}</h3>
                <p className="module-serial" dir="ltr">
                  {String(r.meta["الرقم التسلسلي"] || r.id)}
                </p>
                <div className="module-asset-meta">
                  <span>
                    تاريخ التسليم<strong>{dateLabel(r.date)}</strong>
                  </span>
                  <span>
                    الحالة الفنية
                    <strong>{String(r.meta["حالة الجهاز"] || "جيد")}</strong>
                  </span>
                </div>
                <div className="module-card-bottom">
                  <Person employee={person(r.employeeId)} />
                  <button
                    className="icon-btn"
                    aria-label="تفاصيل العهدة"
                    onClick={() => open(r)}
                  >
                    <ArrowUpLeft size={18} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
          {!filtered.length && <EmptyState title="لا توجد عهد مطابقة" />}
        </>
      )}
      {kind === "evaluations" && (
        <>
          <div className="module-eval-banner">
            <div>
              <span className="eyebrow">دورة التقييم · الربع الرابع 2026</span>
              <h2>أهداف واضحة. نمو مستمر.</h2>
              <p>حوارات بنّاءة تقرّب الفريق من أفضل إمكاناته.</p>
            </div>
            <div className="module-eval-stars">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={29}
                  fill={i < 5 ? "currentColor" : "none"}
                />
              ))}
            </div>
          </div>
          <div className="grid-3 module-spaced">
            <Stat
              label="متوسط التقييم"
              value={`${records.length ? (records.reduce((n, r) => n + Number(r.meta["التقييم"] || 4.5), 0) / records.length).toFixed(1) : "—"} / 5`}
              hint="من التقييمات المسجلة"
              icon={<Star size={20} />}
            />
            <Stat
              label="التقييمات المكتملة"
              value={
                records.filter(
                  (r) => r.status === "مكتمل" || r.status === "معتمد",
                ).length
              }
              hint={`من أصل ${records.length} تقييمًا`}
              tone="green"
            />
            <Stat
              label="بانتظار المراجعة"
              value={
                records.filter((r) => r.status === "بانتظار الموافقة").length
              }
              hint="جلسات مراجعة مع المدير المباشر"
              tone="amber"
            />
          </div>
          <Card className="module-spaced">{renderFilters()}</Card>
          <div className="module-eval-grid module-spaced">
            {filtered.map((r) => (
              <Card key={r.id} className="module-eval-card">
                <div className="module-card-top">
                  <Person employee={person(r.employeeId)} />
                  <Badge>{r.status}</Badge>
                </div>
                <div className="module-rating">
                  <strong>
                    {Number(r.meta["التقييم"] || 4.5).toFixed(1)}
                    <small>/5</small>
                  </strong>
                  <div>
                    <span>التقييم العام</span>
                    <p>
                      {Number(r.meta["التقييم"] || 4.5) >= 4.5
                        ? "أداء متميز"
                        : "يفوق التوقعات"}
                    </p>
                  </div>
                </div>
                <div className="module-goal-label">
                  <span>إنجاز الأهداف</span>
                  <strong>{Number(r.meta["إنجاز الأهداف"] || 86)}%</strong>
                </div>
                <Progress value={Number(r.meta["إنجاز الأهداف"] || 86)} />
                <div className="module-card-bottom">
                  <span className="muted">
                    {String(r.meta["الدورة"] || "الربع الرابع 2026")}
                  </span>
                  <button
                    className="btn secondary small"
                    onClick={() => open(r)}
                  >
                    عرض التقييم
                    <ChevronLeft size={15} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
          {!filtered.length && <EmptyState title="لا توجد تقييمات مطابقة" />}
        </>
      )}
      {kind === "promotions" && (
        <>
          <div className="grid-3">
            <Stat
              label="قرارات الترقية"
              value={records.length}
              hint="فرص نمو وتقدير للإنجاز"
              icon={<TrendingUp size={20} />}
            />
            <Stat
              label="ترقيات معتمدة"
              value={
                records.filter(
                  (r) => r.status === "معتمد" || r.status === "مكتمل",
                ).length
              }
              hint="خطوات جديدة في المسار المهني"
              tone="green"
            />
            <Stat
              label="طلبات قيد المراجعة"
              value={
                records.filter((r) => r.status === "بانتظار الموافقة").length
              }
              hint="بانتظار قرار الإدارة"
              tone="amber"
            />
          </div>
          <Card className="module-spaced">{renderFilters()}</Card>
          <div className="module-career-list module-spaced">
            {filtered.map((r) => (
              <Card key={r.id} className="module-career">
                <div className="module-career-date">
                  <TrendingUp size={23} />
                  <strong>{dateLabel(r.date)}</strong>
                  <Badge>{r.status}</Badge>
                </div>
                <div className="module-career-body">
                  <Person employee={person(r.employeeId)} />
                  <h3>{r.title}</h3>
                  <div className="module-career-transition">
                    <div>
                      <span>المرحلة السابقة</span>
                      <strong>
                        {String(r.meta["المسمى السابق"] || "أخصائي")}
                      </strong>
                      <small>
                        {String(r.meta["الدرجة السابقة"] || "الدرجة الخامسة")}
                      </small>
                    </div>
                    <ArrowUpLeft size={22} />
                    <div>
                      <span>المرحلة الجديدة</span>
                      <strong>
                        {String(r.meta["المسمى الجديد"] || r.title)}
                      </strong>
                      <small>
                        {String(r.meta["الدرجة الجديدة"] || "الدرجة السادسة")}
                      </small>
                    </div>
                  </div>
                </div>
                <button className="btn secondary small" onClick={() => open(r)}>
                  تفاصيل القرار
                  <ArrowUpLeft size={16} />
                </button>
              </Card>
            ))}
          </div>
          {!filtered.length && <EmptyState title="لا توجد ترقيات مطابقة" />}
        </>
      )}
      {kind === "complaints" && (
        <>
          <div className="module-info-banner module-private">
            <ShieldCheck size={22} />
            <div>
              <strong>مساحتك للإصغاء والتحسين</strong>
              <p>
                {personal
                  ? "تعرض هذه الصفحة طلباتك الشخصية فقط. يطّلع فريق المعالجة على محتوى الطلب ضمن سيناريو العرض."
                  : "تُدار الملاحظات بمسؤولية، مع إظهار جهة المعالجة وسجل التواصل لكل طلب."}{" "}
                التبديل بين الأدوار للعرض التجريبي فقط.
              </p>
            </div>
          </div>
          <div className="grid-3 module-spaced">
            <Stat
              label="إجمالي الطلبات"
              value={records.length}
              hint="ملاحظات تصنع بيئة عمل أفضل"
              icon={<MessageSquare size={20} />}
            />
            <Stat
              label="قيد المتابعة"
              value={
                records.filter(
                  (r) =>
                    r.status === "قيد المعالجة" ||
                    r.status === "بانتظار الموافقة",
                ).length
              }
              hint="يعمل عليها الفريق المختص"
              tone="amber"
            />
            <Stat
              label="طلبات أُغلقت"
              value={records.filter((r) => r.status === "مكتمل").length}
              hint="تمت المعالجة وتوثيق النتيجة"
              tone="green"
            />
          </div>
          <Card
            className="module-spaced"
            title={
              personal ? "طلباتي وسجل المتابعة" : "صندوق الملاحظات والشكاوى"
            }
          >
            {renderFilters()}
            <div className="module-complaint-list">
              {filtered.map((r) => (
                <button
                  key={r.id}
                  className="module-complaint-row"
                  onClick={() => open(r)}
                >
                  <div className="module-complaint-icon">
                    <MessageSquare size={21} />
                  </div>
                  <div className="module-complaint-content">
                    <div>
                      <span className="module-code" dir="ltr">
                        {r.id}
                      </span>
                      <span
                        className={`module-priority ${["عالية", "مرتفعة"].includes(String(r.meta["الأولوية"])) ? "high" : ""}`}
                      >
                        {String(r.meta["الأولوية"] || "متوسطة")}
                      </span>
                    </div>
                    <h3>{r.title}</h3>
                    <p>
                      {personal
                        ? String(r.meta["جهة المعالجة"] || "الموارد البشرية")
                        : person(r.employeeId).name}{" "}
                      · {dateLabel(r.date)}
                    </p>
                  </div>
                  <div className="module-complaint-end">
                    <Badge>{r.status}</Badge>
                    <span>{r.comments?.length || 0} ردود</span>
                  </div>
                  <ChevronLeft size={19} />
                </button>
              ))}
            </div>
            {!filtered.length && (
              <EmptyState
                title="لا توجد طلبات مطابقة"
                action={
                  <button className="btn primary" onClick={() => setForm(true)}>
                    قدّم ملاحظتك الأولى
                  </button>
                }
              />
            )}
          </Card>
        </>
      )}
      {kind === "offboarding" && (
        <>
          <div className="module-info-banner">
            <AlertCircle size={21} />
            <p>
              القيم والمستحقات النهائية في هذا النموذج تصور للواجهة فقط، ولا
              تمثل حسابًا قانونيًا أو تسوية مالية فعلية.
            </p>
          </div>
          <div className="grid-3 module-spaced">
            <Stat
              label="حالات نهاية الخدمة"
              value={records.length}
              hint="إجراءات موثقة ومنظمة"
              icon={<FileText size={20} />}
            />
            <Stat
              label="إخلاء طرف مكتمل"
              value={records.filter((r) => r.status === "مكتمل").length}
              hint="اكتملت خطوات المغادرة"
              tone="green"
            />
            <Stat
              label="قيد الإجراء"
              value={
                records.filter(
                  (r) => r.status !== "مكتمل" && r.status !== "مرفوض",
                ).length
              }
              hint="متابعة المهام والمستحقات"
              tone="amber"
            />
          </div>
          <Card className="module-spaced">{renderFilters()}</Card>
          <div className="module-offboarding-grid module-spaced">
            {filtered.map((r) => {
              const steps = [
                "تسليم المهام",
                "إرجاع العهد",
                "المراجعة المالية",
                "إخلاء الطرف",
              ];
              const done = steps.filter((k) => r.meta[k]).length;
              return (
                <Card key={r.id} className="module-offboarding">
                  <div className="module-card-top">
                    <Person employee={person(r.employeeId)} />
                    <Badge>{r.status}</Badge>
                  </div>
                  <h3>{r.title}</h3>
                  <p className="muted">
                    آخر يوم عمل:{" "}
                    {dateLabel(
                      r.end || String(r.meta["آخر يوم عمل"] || r.date),
                    )}
                  </p>
                  <div className="module-off-step-summary">
                    {steps.map((s, i) => (
                      <span
                        key={s}
                        className={r.meta[s] ? "done" : ""}
                        title={s}
                      >
                        {r.meta[s] ? <Check size={17} /> : i + 1}
                      </span>
                    ))}
                  </div>
                  <div className="module-goal-label">
                    <span>اكتمال الإجراءات</span>
                    <strong>{done} / 4</strong>
                  </div>
                  <Progress value={done * 25} />
                  <button
                    className="btn secondary module-full"
                    onClick={() => open(r)}
                  >
                    متابعة إخلاء الطرف
                    <ArrowUpLeft size={16} />
                  </button>
                </Card>
              );
            })}
          </div>
          {!filtered.length && (
            <EmptyState
              title="لا توجد حالات نهاية خدمة"
              description="لا يوجد طلب نشط لهذا الموظف. يمكنك تقديم طلب تجريبي ومتابعة إجراءاته."
              action={
                <button className="btn primary" onClick={() => setForm(true)}>
                  تقديم طلب
                </button>
              }
            />
          )}
        </>
      )}
      {current && (
        <Modal
          title={
            kind === "complaints" ? "تفاصيل الطلب والمحادثة" : current.title
          }
          onClose={() => setSelected(null)}
          wide
        >
          <div className="module-detail-person">
            <Person employee={person(current.employeeId)} />
            <div>
              <span dir="ltr" className="module-code">
                {current.id}
              </span>
              <Badge>{current.status}</Badge>
            </div>
          </div>
          <Tabs
            items={
              kind === "contracts"
                ? ["نظرة عامة", "المرفقات", "التنبيهات", "سجل الإجراءات"]
                : kind === "complaints"
                  ? ["نظرة عامة", "المحادثة", "سجل الإجراءات"]
                  : ["نظرة عامة", "سجل الإجراءات"]
            }
            value={tab}
            onChange={setTab}
          />
          {tab === "نظرة عامة" && (
            <>
              <p className="module-detail-description">{current.description}</p>
              {current.amount > 0 && (
                <div className="module-detail-amount">
                  <span>
                    {kind === "advances"
                      ? "مبلغ السلفة"
                      : kind === "assets"
                        ? "القيمة التقديرية"
                        : kind === "contracts"
                          ? "الراتب الأساسي المتفق عليه"
                          : "المبلغ"}
                  </span>
                  <strong>{cash(current.amount)}</strong>
                </div>
              )}
              <div className="detail-grid">
                <div>
                  <small>تاريخ الطلب / السريان</small>
                  <strong>{dateLabel(current.date)}</strong>
                </div>
                {current.end && (
                  <div>
                    <small>تاريخ الانتهاء</small>
                    <strong>{dateLabel(current.end)}</strong>
                  </div>
                )}
              </div>
              <Meta record={current} />
              {kind === "advances" && (
                <div className="module-detail-panel">
                  <h3>خطة السداد التجريبية</h3>
                  <Progress
                    value={
                      current.amount
                        ? (Number(current.meta["المسدد"] || 0) /
                            current.amount) *
                          100
                        : 0
                    }
                  />
                  <div className="module-goal-label">
                    <span>
                      المسدد: {cash(Number(current.meta["المسدد"] || 0))}
                    </span>
                    <strong>
                      المتبقي:{" "}
                      {cash(
                        current.amount - Number(current.meta["المسدد"] || 0),
                      )}
                    </strong>
                  </div>
                  <p className="muted">
                    {Number(current.meta["عدد الأقساط"] || 6)} أقساط · تبدأ بعد
                    اعتماد الطلب
                  </p>
                </div>
              )}
              {kind === "evaluations" && (
                <div className="module-detail-panel">
                  <h3>المهارات والأهداف</h3>
                  {[
                    [
                      "تحقيق مستهدفات العمل",
                      Number(current.meta["إنجاز الأهداف"] || 86),
                    ],
                    ["التعاون والعمل الجماعي", 94],
                    ["المبادرة وحل المشكلات", 88],
                    ["جودة التنفيذ", 92],
                  ].map(([label, value]) => (
                    <div className="module-skill" key={label}>
                      <div>
                        <span>{label}</span>
                        <strong>{value}%</strong>
                      </div>
                      <Progress value={Number(value)} />
                    </div>
                  ))}
                  <div className="module-eval-note">
                    <MessageSquare size={19} />
                    <p>
                      أداء مميز ومبادرة واضحة. نوصي بالتركيز على تطوير مهارات
                      القيادة وتبادل الخبرات مع الفريق خلال الدورة المقبلة.
                    </p>
                  </div>
                </div>
              )}
              {kind === "offboarding" && (
                <div className="module-detail-panel">
                  <h3>قائمة إخلاء الطرف</h3>
                  {[
                    "تسليم المهام",
                    "إرجاع العهد",
                    "المراجعة المالية",
                    "إخلاء الطرف",
                  ].map((step) => (
                    <label className="module-checklist" key={step}>
                      <input
                        type="checkbox"
                        checked={Boolean(current.meta[step])}
                        disabled={personal || current.status === "مرفوض"}
                        onChange={() => toggleStep(current, step)}
                      />
                      <span>{step}</span>
                      <small>
                        {current.meta[step] ? "مكتمل" : "بانتظار الإجراء"}
                      </small>
                    </label>
                  ))}
                  <p className="muted">
                    تصور تسوية المستحقات: {cash(current.amount)} — للمراجعة فقط،
                    دون احتساب قانوني.
                  </p>
                </div>
              )}
              {kind === "assets" && (
                <div className="module-detail-panel">
                  <div className="module-document-preview">
                    <Laptop size={44} />
                    <div>
                      <h3>محضر استلام عهدة تجريبي</h3>
                      <p>
                        أقر باستلام العهدة المذكورة، وأتعهد بالمحافظة عليها
                        وإعادتها عند الطلب.
                      </p>
                      <small>
                        {person(current.employeeId).name} ·{" "}
                        {dateLabel(current.date)}
                      </small>
                    </div>
                  </div>
                  {!personal && current.status === "مسلّمة" && (
                    <button
                      className="btn secondary"
                      onClick={() => change(current, "مُعادة")}
                    >
                      <CheckCircle2 size={17} />
                      تأكيد إرجاع العهدة
                    </button>
                  )}
                </div>
              )}
              {kind === "promotions" && (
                <div className="module-career-transition module-detail-panel">
                  <div>
                    <span>الراتب السابق</span>
                    <strong>
                      {cash(
                        Number(
                          current.meta["الراتب السابق"] ||
                            person(current.employeeId).base,
                        ),
                      )}
                    </strong>
                  </div>
                  <TrendingUp size={25} />
                  <div>
                    <span>الراتب بعد الترقية</span>
                    <strong>
                      {cash(
                        Number(current.meta["الراتب الجديد"] || current.amount),
                      )}
                    </strong>
                  </div>
                </div>
              )}
              {kind === "contracts" && (
                <div className="module-document-preview module-detail-panel">
                  <FileText size={35} />
                  <div>
                    <h3>ملخص العقد الوظيفي</h3>
                    <p>
                      بين {state.settings.company} والموظف{" "}
                      {person(current.employeeId).name}. المسمى:{" "}
                      {person(current.employeeId).job}. مكان العمل:{" "}
                      {person(current.employeeId).branch}. يخضع التجديد لمراجعة
                      الطرفين.
                    </p>
                    <small>
                      مستند تجريبي للعرض، غير صالح للتوقيع أو الاستخدام النظامي.
                    </small>
                  </div>
                </div>
              )}
              {kind === "complaints" && (
                <button
                  className="btn secondary"
                  onClick={() => setTab("المحادثة")}
                >
                  <MessageSquare size={17} />
                  عرض المحادثة وإضافة رد
                </button>
              )}
              {!personal && current.status === "بانتظار الموافقة" && (
                <div className="form-actions module-review-actions">
                  <button
                    className="btn primary"
                    onClick={() =>
                      change(
                        current,
                        kind === "complaints" ? "قيد المعالجة" : "معتمد",
                      )
                    }
                  >
                    <Check size={17} />
                    {kind === "complaints" ? "بدء المعالجة" : "اعتماد الطلب"}
                  </button>
                  <button
                    className="btn danger"
                    onClick={() => change(current, "مرفوض")}
                  >
                    <X size={17} />
                    رفض الطلب
                  </button>
                </div>
              )}
              {!personal &&
                kind === "complaints" &&
                current.status === "قيد المعالجة" && (
                  <div className="form-actions">
                    <button
                      className="btn primary"
                      onClick={() => change(current, "مكتمل")}
                    >
                      <CheckCircle2 size={17} />
                      إغلاق الطلب بعد المعالجة
                    </button>
                  </div>
                )}
              {!personal &&
                kind === "contracts" &&
                current.status === "ينتهي قريبًا" && (
                  <button
                    className="btn primary"
                    onClick={() => {
                      update((s) => ({
                        ...s,
                        records: s.records.map((r) =>
                          r.id === current.id
                            ? {
                                ...r,
                                status: "نشط",
                                end: "2027-11-30",
                                history: [
                                  ...r.history,
                                  {
                                    date: TODAY,
                                    text: "تم تجديد العقد لمدة عام",
                                  },
                                ],
                              }
                            : r,
                        ),
                      }));
                      notify("تم تجديد العقد التجريبي حتى نوفمبر 2027");
                    }}
                  >
                    <RefreshCw size={17} />
                    تجديد العقد لعام
                  </button>
                )}
            </>
          )}
          {tab === "سجل الإجراءات" && <History record={current} />}
          {tab === "المحادثة" && (
            <div className="module-conversation">
              <div className="module-message">
                <strong>{person(current.employeeId).name}</strong>
                <p>{current.description}</p>
                <small>{dateLabel(current.date)}</small>
              </div>
              {current.comments?.map((comment, i) => (
                <div
                  key={i}
                  className={`module-message ${comment.by !== person(current.employeeId).name ? "staff" : ""}`}
                >
                  <strong>{comment.by}</strong>
                  <p>{comment.text}</p>
                  <small>{dateLabel(comment.date)}</small>
                </div>
              ))}
              <div className="module-reply">
                <textarea
                  aria-label="نص الرد"
                  placeholder="اكتب ردك على الطلب..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={3}
                />
                <button
                  className="btn primary"
                  disabled={!reply.trim()}
                  onClick={addReply}
                >
                  <Send size={17} />
                  إرسال الرد
                </button>
              </div>
            </div>
          )}
          {tab === "المرفقات" && (
            <div className="module-document-preview">
              <FileText size={43} />
              <div>
                <h3>نسخة العقد — نموذج توضيحي</h3>
                <p>
                  عقد الموظف {person(current.employeeId).name} · {current.id}
                </p>
                <p>
                  تاريخ البداية: {dateLabel(current.date)} · النهاية:{" "}
                  {current.end ? dateLabel(current.end) : "غير محددة"}
                </p>
                <small>
                  المعاينة المرفقة توضيحية ولا تحتوي مستندًا حقيقيًا.
                </small>
              </div>
            </div>
          )}
          {tab === "التنبيهات" && (
            <div className="module-info-banner">
              <CalendarDays size={22} />
              <div>
                <strong>
                  {current.status === "ينتهي قريبًا"
                    ? "حان وقت مراجعة التجديد"
                    : "متابعة العقد"}
                </strong>
                <p>
                  {current.end
                    ? `تاريخ الانتهاء المسجل: ${dateLabel(current.end)}. تتم مراجعة التجديد مع الموظف والإدارة قبل انتهاء العقد.`
                    : "هذا العقد غير محدد المدة. يمكنك متابعة تغيراته من سجل الإجراءات."}
                </p>
              </div>
            </div>
          )}
        </Modal>
      )}
      {attEmployee && (
        <Modal title="تفاصيل الحضور" onClose={() => setAttEmployee(null)}>
          <div className="module-detail-person">
            <Person employee={attEmployee} />
            <Badge>سجل تجريبي</Badge>
          </div>
          <div className="grid-2 module-spaced">
            <Stat
              label="الالتزام لآخر 30 يومًا"
              value={`${getAttendanceSummary(state, attEmployee.id).commitment}%`}
              hint={`${getAttendanceSummary(state, attEmployee.id).attended - getAttendanceSummary(state, attEmployee.id).late} يوم التزام من ${getAttendanceSummary(state, attEmployee.id).days} يومًا`}
              tone="green"
            />
            <Stat
              label="إجمالي العمل الإضافي"
              value={`${getAttendanceSummary(state, attEmployee.id).logs.reduce((n, a) => n + a.overtime, 0)} ساعات`}
              hint="خلال آخر 30 يومًا"
            />
          </div>
          <div className="module-detail-panel">
            <h3>ملخص اليوم · {dateLabel(attLog?.date || attendanceDay)}</h3>
            <div className="module-meta">
              <div>
                <span>وقت الدخول</span>
                <strong dir="ltr">{attLog?.checkIn || "—"}</strong>
              </div>
              <div>
                <span>وقت الخروج</span>
                <strong dir="ltr">{attLog?.checkOut || "—"}</strong>
              </div>
              <div>
                <span>مدة العمل</span>
                <strong>{workDuration(attLog)}</strong>
              </div>
              <div>
                <span>التأخير خلال الفترة</span>
                <strong>
                  {getAttendanceSummary(state, attEmployee.id).late} يوم
                </strong>
              </div>
            </div>
            <p className="muted">
              سجل الحضور توضيحي ولا يرتبط بجهاز بصمة أو نظام تتبع فعلي.
            </p>
          </div>
        </Modal>
      )}
      {form && (
        <Modal title={cfg.action} onClose={() => setForm(false)}>
          {kind === "attendance" ? (
            <form onSubmit={submit} className="module-form">
              <div className="module-info-banner">
                <Clock3 size={20} />
                <p>
                  تسجيل تجريبي أو تعديل سجل يوم موجود. سيُحدّث ملخص حضور الموظف
                  عند حفظه.
                </p>
              </div>
              <div className="form-grid">
                <Field label="الموظف">
                  <select name="employeeId" defaultValue={employee.id}>
                    {state.employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="التاريخ">
                  <input
                    type="date"
                    name="date"
                    defaultValue={attendanceDay}
                    required
                  />
                </Field>
                <Field label="الحالة">
                  <select name="attendanceStatus">
                    <option>حاضر</option>
                    <option>متأخر</option>
                    <option>غائب</option>
                    <option>في إجازة</option>
                  </select>
                </Field>
                <Field label="وقت الدخول">
                  <input
                    type="time"
                    name="checkIn"
                    defaultValue="08:00"
                    required
                  />
                </Field>
                <Field label="وقت الخروج">
                  <input
                    type="time"
                    name="checkOut"
                    defaultValue="16:00"
                    required
                  />
                </Field>
              </div>
              <div className="form-actions">
                <button className="btn primary" type="submit">
                  <Check size={17} />
                  حفظ سجل الحضور
                </button>
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => setForm(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={submit} className="module-form">
              <div className="module-info-banner">
                <FileText size={19} />
                <p>
                  سيُحفظ هذا الطلب في بيانات العرض المحلية، ويمكن متابعته من
                  الأدوار الأخرى.
                </p>
              </div>
              <div className="form-grid">
                {!personal && (
                  <Field label="الموظف">
                    <select
                      name="employeeId"
                      required
                      defaultValue={employee.id}
                    >
                      {state.employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
                <Field
                  label={
                    kind === "complaints"
                      ? "موضوع الشكوى"
                      : kind === "assets"
                        ? "اسم العهدة"
                        : kind === "promotions"
                          ? "المسمى الجديد"
                          : "نوع الطلب / العنوان"
                  }
                >
                  {kind === "contracts" ? (
                    <select name="title" required>
                      <option>عقد محدد المدة</option>
                      <option>عقد غير محدد المدة</option>
                      <option>عقد جزئي</option>
                    </select>
                  ) : kind === "offboarding" ? (
                    <select name="title" required>
                      <option>استقالة</option>
                      <option>انتهاء عقد</option>
                      <option>إخلاء طرف</option>
                    </select>
                  ) : kind === "allowances" ? (
                    <select name="title" required>
                      <option>بدل سكن</option>
                      <option>بدل نقل</option>
                      <option>بدل اتصال</option>
                    </select>
                  ) : (
                    <input
                      name="title"
                      required
                      placeholder={
                        kind === "complaints"
                          ? "عنوان واضح يساعدنا على فهم طلبك"
                          : "اكتب عنوانًا واضحًا"
                      }
                      maxLength={100}
                    />
                  )}
                </Field>
                {!["complaints", "offboarding", "evaluations"].includes(
                  kind,
                ) && (
                  <Field
                    label={
                      kind === "promotions"
                        ? "الراتب الجديد"
                        : kind === "assets"
                          ? "القيمة التقديرية"
                          : "المبلغ"
                    }
                  >
                    <input
                      name="amount"
                      type="number"
                      min="1"
                      max="1000000"
                      required
                      placeholder="0"
                    />
                  </Field>
                )}
                <Field
                  label={
                    kind === "offboarding"
                      ? "تاريخ المغادرة المقترح"
                      : "التاريخ"
                  }
                >
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={TODAY}
                  />
                </Field>
                {kind === "contracts" && (
                  <Field label="تاريخ نهاية العقد">
                    <input
                      name="end"
                      type="date"
                      min={TODAY}
                      required
                      defaultValue="2027-11-14"
                    />
                  </Field>
                )}
                {kind === "advances" && (
                  <Field label="عدد الأقساط">
                    <select name="installments">
                      <option value="3">3 أقساط</option>
                      <option value="6">6 أقساط</option>
                      <option value="12">12 قسطًا</option>
                    </select>
                  </Field>
                )}
                {kind === "complaints" && (
                  <Field label="الأولوية">
                    <select name="priority">
                      <option>متوسطة</option>
                      <option>عالية</option>
                      <option>منخفضة</option>
                    </select>
                  </Field>
                )}
                {kind === "assets" && (
                  <Field label="الرقم التسلسلي">
                    <input
                      name="serial"
                      required
                      placeholder="أدخل الرقم التسلسلي"
                    />
                  </Field>
                )}
                {kind === "promotions" && (
                  <Field label="الدرجة الجديدة">
                    <input name="grade" required placeholder="الدرجة السادسة" />
                  </Field>
                )}
              </div>
              <Field
                label={
                  kind === "complaints"
                    ? "تفاصيل الشكوى أو الملاحظة"
                    : "التفاصيل وسبب الطلب"
                }
              >
                <textarea
                  name="description"
                  required
                  rows={4}
                  minLength={5}
                  placeholder="أضف التفاصيل التي تساعد الفريق على مراجعة الطلب..."
                />
              </Field>
              {kind === "offboarding" && (
                <p className="muted">
                  تقديم الطلب لا ينهي العلاقة الوظيفية فعليًا. هذا مسار تجريبي
                  لتوضيح الخطوات.
                </p>
              )}
              <div className="form-actions">
                <button className="btn primary" type="submit">
                  <Check size={17} />
                  حفظ وإرسال الطلب
                </button>
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => setForm(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
