// Theme configuration for the application
// This centralizes color schemes and styling variables

const theme = {
  colors: {
    // Primary colors from navbar (#58afe2)
    primary: '#58afe2',
    primaryDark: '#4299cb',
    primaryLight: '#7cc3ed',
    
    // Secondary colors
    secondary: '#5c68a3',
    secondaryDark: '#3d4580',
    secondaryLight: '#7b86c2',
    
    // Accent colors for visualizations
    accent1: '#ff9800',
    accent2: '#8bc34a',
    accent3: '#9c27b0',
    
    // Neutral colors
    light: '#f8f9fa',
    dark: '#343a40',
    gray: '#6c757d',
    grayLight: '#dee2e6',
    grayLighter: '#f2f2f2',
    
    // Semantic colors
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#17a2b8',
    
    // Text colors
    textPrimary: '#212529',
    textSecondary: '#6c757d',
    textLight: '#ffffff',
  },
  
  // Font styles
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '16px',
    lineHeight: 1.5,
    
    // Font weights
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    
    // Heading sizes
    h1: '2.5rem',
    h2: '2rem',
    h3: '1.75rem',
    h4: '1.5rem',
    h5: '1.25rem',
    h6: '1rem',
  },
  
  // Spacing units
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  
  // Border radius
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    pill: '50rem',
    circle: '50%',
  },
  
  // Box shadows
  shadows: {
    sm: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
    md: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
    lg: '0 1rem 3rem rgba(0, 0, 0, 0.175)',
  },
  
  // Transitions
  transitions: {
    short: 'all 0.15s ease',
    medium: 'all 0.3s ease',
    long: 'all 0.45s ease',
  },
  
  // Z-index values
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
  
  // Media query breakpoints
  breakpoints: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1400px',
  },
};

export default theme; 