import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 본래 서비스 환경에서는 여기서 Sentry 등에 로그를 남깁니다.
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', background: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>문제가 발생했습니다.</h2>
          <p style={{ color: '#666' }}>죄송합니다. 예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
          <button 
            onClick={() => window.location.href = '/'}
            style={{ marginTop: '2rem', padding: '0.75rem 1.5rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            홈으로 돌아가기
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
