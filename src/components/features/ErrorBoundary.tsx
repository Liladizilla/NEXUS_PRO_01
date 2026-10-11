import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  componentStack: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    componentStack: ''
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught application error:', error, errorInfo);
    this.setState({ componentStack: errorInfo.componentStack || '' });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, componentStack: '' });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let firestoreDetails: Record<string, unknown> | null = null;
      try {
        if (this.state.error?.message) {
          const parsed: unknown = JSON.parse(this.state.error.message);
          if (parsed && typeof parsed === 'object') {
            firestoreDetails = parsed as Record<string, unknown>;
          }
        }
      } catch {
        // Most React runtime errors are plain messages, not serialized Firestore errors.
      }

      const readableError = firestoreDetails
        ? `Firestore ${String(firestoreDetails.operationType || 'operation')} failed at ${String(firestoreDetails.path || 'an unknown path')}`
        : this.state.error?.message || 'The application crashed without providing an error message.';

      return (
        <div className="min-h-screen bg-nexus-bg flex items-center justify-center p-6">
          <div className="max-w-2xl w-full glass p-8 rounded-[32px] border-rose-500/20 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
                <AlertCircle size={32} className="text-rose-500" />
              </div>
              <h2 className="text-xl font-bold text-white">System Error</h2>
              <p className="text-sm leading-6 text-white/70 break-words">{readableError}</p>
            </div>

            {firestoreDetails && (
              <div className="bg-black/40 rounded-xl p-4 text-left font-mono text-[11px] text-rose-300/90 overflow-auto max-h-48">
                <pre className="whitespace-pre-wrap break-words">{JSON.stringify(firestoreDetails, null, 2)}</pre>
              </div>
            )}

            {!firestoreDetails && this.state.componentStack && (
              <details className="rounded-xl border border-white/10 bg-black/30 p-4 text-left">
                <summary className="cursor-pointer text-xs font-semibold text-white/70">Technical details</summary>
                <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap break-words font-mono text-[10px] leading-5 text-rose-300/80">{this.state.componentStack.trim()}</pre>
              </details>
            )}

            <div className="flex justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                <RefreshCw size={14} />
                Reboot System
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
