"use client";

import { useState, useCallback } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import FavoriteOutlined from "@mui/icons-material/FavoriteOutlined";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import NotificationsNoneOutlined from "@mui/icons-material/NotificationsNoneOutlined";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";
import StarOutlined from "@mui/icons-material/StarOutlined";
import CommentOutlined from "@mui/icons-material/CommentOutlined";
import { useReactiveVar, useMutation } from "@apollo/client/react";
import { userVar } from "../../../../../apollo/store";
import { useQuery } from "../../../../lib/hooks/useQuery";
import { GET_MY_NOTIFICATIONS } from "../../../../../apollo/user/query";
import { MARK_ALL_NOTIFICATIONS_AS_READ, MARK_NOTIFICATION_AS_READ } from "../../../../../apollo/user/mutation";
import { T } from "../../../../lib/types/common";
import DashboardHeader from "../../dashboard-header";
import { alpha, styled } from "@mui/material/styles";

// ─── Environment ──────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function resolveImage(img?: string | null): string {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  return `${API_URL}/${img}`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const NOTIF_COLORS: Record<string, string> = {
  ORDER: "#3b82f6",
  FOLLOW: "#22c55e",
  REVIEW: "#f59e0b",
  COMMENT: "#8b5cf6",
  LIKE: "#ef4444",
  SYSTEM: "#64748b",
  OTHER: "#64748b",
};

function NotifIcon({ type }: { type: string }) {
  const sx = { fontSize: 16, color: "white" };
  if (type === "ORDER") return <LocalShippingOutlined sx={sx} />;
  if (type === "FOLLOW") return <PersonAddOutlined sx={sx} />;
  if (type === "REVIEW") return <StarOutlined sx={sx} />;
  if (type === "COMMENT") return <CommentOutlined sx={sx} />;
  if (type === "LIKE") return <FavoriteOutlined sx={sx} />;
  return <NotificationsNoneOutlined sx={sx} />;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Styled ───────────────────────────────────────────────────────────────────
const NotifCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: 12,
  boxShadow: "none",
  overflow: "hidden",
}));

const NotifRow = styled(Box, {
  shouldForwardProp: (p) => p !== "isUnread",
})<{ isUnread?: boolean }>(({ theme, isUnread }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  padding: theme.spacing(2, 2.5),
  cursor: isUnread ? "pointer" : "default",
  backgroundColor: isUnread ? alpha(theme.palette.primary.main, 0.04) : "transparent",
  transition: "background-color 0.15s",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.06),
  },
}));

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type FilterTab = "ALL" | "UNREAD" | "ORDER" | "FOLLOW" | "REVIEW";

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: "All", value: "ALL" },
  { label: "Unread", value: "UNREAD" },
  { label: "Orders", value: "ORDER" },
  { label: "Follows", value: "FOLLOW" },
  { label: "Reviews", value: "REVIEW" },
];

// ─── Component ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;

export default function NotificationsPageView() {
  const user = useReactiveVar(userVar);
  const isLoggedIn = !!user?._id;
  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");
  const [page, setPage] = useState(1);

  // Build search variables based on tab
  const searchVars: T = {};
  if (activeFilter === "UNREAD") searchVars.notificationStatus = "UNREAD";
  if (["ORDER", "FOLLOW", "REVIEW"].includes(activeFilter)) searchVars.notificationType = activeFilter;

  const { data, loading, refetch } = useQuery(GET_MY_NOTIFICATIONS, {
    variables: {
      input: {
        page,
        limit: ITEMS_PER_PAGE,
        sort: "createdAt",
        direction: "DESC",
        ...(Object.keys(searchVars).length ? { search: searchVars } : {}),
      },
    },
    skip: !isLoggedIn,
    fetchPolicy: "cache-and-network",
  });

  // Unread count (separate lightweight query)
  const { data: unreadData, refetch: refetchUnread } = useQuery(GET_MY_NOTIFICATIONS, {
    variables: { input: { page: 1, limit: 1, sort: "createdAt", direction: "DESC", search: { notificationStatus: "UNREAD" } } },
    skip: !isLoggedIn,
    fetchPolicy: "cache-and-network",
  });

  const notifications: T[] = (data as T)?.getMyNotifications?.list ?? [];
  const total: number = (data as T)?.getMyNotifications?.metaCounter?.[0]?.total ?? 0;
  const unreadCount: number = (unreadData as T)?.getMyNotifications?.metaCounter?.[0]?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
  const [markAllAsRead, { loading: markingAll }] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);

  const handleMarkOne = useCallback(async (id: string) => {
    try {
      await markAsRead({ variables: { input: { _id: id } } });
      refetch();
      refetchUnread();
    } catch {
      // silent
    }
  }, [markAsRead, refetch, refetchUnread]);

  const handleMarkAll = useCallback(async () => {
    try {
      await markAllAsRead();
      refetch();
      refetchUnread();
    } catch {
      // silent
    }
  }, [markAllAsRead, refetch, refetchUnread]);

  const handleTabChange = (_: unknown, val: FilterTab) => {
    setActiveFilter(val);
    setPage(1);
  };

  if (!isLoggedIn) {
    return (
      <Box>
        <DashboardHeader title="Notifications" Icon={NotificationsNoneOutlined} />
        <NotifCard sx={{ textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">Please log in to view notifications.</Typography>
        </NotifCard>
      </Box>
    );
  }

  return (
    <Box>
      <DashboardHeader
        title="Notifications"
        Icon={NotificationsNoneOutlined}
      />

      {/* Toolbar: tabs + mark all read */}
      <NotifCard sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", px: 2, pt: 1 }}>
          <Tabs
            value={activeFilter}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 40,
              "& .MuiTab-root": { minHeight: 40, textTransform: "none", fontWeight: 600, fontSize: 13, px: 2 },
              "& .MuiTabs-indicator": { borderRadius: 2 },
            }}
          >
            {FILTER_TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    {tab.label}
                    {tab.value === "UNREAD" && unreadCount > 0 && (
                      <Chip label={unreadCount} size="small" color="primary" sx={{ height: 18, fontSize: 11, ml: 0.5 }} />
                    )}
                  </Stack>
                }
              />
            ))}
          </Tabs>

          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon sx={{ fontSize: 15 }} />}
              onClick={handleMarkAll}
              disabled={markingAll}
              sx={{ fontSize: 12, textTransform: "none", fontWeight: 600, whiteSpace: "nowrap" }}
            >
              Mark all as read
            </Button>
          )}
        </Box>
      </NotifCard>

      {/* Notifications list */}
      <NotifCard>
        {loading && notifications.length === 0 ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={28} />
          </Box>
        ) : notifications.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" py={8} gap={1.5}>
            <NotificationsNoneOutlined sx={{ fontSize: 56, color: "grey.300" }} />
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              {activeFilter === "UNREAD" ? "No unread notifications" : "No notifications yet"}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {activeFilter === "UNREAD"
                ? "You're all caught up!"
                : "When you get notifications, they'll show up here."}
            </Typography>
          </Stack>
        ) : (
          <>
            {notifications.map((n: T, i: number) => {
              const isUnread = n.notificationStatus === "UNREAD";
              const authorImg = resolveImage((n.authorData as T)?.memberImage as string);
              const authorNick = (n.authorData as T)?.memberNick as string;
              const nType = n.notificationType as string;
              const bgColor = NOTIF_COLORS[nType] ?? NOTIF_COLORS.OTHER;

              return (
                <Box key={n._id as string}>
                  <NotifRow
                    isUnread={isUnread}
                    onClick={() => isUnread && handleMarkOne(n._id as string)}
                  >
                    {/* Author avatar with type badge */}
                    <Box sx={{ position: "relative", flexShrink: 0 }}>
                      <Avatar
                        src={authorImg}
                        alt={authorNick}
                        sx={{ width: 44, height: 44, fontSize: 15, bgcolor: "grey.300" }}
                      >
                        {authorNick?.[0]?.toUpperCase() ?? "?"}
                      </Avatar>
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: -2,
                          right: -2,
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          bgcolor: bgColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "2px solid white",
                        }}
                      >
                        <NotifIcon type={nType} />
                      </Box>
                    </Box>

                    {/* Content */}
                    <Box flex={1} minWidth={0}>
                      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                        <Typography variant="body2" fontWeight={isUnread ? 700 : 500} sx={{ lineHeight: 1.4 }}>
                          {n.notificationTitle as string}
                        </Typography>
                        <Chip
                          label={nType}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: 10,
                            fontWeight: 700,
                            bgcolor: alpha(bgColor, 0.12),
                            color: bgColor,
                          }}
                        />
                      </Stack>
                      {n.notificationContent && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5, lineHeight: 1.5 }}
                        >
                          {n.notificationContent as string}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: "block" }}>
                        {formatDate(n.createdAt as string)}
                      </Typography>
                    </Box>

                    {/* Unread indicator */}
                    {isUnread && (
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0, mt: 0.5 }} />
                    )}
                  </NotifRow>
                  {i < notifications.length - 1 && <Divider />}
                </Box>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 2, gap: 1, borderTop: "1px solid", borderColor: "divider" }}>
                <IconButton size="small" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev !== undefined && p - prev > 1;
                    return (
                      <Box key={p} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {showEllipsis && (
                          <Typography variant="body2" color="text.disabled" sx={{ px: 0.5 }}>
                            ...
                          </Typography>
                        )}
                        <Box
                          onClick={() => setPage(p)}
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                            transition: "all 0.15s",
                            ...(p === page
                              ? { bgcolor: "primary.main", color: "white" }
                              : { "&:hover": { bgcolor: "grey.100" } }
                            ),
                          }}
                        >
                          {p}
                        </Box>
                      </Box>
                    );
                  })}
                <IconButton size="small" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {/* Total count */}
            <Typography variant="body2" color="text.secondary" textAlign="center" py={1.5} sx={{ borderTop: totalPages <= 1 ? "1px solid" : "none", borderColor: "divider" }}>
              {total} notification{total !== 1 ? "s" : ""}
            </Typography>
          </>
        )}
      </NotifCard>
    </Box>
  );
}
