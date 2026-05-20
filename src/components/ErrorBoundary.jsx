import { Component } from 'react'
import { Link } from 'react-router-dom'

const MONO = "'Consolas','Menlo','Monaco','Courier New',monospace"

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error, info) {
    console.error('MktVision error:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#020c18', minHeight: '100vh', fontFamily: MONO, color: '#c8d8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ fontSize: 12, color: '#ff3c5c', letterSpacing: 2 }}>RENDER ERROR</div>
          <div style={{ fontSize: 11, color: '#506888' }}>Something went wrong loading this page.</div>
          <Link to="/" onClick={() => this.setState({ hasError: false })}
            style={{ fontSize: 11, color: '#f5a623', textDecoration: 'none', border: '1px solid #f5a623', padding: '8px 20px', borderRadius: 3 }}>
            BACK TO HOME
          </Link>
        </div>
      )
    }
    return this.props.children
  }
}
