import React from 'react';

export default class NamedBoundary extends React.Component<
  { name: string; children: React.ReactNode },
  { hasError: boolean; err?: any; info?: any }
> {
  constructor(p: any) {
    super(p);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: any, info: any) {
    console.error(`[Boundary:${this.props.name}]`, error, info?.componentStack);
    this.setState({ err: error, info });
  }
  
  render() {
    return this.state.hasError ? (
      <div style={{ padding: 16 }}>
        <h3>Failed in: {this.props.name}</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {String(this.state.err?.stack || this.state.err)}
        </pre>
      </div>
    ) : (
      (this.props.children as any)
    );
  }
}