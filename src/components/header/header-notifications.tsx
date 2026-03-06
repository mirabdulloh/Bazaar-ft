"use client";

import { useState } from "react";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import SvgIcon from "@mui/material/SvgIcon";
import Typography from "@mui/material/Typography";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import FavoriteOutlined from "@mui/icons-material/FavoriteOutlined";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";
import StarOutlined from "@mui/icons-material/StarOutlined";
import NotificationsNoneOutlined from "@mui/icons-material/NotificationsNoneOutlined";
import CommentOutlined from "@mui/icons-material/CommentOutlined";
import { useReactiveVar, useMutation } from "@apollo/client/react";
import { GET_MY_NOTIFICATIONS } from "../../../apollo/user/query";
import { MARK_ALL_NOTIFICATIONS_AS_READ, MARK_NOTIFICATION_AS_READ } from "../../../apollo/user/mutation";
import { useQuery } from "lib/hooks/useQuery";
import { T } from "lib/types/common";
import { userVar } from "../../../apollo/store";

// ─── Environment ──────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function resolveImage(img?: string | null): string {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  return `${API_URL}/${img}`;
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const NOTIF_COLORS: Record<string, string> = {
  ORDER: "#3b82f6",
  FOLLOW: "#22c55e",
  REVIEW: "#f59e0b",
  COMMENT: "#8b5cf6",
  LIKE: "#ef4444",
  SYSTEM: "#64748b",
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
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function HeaderNotifications() {
  const user = useReactiveVar(userVar);
  const isLoggedIn = !!user._id;
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const { data: dropdownData, loading, refetch } = useQuery(GET_MY_NOTIFICATIONS, {
    variables: { input: { page: 1, limit: 5, sort: "createdAt", direction: "DESC" } },
    skip: !isLoggedIn,
    fetchPolicy: "cache-and-network",
  });

  const { data: unreadData, refetch: refetchUnread } = useQuery(GET_MY_NOTIFICATIONS, {
    variables: { input: { page: 1, limit: 1, sort: "createdAt", direction: "DESC", search: { notificationStatus: "UNREAD" } } },
    skip: !isLoggedIn,
    fetchPolicy: "cache-and-network",
  });

  const notifications: T[] = (dropdownData as T)?.getMyNotifications?.list ?? [];
  const unreadCount: number = (unreadData as T)?.getMyNotifications?.metaCounter?.[0]?.total ?? 0;

  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);
  const [markAllAsRead, { loading: markingAll }] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isLoggedIn) return;
    setAnchorEl(e.currentTarget);
    refetch();
  };

  const handleMarkOne = async (id: string) => {
    try {
      await markAsRead({ variables: { input: { _id: id } } });
      refetch();
      refetchUnread();
    } catch {
      // silent
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      refetch();
      refetchUnread();
    } catch {
      // silent
    }
  };

  return (
    <>
      <Badge badgeContent={unreadCount} color="primary" invisible={!isLoggedIn || unreadCount === 0}>
        <IconButton aria-label="Notifications" onClick={handleOpen}>
          <SvgIcon fontSize="small">
            <svg viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M15 18H9" />
                <path d="M18 9a6 6 0 1 0-12 0v3.5c0 .65-.26 1.27-.72 1.73L4 16h16l-1.28-1.77a2.5 2.5 0 0 1-.72-1.73V9Z" />
              </g>
            </svg>
          </SvgIcon>
        </IconButton>
      </Badge>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            borderRadius: 2,
            boxShadow: 6,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        }}
      >
        {/* Header row */}
        <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Notifications
            {unreadCount > 0 && (
              <Chip label={unreadCount} size="small" color="primary" sx={{ ml: 1, height: 18, fontSize: 11 }} />
            )}
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon sx={{ fontSize: 15 }} />}
              onClick={handleMarkAll}
              disabled={markingAll}
              sx={{ fontSize: 11, textTransform: "none" }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        {/* Notification list */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {loading && notifications.length === 0 ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" py={5} gap={1}>
              <NotificationsNoneOutlined sx={{ fontSize: 40, color: "grey.400" }} />
              <Typography variant="body2" color="text.secondary">No notifications yet.</Typography>
            </Stack>
          ) : (
            notifications.map((n: T, i: number) => {
              const isUnread = n.notificationStatus === "UNREAD";
              const authorImg = resolveImage((n.authorData as T)?.memberImage as string);
              const authorNick = (n.authorData as T)?.memberNick as string;
              const nType = n.notificationType as string;
              const bgColor = NOTIF_COLORS[nType] ?? NOTIF_COLORS.SYSTEM;
              return (
                <Box key={n._id as string}>
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                      bgcolor: isUnread ? "action.hover" : "transparent",
                      cursor: isUnread ? "pointer" : "default",
                      transition: "background-color 0.15s",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                    onClick={() => isUnread && handleMarkOne(n._id as string)}
                  >
                    {/* Author avatar with type badge */}
                    <Box sx={{ position: "relative", flexShrink: 0 }}>
                      <Avatar
                        src={authorImg}
                        alt={authorNick}
                        sx={{ width: 40, height: 40, fontSize: 14, bgcolor: "grey.300" }}
                      >
                        {authorNick?.[0]?.toUpperCase() ?? "?"}
                      </Avatar>
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: -2,
                          right: -2,
                          width: 20,
                          height: 20,
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

                    <Box flex={1} minWidth={0}>
                      <Typography variant="body2" fontWeight={isUnread ? 700 : 500} sx={{ lineHeight: 1.4 }}>
                        {n.notificationTitle as string}
                      </Typography>
                      {n.notificationContent && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.4,
                            mt: 0.3,
                          }}
                        >
                          {n.notificationContent as string}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.3, display: "block", fontSize: 11 }}>
                        {timeAgo(n.createdAt as string)}
                      </Typography>
                    </Box>

                    {isUnread && (
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0, mt: 0.8 }} />
                    )}
                  </Box>
                  {i < notifications.length - 1 && <Divider />}
                </Box>
              );
            })
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ borderTop: "1px solid", borderColor: "divider", p: 1.5 }}>
          <Button
            component={Link}
            href="/notifications"
            fullWidth
            size="small"
            onClick={() => setAnchorEl(null)}
            sx={{ textTransform: "none", fontWeight: 600, color: "primary.main", "&:hover": { bgcolor: "action.hover" } }}
          >
            See all notifications
          </Button>
        </Box>
      </Popover>
    </>
  );
}
