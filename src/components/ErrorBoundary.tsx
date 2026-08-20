"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          padding: "20px",
        }}>
          <div style={{
            maxWidth: 400,
            width: "100%",
            textAlign: "center",
            padding: "40px 24px",
            background: "rgba(0, 255, 136, 0.03)",
            border: "1px solid rgba(0, 255, 136, 0.1)",
            borderRadius: 16,
          }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>✦</div>
            <h1 style={{
              fontSize: 24,
              fontWeight: 300,
              color: "#e0f5e8",
              margin: "0 0 12px",
              letterSpacing: "2px",
            }}>
              Something went wrong
            </h1>
            <p style={{
              fontSize: 14,
              color: "rgba(224, 245, 232, 0.5)",
              margin: "0 0 24px",
              lineHeight: 1.6,
            }}>
              Your journey continues shortly. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 24px",
                borderRadius: 10,
                background: "linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 204, 106, 0.1))",
                border: "1px solid rgba(0, 255, 136, 0.3)",
                color: "#e0f5e8",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
