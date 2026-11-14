import { useEffect, useRef, type ReactNode } from "react";
import { X, Inbox, ArrowUpLeft } from "lucide-react";
import { createPortal } from "react-dom";
import { useStore } from "../store";
import type { Employee } from "../types";

export function Card({
  children,
  className = "",
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <section className={`card ${className}`}>
      {title && (
        <div className="card-heading">
          <h2>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}
export function Badge({
  children,
  status,
}: {
  children: ReactNode;
  status?: string;
}) {
  const s = status || String(children);
  const tone = /مرفوض|متأخر|غياب/.test(s)
    ? "red"
    : /بانتظار|قيد|قريب|إجازة/.test(s)
      ? "amber"
      : /معتمد|مصروف|مكتمل|نشط|العمل|مسلّمة|مُعادة|حاضر/.test(s)
        ? "green"
        : "blue";
  return (
    <span className={`badge ${tone}`}>
      <i />
      {children}
    </span>
  );
}
export function Avatar({
  employee,
  size = 36,
}: {
  employee: Employee;
  size?: number;
}) {
  return (
    <img
      className="avatar"
      src={`/assets/avatar-${(employee.avatar % 12) + 1}.svg`}
      alt={`صورة رمزية لـ${employee.name}`}
      width={size}
      height={size}
      style={{ width: size, height: size }}
    />
  );
}
export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const { state } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const el = ref.current;
    el?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab" && el) {
        const list = el.querySelectorAll<HTMLElement>(
          'button,input,select,textarea,a[href],[tabindex="0"]',
        );
        const first = list[0],
          last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className={`modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">{state.settings.company}</span>
            <h2>{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="إغلاق">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Inbox size={30} />
      </div>
      <h3>{title}</h3>
      <p>{description || "جرّب تغيير معايير البحث لعرض نتائج أخرى."}</p>
      {action}
    </div>
  );
}
export function Stat({
  label,
  value,
  hint,
  icon,
  tone = "blue",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: string;
}) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-top">
        <span>{label}</span>
        <div className="stat-icon">{icon || <ArrowUpLeft size={19} />}</div>
      </div>
      <strong>{value}</strong>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
export function Tabs({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {items.map((x) => (
        <button
          key={x}
          role="tab"
          aria-selected={value === x}
          onClick={() => onChange(x)}
          className={value === x ? "active" : ""}
        >
          {x}
        </button>
      ))}
    </div>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Progress({ value }: { value: number }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
export function Person({
  employee,
  sub,
}: {
  employee: Employee;
  sub?: string;
}) {
  return (
    <div className="person">
      <Avatar employee={employee} />
      <div>
        <strong>{employee.name}</strong>
        <small>{sub || employee.job}</small>
      </div>
    </div>
  );
}
