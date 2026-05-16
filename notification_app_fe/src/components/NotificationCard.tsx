/**
 * components/NotificationCard.tsx
 */

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { Notification } from "../api/notifications";

interface Props {
  notification: Notification & { viewed: boolean };
  onView: (id: string) => void;
}

const TYPE_CONFIG = {
  Placement: { color: "success" as const, icon: <WorkIcon fontSize="small" /> },
  Result:    { color: "primary" as const, icon: <SchoolIcon fontSize="small" /> },
  Event:     { color: "warning" as const, icon: <EventIcon fontSize="small" /> },
};

function formatTimestamp(ts: string): string {
  const d = new Date(ts.replace(" ", "T"));
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const NotificationCard: React.FC<Props> = ({ notification, onView }) => {
  const { color, icon } = TYPE_CONFIG[notification.Type] ?? {
    color: "default" as const,
    icon: null,
  };

  return (
    <Card
      sx={{
        mb: 1.5,
        border: notification.viewed ? "1px solid #e0e0e0" : "1.5px solid #1565C0",
        opacity: notification.viewed ? 0.8 : 1,
        bgcolor: notification.viewed ? "#fafafa" : "#fff",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Chip
                icon={icon ?? undefined}
                label={notification.Type}
                color={color}
                size="small"
                sx={{ height: 22, fontSize: "0.72rem" }}
              />
              {!notification.viewed && (
                <Chip
                  label="New"
                  size="small"
                  color="error"
                  sx={{ height: 18, fontSize: "0.65rem" }}
                />
              )}
            </Box>

            <Typography
              variant="body1"
              sx={{
                fontWeight: notification.viewed ? 400 : 600,
                color: notification.viewed ? "text.secondary" : "text.primary",
                mt: 0.5,
              }}
            >
              {notification.Message}
            </Typography>

            <Typography variant="caption" color="text.disabled" mt={0.5} display="block">
              {formatTimestamp(notification.Timestamp)}
            </Typography>
          </Box>

          <Tooltip title={notification.viewed ? "Already read" : "Mark as read"}>
            <span>
              <IconButton
                size="small"
                onClick={() => !notification.viewed && onView(notification.ID)}
                disabled={notification.viewed}
                sx={{ ml: 1, color: notification.viewed ? "success.main" : "primary.main" }}
              >
                {notification.viewed ? (
                  <CheckCircleOutlineIcon fontSize="small" />
                ) : (
                  <RadioButtonUncheckedIcon fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
