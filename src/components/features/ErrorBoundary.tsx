import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorDetails = null;
      try {
        if (this.state.error?.message) {
          errorDetails = JSON.parse(this.state.error.message);
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-nexus-bg flex items-center justify-center p-6">
          <div className="max-w-md w-full glass p-8 rounded-[32px] border-rose-500/20 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
              <AlertCircle size={32} className="text-rose-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">System Error</h2>
              <p className="text-sm text-white/40">
                {errorDetails ? `Firestore ${errorDetails.operationType} failed at ${errorDetails.path}` : 'An unexpected error occurred in the Odyseus mesh.'}
              </p>
            </div>
            {errorDetails && (
              <div className="bg-black/40 rounded-xl p-4 text-left font-mono text-[10px] text-rose-400/80 overflow-auto max-h-40">
                <pre>{JSON.stringify(errorDetails, null, 2)}</pre>
              </div>
            )}
            <button 
              onClick={this.handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all mx-auto"
            >
              <RefreshCw size={14} />
              Reboot System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
