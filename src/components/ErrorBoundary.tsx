// 全局错误边界 — 捕获 React 渲染错误，避免白屏无法排查
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("React 渲染错误:", error, info);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            padding: "32px",
            background: "rgb(var(--c-xuanzhi-rgb))",
            color: "rgb(var(--c-daiqing-rgb))",
            fontFamily: "serif",
            overflow: "auto",
          }}
        >
          <h2 style={{ color: "rgb(var(--c-zhusha-rgb))", margin: "0 0 16px", fontSize: "20px" }}>
            页面渲染出错
          </h2>
          <p style={{ margin: "0 0 12px", fontSize: "14px" }}>
            {this.state.error.message}
          </p>
          {this.state.error.stack && (
            <pre
              style={{
                background: "#FFF",
                padding: "12px",
                border: "1px solid rgb(var(--c-zhusha-rgb))",
                borderRadius: "4px",
                fontSize: "11px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                color: "rgb(var(--c-daiqing-rgb))",
                margin: 0,
              }}
            >
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
