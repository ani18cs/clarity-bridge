import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ClarityBridge caught an unhandled rendering error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-8 bg-white border-3 border-ink rounded-neo shadow-neo space-y-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-card-coral border-2.5 border-ink flex items-center justify-center mx-auto shadow-neo-xs">
            <AlertTriangle className="w-8 h-8 text-coral-dark" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-black text-2xl text-ink">
              Display Notice
            </h2>
            <p className="text-sm text-slate-700 font-medium max-w-md mx-auto leading-relaxed">
              We encountered a minor formatting hiccup while rendering the document report. No data was lost.
            </p>
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="p-3 bg-slate-100 rounded-xl border border-ink/20 text-left overflow-auto max-h-36 text-xs font-mono text-ink">
              {this.state.error.toString()}
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={this.handleReset}
              className="btn-neo btn-periwinkle-neo btn-neo-md inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>↺ Reset & Try Again</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
