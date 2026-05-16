/**
 * styles/theme.ts – Material UI theme configuration
 */

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1565C0",
      light: "#5E92F3",
      dark: "#003C8F",
    },
    secondary: {
      main: "#00897B",
    },
    background: {
      default: "#F4F6F9",
      paper: "#FFFFFF",
    },
    error: { main: "#D32F2F" },
    warning: { main: "#F57C00" },
    success: { main: "#388E3C" },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          transition: "box-shadow 0.2s ease",
          "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.14)" },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
});

export default theme;
