/**
 * pages/index.tsx – All Notifications page
 */

import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Pagination,
  Chip,
  Divider,
  Button,
  TextField,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import Navbar from "../components/Navbar";
import NotificationCard from "../components/NotificationCard";
import { useNotifications, FilterType } from "../hooks/useNotifications";
import { logger } from "../utils/logger";

const FILTER_OPTIONS: FilterType[] = ["All", "Placement", "Result", "Event"];
const LIMIT_OPTIONS = [5, 10, 20, 50];

export default function AllNotificationsPage() {
  const [filterType, setFilterType] = useState<FilterType>("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { notifications, total, totalPages, loading, error, refetch, handleView } =
    useNotifications({ filterType, limit, page });

  useEffect(() => {
    logger.info("page", "All Notifications page mounted");
  }, []);

  const handleFilterChange = (_: React.MouseEvent<HTMLElement>, val: FilterType | null) => {
    if (val) {
      setFilterType(val);
      setPage(1);
      logger.info("page", `Filter changed to: ${val}`);
    }
  };

  const unreadCount = notifications.filter((n) => !n.viewed).length;

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.dark">
              All Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {total} total
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

        {/* Filters */}
        <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
          <ToggleButtonGroup
            value={filterType}
            exclusive
            onChange={handleFilterChange}
            size="small"
          >
            {FILTER_OPTIONS.map((opt) => (
              <ToggleButton key={opt} value={opt} sx={{ px: 2, textTransform: "none" }}>
                {opt}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <TextField
            select
            size="small"
            label="Per page"
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            SelectProps={{ native: true }}
            sx={{ minWidth: 90 }}
          >
            {LIMIT_OPTIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </TextField>
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

        {!loading && notifications.map((n) => (
          <NotificationCard key={n.ID} notification={n} onView={handleView} />
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </Container>
    </>
  );
}
