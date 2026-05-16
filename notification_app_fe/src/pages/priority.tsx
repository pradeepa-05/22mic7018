/**
 * pages/priority.tsx – Priority Inbox page (Stage 2)
 */

import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Button,
  Slider,
  Chip,
  Paper,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import RefreshIcon from "@mui/icons-material/Refresh";
import Navbar from "../components/Navbar";
import NotificationCard from "../components/NotificationCard";
import { usePriorityNotifications } from "../hooks/useNotifications";
import { logger } from "../utils/logger";

const MARKS = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 15, label: "15" },
  { value: 20, label: "20" },
];

export default function PriorityPage() {
  const [topN, setTopN] = useState(10);

  const { notifications, loading, error, refetch, handleView } =
    usePriorityNotifications(topN);

  useEffect(() => {
    logger.info("page", `Priority Inbox page mounted with topN=${topN}`);
  }, [topN]);

  const unreadCount = notifications.filter((n) => !n.viewed).length;

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <StarIcon color="warning" />
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary.dark">
                Priority Inbox
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Top {topN} most important notifications
                {unreadCount > 0 && (
                  <Chip
                    label={`${unreadCount} unread`}
                    color="error"
                    size="small"
                    sx={{ ml: 1, height: 20, fontSize: "0.68rem" }}
                  />
                )}
              </Typography>
            </Box>
          </Box>
          <Button
            startIcon={<RefreshIcon />}
            onClick={refetch}
            variant="outlined"
            size="small"
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Priority legend */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "#f8f9fa" }}>
          <Typography variant="body2" fontWeight={600} mb={1}>
            Priority Formula: Weight × Recency
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip icon={<StarIcon />} label="Placement (highest)" color="success" size="small" />
            <Chip icon={<StarIcon />} label="Result" color="primary" size="small" />
            <Chip icon={<StarIcon />} label="Event (lowest)" color="warning" size="small" />
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Within the same type, more recent notifications rank higher.
          </Typography>
        </Paper>

        {/* Top-N slider */}
        <Box mb={3} px={1}>
          <Typography variant="body2" fontWeight={500} gutterBottom>
            Show top <strong>{topN}</strong> notifications
          </Typography>
          <Slider
            value={topN}
            min={5}
            max={20}
            step={5}
            marks={MARKS}
            onChange={(_, val) => setTopN(val as number)}
            valueLabelDisplay="auto"
            color="primary"
          />
        </Box>

        {/* Content */}
        {loading && (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        )}

        {error && !loading && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && notifications.length === 0 && (
          <Alert severity="info">No notifications found.</Alert>
        )}

        {!loading &&
          notifications.map((n, index) => (
            <Box key={n.ID} position="relative">
              {/* Rank badge */}
              <Box
                sx={{
                  position: "absolute",
                  left: -28,
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  bgcolor: index < 3 ? "warning.main" : "grey.300",
                  color: index < 3 ? "#fff" : "text.secondary",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                }}
              >
                {index + 1}
              </Box>
              <NotificationCard notification={n} onView={handleView} />
            </Box>
          ))}
      </Container>
    </>
  );
}
