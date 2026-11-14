import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  UsersRound,
  FileText,
  Wallet,
  Tags,
  Percent,
  Gift,
  Clock3,
  CalendarDays,
  HandCoins,
  Package,
  Star,
  TrendingUp,
  MessagesSquare,
  LogOut,
  Settings,
  PanelRightClose,
  PanelRightOpen,
  Search,
  Bell,
  ChevronDown,
  ChevronLeft,
  ArrowUpLeft,
  Menu,
  X,
  Check,
  RotateCcw,
  Building2,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { useStore } from "./store";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  Field,
  Modal,
  PageHeader,
} from "./components/ui";
import {
  Dashboard,
  Portal,
  Employees,
  EmployeeProfile,
  Leaves,
  PayrollPage,
  Commissions,
} from "./Pages";
import Modules from "./Modules";
import type { Role } from "./types";

const nav: {
  path: string;
  label: string;
  personal: string;
  icon: ComponentType<{ size?: number }>;
  group: string;
}[] = [
  {
    path: "",
    label: "لوحة التحكم",
    personal: "الرئيسية",
    icon: LayoutDashboard,
    group: "نظرة عامة",
  },
  {
    path: "employees",
    label: "الموظفون",
    personal: "ملفي الشخصي",
    icon: UsersRound,
    group: "إدارة الفريق",
  },
  {
    path: "contracts",
    label: "العقود",
    personal: "عقدي",
    icon: FileText,
    group: "إدارة الفريق",
  },
  {
    path: "payroll",
    label: "الرواتب",
    personal: "راتبي وكشوف الراتب",
    icon: Wallet,
    group: "التعويضات والمزايا",
  },
  {
    path: "allowances",
    label: "البدلات",
    personal: "بدلاتي",
    icon: Tags,
    group: "التعويضات والمزايا",
  },
  {
    path: "commissions",
    label: "العمولات",
    personal: "عمولاتي",
    icon: Percent,
    group: "التعويضات والمزايا",
  },
  {
    path: "bonuses",
    label: "المكافآت",
    personal: "مكافآتي",
    icon: Gift,
    group: "التعويضات والمزايا",
  },
  {
    path: "attendance",
    label: "الحضور والانصراف",
    personal: "حضوري",
    icon: Clock3,
    group: "شؤون الموظفين",
  },
  {
    path: "leaves",
    label: "الإجازات",
    personal: "إجازاتي",
    icon: CalendarDays,
    group: "شؤون الموظفين",
  },
  {
    path: "advances",
    label: "السلف",
    personal: "سلفي",
    icon: HandCoins,
    group: "شؤون الموظفين",
  },
  {
    path: "assets",
    label: "العهد",
    personal: "عهدي",
    icon: Package,
    group: "شؤون الموظفين",
  },
  {
    path: "evaluations",
    label: "التقييمات",
    personal: "تقييمي",
    icon: Star,
    group: "التطوير والخدمات",
  },
  {
    path: "promotions",
    label: "الترقيات",
    personal: "ترقياتي",
    icon: TrendingUp,
    group: "التطوير والخدمات",
  },
  {
    path: "complaints",
    label: "الشكاوى",
    personal: "شكاواي",
    icon: MessagesSquare,
    group: "التطوير والخدمات",
  },
  {
    path: "offboarding",
    label: "نهاية الخدمة",
    personal: "نهاية الخدمة",
    icon: LogOut,
    group: "التطوير والخدمات",
  },
];
const roleNames: Record<Role, string> = {
  hr: "إدارة الموارد البشرية",
  manager: "مدير القسم",
  employee: "الموظف",
  finance: "المالية",
};
function SettingsPage() {
  const { state, update, notify } = useStore();
  const [company, setCompany] = useState(state.settings.company),
    [currency, setCurrency] = useState(state.settings.currency),
    [reset, setReset] = useState(false);
  return (
    <>
      <PageHeader
        eyebrow="مساحة العمل"
        title="إعدادات العرض"
        description="خصّص النموذج بما يناسب عرضك، وابدأ من جديد في أي وقت."
      />
      <div className="grid-2">
        <Card title="هوية الشركة">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              update((s) => ({
                ...s,
                settings: {
                  company: company.trim(),
                  currency: currency.trim(),
                },
              }));
              notify("تم حفظ إعدادات العرض");
            }}
            className="stack"
          >
            <Field label="اسم الشركة">
              <input
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </Field>
            <Field label="العملة الافتراضية">
              <input
                required
                maxLength={12}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </Field>
            <button className="btn primary" type="submit">
              <Check size={17} />
              حفظ التغييرات
            </button>
          </form>
        </Card>
        <Card title="البيانات التجريبية">
          <div className="stack">
            <div className="notice">
              <Sparkles size={22} />
              <p>
                هذا نموذج تفاعلي ببيانات افتراضية. تبديل الدور يغيّر منظور العرض
                فقط، ولا يمثّل نظام صلاحيات حقيقيًا.
              </p>
            </div>
            <p className="muted">
              تُحفظ التغييرات في هذا المتصفح. إعادة الضبط تعيد الموظفين والطلبات
              والحالات إلى نقطة البداية.
            </p>
            <button className="btn danger" onClick={() => setReset(true)}>
              <RotateCcw size={17} />
              إعادة ضبط البيانات التجريبية
            </button>
          </div>
        </Card>
      </div>
      {reset && (
        <Modal title="إعادة ضبط النموذج" onClose={() => setReset(false)}>
          <p>
            ستُحذف التغييرات التي أجريتها في العرض، وتُستعاد البيانات
            الافتراضية.
          </p>
          <div className="form-actions">
            <button className="btn secondary" onClick={() => setReset(false)}>
              الاحتفاظ بالتغييرات
            </button>
            <button
              className="btn danger"
              onClick={() => {
                localStorage.removeItem("ofuq-hrms-v1");
                window.location.href = "/admin";
              }}
            >
              تأكيد إعادة الضبط
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function App() {
  const { state, employee, role, setRole, update, notify } = useStore();
  const location = useLocation(),
    navigate = useNavigate();
  const personal = role === "employee";
  const adminEmployee =
    state.employees.find((e) => e.id === "EMP-1004") || employee;
  const displayEmployee = personal ? employee : adminEmployee;
  const base = personal ? "/portal" : "/admin";
  const [collapsed, setCollapsed] = useState(false),
    [mobile, setMobile] = useState(false),
    [query, setQuery] = useState(""),
    [searchOpen, setSearchOpen] = useState(false),
    [notifications, setNotifications] = useState(false),
    [help, setHelp] = useState(false);
  const segment = location.pathname.split("/")[2] || "";
  const current = nav.find((n) => n.path === segment);
  const title =
    segment === "settings"
      ? "الإعدادات"
      : current
        ? personal
          ? current.personal
          : current.label
        : "الصفحة";
  const pending =
    state.leaves.filter((l) => l.status === "بانتظار الموافقة").length +
    state.records.filter(
      (r) =>
        ["advances", "complaints"].includes(r.kind) &&
        r.status === "بانتظار الموافقة",
    ).length;
  useEffect(() => {
    setMobile(false);
    setSearchOpen(false);
    setQuery("");
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    document.title = `${title} | أفق`;
  }, [title]);
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const list = nav
      .filter((n) => (personal ? n.personal : n.label).includes(query))
      .map((n) => ({
        title: personal ? n.personal : n.label,
        sub: "انتقل إلى الخدمة",
        path: `${base}${n.path ? "/" + n.path : ""}`,
      }));
    if (!personal)
      list.push(
        ...state.employees
          .filter((e) => `${e.name} ${e.id} ${e.department}`.includes(query))
          .slice(0, 5)
          .map((e) => ({
            title: e.name,
            sub: `${e.id} · ${e.department}`,
            path: `/admin/employees/${e.id}`,
          })),
      );
    return list.slice(0, 7);
  }, [query, state.employees, personal, base]);
  function switchRole(r: Role) {
    setRole(r);
    navigate(r === "employee" ? "/portal" : "/admin");
    notify(`وضع العرض: ${roleNames[r]}`);
  }
  return (
    <div className={`app ${collapsed ? "nav-collapsed" : ""}`}>
      <a className="skip-link" href="#main-content">
        تخطَّ إلى المحتوى
      </a>
      {mobile && (
        <div className="mobile-shade" onClick={() => setMobile(false)} />
      )}
      <aside
        className={`sidebar ${mobile ? "mobile-open" : ""}`}
        aria-label="القائمة الرئيسية"
      >
        <Link to={base} className="brand">
          <img src="/assets/logo.svg" alt="" />
          <div>
            <strong>
              أُفُق<span>للموارد البشرية</span>
            </strong>
            <small>كل الإمكانات، في مكان واحد</small>
          </div>
        </Link>
        <div className="workspace">
          <div className="workspace-icon">
            <Building2 size={19} />
          </div>
          <div>
            <strong>{state.settings.company}</strong>
            <small>مساحة العمل الرئيسية</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <nav className="nav-scroll">
          {nav.map((n, i) => {
            const Icon = n.icon;
            const newGroup = i === 0 || nav[i - 1].group !== n.group;
            return (
              <div key={n.path}>
                {newGroup && <div className="nav-label">{n.group}</div>}
                <NavLink
                  end={n.path === ""}
                  to={`${base}${n.path ? "/" + n.path : ""}`}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                  title={personal ? n.personal : n.label}
                >
                  <Icon size={19} />
                  <span>{personal ? n.personal : n.label}</span>
                  {n.path === "leaves" && pending > 0 && !personal && (
                    <b>
                      {
                        state.leaves.filter(
                          (l) => l.status === "بانتظار الموافقة",
                        ).length
                      }
                    </b>
                  )}
                  {n.path === "" && <span className="nav-active-dot" />}
                </NavLink>
              </div>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <Link to={`${base}/settings`} className="nav-item">
            <Settings size={19} />
            <span>إعدادات مساحة العمل</span>
          </Link>
          <button
            className="collapse-nav"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "توسيع القائمة" : "تصغير القائمة"}
          >
            {collapsed ? (
              <PanelRightOpen size={18} />
            ) : (
              <PanelRightClose size={18} />
            )}
            <span>تصغير القائمة</span>
          </button>
          <div className="sidebar-user">
            <Avatar employee={displayEmployee} />
            <div>
              <strong>{personal ? employee.name : "نورة عبدالرحمن"}</strong>
              <small>{roleNames[role]}</small>
            </div>
            <button
              className="icon-btn"
              title="دليل العرض"
              onClick={() => setHelp(true)}
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-right">
            <button
              className="icon-btn mobile-menu"
              aria-label="فتح القائمة"
              onClick={() => setMobile(true)}
            >
              <Menu size={22} />
            </button>
            <span className="breadcrumb">
              <Building2 size={15} />
              <span>{personal ? "بوابة الموظف" : "مساحة الإدارة"}</span>
              <ChevronLeft size={13} />
              <strong>{title}</strong>
            </span>
          </div>
          <div className="topbar-left">
            <div className="global-search">
              <Search size={17} />
              <input
                aria-label="البحث في النظام"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchOpen(false);
                }}
                value={query}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(true);
                }}
                placeholder={
                  personal ? "ابحث عن خدمة…" : "ابحث عن موظف أو خدمة…"
                }
              />
              <kbd>⌕</kbd>
              {searchOpen && query && (
                <div className="search-results">
                  {results.length ? (
                    results.map((r) => (
                      <Link to={r.path} key={r.path}>
                        <div>
                          <strong>{r.title}</strong>
                          <small>{r.sub}</small>
                        </div>
                        <ArrowUpLeft size={17} />
                      </Link>
                    ))
                  ) : (
                    <p>لا توجد نتائج مطابقة لـ «{query}»</p>
                  )}
                </div>
              )}
            </div>
            <button
              className={`notification-btn icon-btn ${!state.notificationsRead ? "unread" : ""}`}
              aria-label="الإشعارات"
              onClick={() => setNotifications(!notifications)}
            >
              <Bell size={20} />
              {!state.notificationsRead && <i />}
            </button>
            <div className="topbar-divider" />
            <Avatar employee={displayEmployee} size={34} />
          </div>
        </header>
        <div className="demo-toolbar">
          <span className="demo-indicator">
            <i />
            بيانات تجريبية <span className="demo-long">— نموذج أولي</span>
          </span>
          <div className="role-control">
            <span>استعرض كـ</span>
            <select
              aria-label="تبديل دور العرض"
              value={role}
              onChange={(e) => switchRole(e.target.value as Role)}
            >
              {Object.entries(roleNames).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            {personal && (
              <select
                aria-label="الموظف الافتراضي"
                value={employee.id}
                onChange={(e) => {
                  update((s) => ({ ...s, currentEmployeeId: e.target.value }));
                  notify("تم تغيير الموظف المعروض");
                }}
              >
                {state.employees.slice(0, 8).map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        <main id="main-content">
          <Routes>
            <Route path="/" element={<Navigate replace to={base} />} />
            {["admin", "portal"].map((prefix) => (
              <Route key={prefix} path={`/${prefix}`}>
                <Route index element={personal ? <Portal /> : <Dashboard />} />
                <Route
                  path="employees"
                  element={
                    personal ? (
                      <EmployeeProfile id={employee.id} />
                    ) : (
                      <Employees />
                    )
                  }
                />
                <Route
                  path="employees/:id"
                  element={
                    personal ? (
                      <EmployeeProfile id={employee.id} />
                    ) : (
                      <EmployeeProfile />
                    )
                  }
                />
                <Route path="leaves" element={<Leaves />} />
                <Route path="payroll" element={<PayrollPage />} />
                <Route path="commissions" element={<Commissions />} />
                {nav
                  .filter(
                    (n) =>
                      ![
                        "",
                        "employees",
                        "leaves",
                        "payroll",
                        "commissions",
                      ].includes(n.path),
                  )
                  .map((n) => (
                    <Route
                      path={n.path}
                      key={n.path}
                      element={<Modules key={n.path} kind={n.path} />}
                    />
                  ))}
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            ))}
            <Route
              path="*"
              element={
                <EmptyState
                  title="الصفحة غير موجودة"
                  description="يمكنك العودة إلى مساحتك ومتابعة العرض."
                  action={
                    <Link className="btn primary" to={base}>
                      العودة للرئيسية
                    </Link>
                  }
                />
              }
            />
          </Routes>
          <footer className="page-footer">
            <span>أفق. مساحة أفضل لفريقك.</span>
            <span>جميع البيانات افتراضية · نوفمبر 2026</span>
          </footer>
        </main>
      </div>
      {notifications && (
        <div className="notification-panel">
          <div className="card-heading">
            <h2>الإشعارات</h2>
            <button
              className="icon-btn"
              aria-label="إغلاق الإشعارات"
              onClick={() => setNotifications(false)}
            >
              <X size={18} />
            </button>
          </div>
          <p className="muted">كل ما يهمّك، في مكان واحد</p>
          <div className="stack">
            {(personal
              ? state.leaves
                  .filter((l) => l.employeeId === employee.id)
                  .slice(0, 3)
                  .map((l) => ({
                    text: `طلب إجازة ${l.days} أيام — ${l.status}`,
                    date: l.start,
                  }))
              : state.activities.slice(0, 4)
            ).map((a, i) => (
              <div className="notification-item" key={i}>
                <span className="notification-icon">
                  <Bell size={17} />
                </span>
                <div>
                  <strong>{a.text}</strong>
                  <small>{a.date}</small>
                </div>
              </div>
            ))}
          </div>
          <button
            className="btn secondary full"
            onClick={() => {
              update((s) => ({ ...s, notificationsRead: true }));
              notify("تم تحديد الإشعارات كمقروءة");
              setNotifications(false);
            }}
          >
            <Check size={16} />
            تحديد الكل كمقروء
          </button>
        </div>
      )}
      {help && (
        <Modal title="عرض أفق في خمس دقائق" onClose={() => setHelp(false)}>
          <div className="stack">
            <p>
              اكتشف تجربة مترابطة لشركة تجارية، مع حفظ كل التغييرات في متصفحك.
            </p>
            {[
              "تصفّح لوحة الإدارة ودليل الموظفين وافتح ملفًا تفصيليًا.",
              "انتقل إلى العمولات، رشّح شهرًا، وافتح عملية مبيعات.",
              "بدّل إلى الموظف وقدّم طلب إجازة 3 أيام.",
              "بدّل إلى مدير القسم، اعتمد الطلب، ثم راجع رصيد الموظف.",
              "افتح راتبي، اختر الشهر، واعرض كشف الراتب القابل للطباعة.",
            ].map((t, i) => (
              <div className="guide-step" key={t}>
                <b>{i + 1}</b>
                <span>{t}</span>
              </div>
            ))}
            <div className="notice">
              تبديل الأدوار للعرض فقط. الحسابات تجريبية ولا تمثّل قواعد قانونية
              أو تكاملًا ماليًا.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
export default App;
