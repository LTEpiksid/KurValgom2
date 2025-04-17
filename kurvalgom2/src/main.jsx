import { createRoot } from 'react-dom/client';
import { Component } from 'react';
import App from './App.jsx';
import './styles/global.css';

// Error Boundary for top-level errors
class ErrorBoundary extends Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Root ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="dark-theme">
                    <h2>Something went wrong</h2>
                    <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
                    <button onClick={() => window.location.reload()} className="btn btn-primary">
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const root = createRoot(document.getElementById('root'));
root.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);