import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('UI ErrorBoundary captured error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 rounded-lg border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Ocurrió un error al renderizar</h4>
          <p className="text-slate-600 dark:text-slate-300">Intenta recargar el módulo o navegar a otra vista.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
