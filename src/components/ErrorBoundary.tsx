import { Component, type ErrorInfo, type ReactNode } from "react";
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("تعذّر عرض النموذج", error, info);
  }
  render() {
    if (this.state.failed)
      return (
        <div className="empty-state" style={{ minHeight: "100vh" }}>
          <img src="/assets/logo.svg" width={60} alt="أفق" />
          <h1>لنعُد إلى أفق من جديد</h1>
          <p>
            تعذّر عرض البيانات المحلية. يمكنك إعادة تحميل الصفحة أو استعادة
            البيانات التجريبية.
          </p>
          <button
            className="btn primary"
            onClick={() => window.location.reload()}
          >
            إعادة المحاولة
          </button>
          <button
            className="btn secondary"
            onClick={() => {
              localStorage.removeItem("ofuq-hrms-v1");
              window.location.href = "/admin";
            }}
          >
            استعادة بيانات العرض
          </button>
        </div>
      );
    return this.props.children;
  }
}
