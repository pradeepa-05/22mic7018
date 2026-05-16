/**
 * components/Navbar.tsx
 */

import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";

const Navbar: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const navItems = [
    { label: "All Notifications", href: "/", icon: <NotificationsIcon fontSize="small" /> },
    { label: "Priority Inbox",    href: "/priority", icon: <StarIcon fontSize="small" /> },
  ];

  return (
    <AppBar position="sticky" elevation={2} sx={{ bgcolor: "primary.dark" }}>
      <Toolbar>
        <NotificationsIcon sx={{ mr: 1 }} />
        <Typography
          variant={isMobile ? "body1" : "h6"}
          fontWeight={700}
          sx={{ flexGrow: 1 }}
        >
          Campus Notifications
        </Typography>

        <Box display="flex" gap={1}>
          {navItems.map(({ label, href, icon }) => (
            <Link key={href} href={href} passHref legacyBehavior>
              <Button
                component="a"
                startIcon={isMobile ? undefined : icon}
                variant={router.pathname === href ? "contained" : "text"}
                color="inherit"
                size="small"
                sx={{
                  bgcolor: router.pathname === href ? "rgba(255,255,255,0.2)" : "transparent",
                  fontWeight: router.pathname === href ? 700 : 400,
                  fontSize: isMobile ? "0.7rem" : "0.875rem",
                }}
              >
                {isMobile ? (icon) : label}
              </Button>
            </Link>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
