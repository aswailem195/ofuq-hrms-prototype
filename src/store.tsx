import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2 } from "lucide-react";
import { createInitialState } from "./data";
import type { AppState, Employee, Role } from "./types";
export const STORAGE_KEY = "ofuq-hrms-v1";
interface Store {
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
  notify: (message: string) => void;
  employee: Employee;
  role: Role;
  setRole: (role: Role) => void;
}
const Context = createContext<Store | null>(null);
function initial(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw) as AppState;
      if (
        s.version === 1 &&
        Array.isArray(s.employees) &&
        s.employees.length &&
        Array.isArray(s.leaves) &&
        Array.isArray(s.commissions) &&
        Array.isArray(s.records) &&
        Array.isArray(s.activities) &&
        s.settings?.company &&
        s.settings?.currency &&
        ["hr", "manager", "employee", "finance"].includes(s.role)
      )
        return {
          ...s,
          attendance: s.attendance || createInitialState().attendance,
        };
    }
  } catch {
    /* Invalid or unavailable storage falls back to the demo. */
  }
  return createInitialState();
}
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initial);
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storageWarning = useRef(false);
  const notify = useCallback((text: string) => {
    setToast(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 4000);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      if (!storageWarning.current) {
        storageWarning.current = true;
        notify("التخزين المحلي غير متاح؛ ستبقى التغييرات حتى إغلاق الصفحة.");
      }
    }
  }, [state, notify]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const update = useCallback(
    (fn: (s: AppState) => AppState) => setState((s) => fn(s)),
    [],
  );
  const setRole = useCallback(
    (role: Role) => setState((s) => ({ ...s, role })),
    [],
  );
  const employee =
    state.employees.find((e) => e.id === state.currentEmployeeId) ||
    state.employees[0];
  return (
    <Context.Provider
      value={{ state, update, notify, employee, role: state.role, setRole }}
    >
      {children}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <CheckCircle2 size={19} />
          {toast}
        </div>
      )}
    </Context.Provider>
  );
}
export function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error("يجب استخدام حالة التطبيق داخل مزوّد البيانات");
  return store;
}
