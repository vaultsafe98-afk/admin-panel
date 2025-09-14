import { createTheme } from '@mui/material/styles';
import { colors } from './colors';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.neon.green,
      light: '#33ff99',
      dark: '#00cc6a',
    },
    secondary: {
      main: colors.neon.blue,
      light: '#33ccff',
      dark: '#0099cc',
    },
    background: {
      default: colors.background.primary,
      paper: colors.background.card,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
    error: {
      main: colors.status.error,
    },
    warning: {
      main: colors.status.warning,
    },
    info: {
      main: colors.status.info,
    },
    success: {
      main: colors.status.success,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: colors.text.primary,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: colors.text.primary,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: colors.text.primary,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: colors.text.primary,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: colors.text.primary,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: colors.text.primary,
    },
    body1: {
      fontSize: '1rem',
      color: colors.text.primary,
    },
    body2: {
      fontSize: '0.875rem',
      color: colors.text.secondary,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.background.primary,
          color: colors.text.primary,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.card,
          border: `1px solid ${colors.border.primary}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: `0 0 20px ${colors.shadow.primary}`,
          },
        },
        contained: {
          backgroundColor: colors.button.primary,
          color: colors.background.primary,
          '&:hover': {
            backgroundColor: colors.neon.green,
            boxShadow: `0 0 20px ${colors.shadow.primary}`,
          },
        },
        outlined: {
          borderColor: colors.border.accent,
          color: colors.neon.green,
          '&:hover': {
            borderColor: colors.neon.green,
            backgroundColor: `${colors.neon.green}10`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: colors.background.secondary,
            '& fieldset': {
              borderColor: colors.border.primary,
            },
            '&:hover fieldset': {
              borderColor: colors.border.secondary,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.neon.green,
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.border.primary}`,
          color: colors.text.primary,
        },
        head: {
          backgroundColor: colors.background.secondary,
          fontWeight: 600,
          color: colors.text.primary,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: colors.background.secondary,
          },
        },
      },
    },
  },
});

export default theme;
