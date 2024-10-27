import React from 'react';
import { Typography, Box } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, bgcolor: 'error.main', color: 'error.contrastText' }}>
          <Typography variant="h6">Something went wrong.</Typography>
          <Typography variant="body2">
            {this.state.error && this.state.error.toString()}
          </Typography>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
