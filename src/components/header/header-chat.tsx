"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useReactiveVar } from "@apollo/client/react";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import SvgIcon from "@mui/material/SvgIcon";
import Typography from "@mui/material/Typography";
import ForumOutlined from "@mui/icons-material/ForumOutlined";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import MarkUnreadChatAltRounded from "@mui/icons-material/MarkUnreadChatAltRounded";
import {
  GET_ADMIN_SUPPORT_CHATS,
  GET_BRAND_CHATS,
  GET_CHAT_PRESENCE,
  GET_MY_CHATS,
  GET_MY_SUPPORT_CHATS,
  GET_MY_UNREAD_CHAT_COUNT,
} from "../../../apollo/chat/query";
import { userVar } from "../../../apollo/store";

type PreviewChat = {
  _id: string;
  chatScope: "BRAND_DIRECT" | "ADMIN_SUPPORT";
  chatStatus: "PENDING" | "OPEN" | "CLOSED";
  requesterType: "USER" | "BRAND";
  lastMessageAt?: string | null;
  lastMessageText?: string | null;
  updatedAt?: string;
  unreadCount: number;
  requesterData?: any;
  brandData?: any;
  assignedAdminData?: any;
  supportTopic?: string | null;
};

type ChatPresence = {
  targetMemberId?: string | null;
  isOnline: boolean;
  lastActiveAt?: string | null;
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const PREVIEW_LIMIT = 5;

function getChatHref(memberType?: string): string {
  if (memberType === "ADMIN") return "/admin/chats";
  if (memberType === "BRAND") return "/brand/chats";
  if (memberType === "USER") return "/chat";
  return "/login";
}

function resolveImage(src?: string | null, fallbackSeed = "User"): string {
  if (src && src !== "null" && src !== "undefined") {
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    const normalized = src.startsWith("/") ? src : `/${src}`;
    return API_BASE ? `${API_BASE}${normalized}` : normalized;
  }

  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    fallbackSeed
  )}&backgroundColor=1d4ed8&textColor=ffffff`;
}

function formatRelativeDate(date?: string | null): string {
  if (!date) return "";
  const target = new Date(date);
  const diffMs = Date.now() - target.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return target.toLocaleDateString();
}

function formatLastSeen(date?: string | null): string {
  if (!date) return "Offline";
  const target = new Date(date);
  const diffMs = Date.now() - target.getTime();
  const diffMin = Math.max(1, Math.round(diffMs / 60000));

  if (diffMin < 60) return `Last seen ${diffMin}m ago`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `Last seen ${diffHour}h ago`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 7) return `Last seen ${diffDay}d ago`;
  return `Last seen ${target.toLocaleDateString()}`;
}

function getDisplayName(chat: PreviewChat, memberType?: string): string {
  if (chat.chatScope === "BRAND_DIRECT") {
    if (memberType === "BRAND") return chat.requesterData?.memberNick || chat.requesterData?.memberFullName || "Customer";
    return chat.brandData?.brandName || chat.brandData?.memberData?.memberNick || "Brand";
  }

  if (memberType === "ADMIN") {
    return chat.requesterData?.memberNick || chat.requesterData?.memberFullName || "Support Request";
  }

  return chat.assignedAdminData?.memberNick || "Bazaar Support";
}

function getDisplayMeta(chat: PreviewChat, memberType?: string): string {
  if (chat.lastMessageText) return chat.lastMessageText;
  if (chat.chatScope === "BRAND_DIRECT") {
    return memberType === "BRAND" ? "Customer conversation" : "Brand conversation";
  }

  if (memberType === "ADMIN") {
    return chat.requesterType === "BRAND" ? "Brand support" : "User support";
  }

  return chat.supportTopic || "Support chat";
}

function getDisplayAvatar(chat: PreviewChat, memberType?: string): string {
  if (chat.chatScope === "BRAND_DIRECT") {
    if (memberType === "BRAND") {
      return resolveImage(chat.requesterData?.memberImage, chat.requesterData?.memberNick || "Customer");
    }

    return resolveImage(
      chat.brandData?.memberData?.memberImage || chat.brandData?.brandLogo,
      chat.brandData?.brandName || "Brand"
    );
  }

  if (memberType === "ADMIN") {
    return resolveImage(chat.requesterData?.memberImage, chat.requesterData?.memberNick || "Support");
  }

  return resolveImage(chat.assignedAdminData?.memberImage, "Support");
}

function getChatTab(chat: PreviewChat, memberType?: string): string {
  if (memberType === "ADMIN") {
    return chat.requesterType === "BRAND" ? "brand-support" : "user-support";
  }

  if (memberType === "BRAND") {
    return chat.chatScope === "ADMIN_SUPPORT" ? "support" : "customers";
  }

  return chat.chatScope === "ADMIN_SUPPORT" ? "support" : "brand";
}

function getScopeLabel(chat: PreviewChat, memberType?: string): string {
  if (chat.chatScope === "BRAND_DIRECT") {
    return memberType === "BRAND" ? "Customer" : "Brand";
  }

  if (memberType === "ADMIN") {
    return chat.requesterType === "BRAND" ? "Brand support" : "User support";
  }

  return "Support";
}

function ChatPreviewRow({
  chat,
  href,
  memberType,
  onNavigate,
}: {
  chat: PreviewChat;
  href: string;
  memberType?: string;
  onNavigate: () => void;
}) {
  const { data: presenceData } = useQuery(GET_CHAT_PRESENCE, {
    variables: { chatId: chat._id },
    fetchPolicy: "cache-and-network",
    pollInterval: 20000,
  });

  const presence = (((presenceData as any)?.getChatPresence ?? null) as ChatPresence | null);
  const presenceLabel =
    chat.chatScope === "ADMIN_SUPPORT" && memberType !== "ADMIN" && !presence?.targetMemberId
      ? "Waiting for support"
      : presence?.isOnline
        ? "Online"
        : formatLastSeen(presence?.lastActiveAt);

  return (
    <ListItemButton
      component={Link}
      href={`${href}?chatId=${chat._id}&tab=${getChatTab(chat, memberType)}`}
      onClick={onNavigate}
      sx={{
        alignItems: "flex-start",
        px: 1.5,
        py: 1.35,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "rgba(148,163,184,0.22)",
        bgcolor: "rgba(255,255,255,0.86)",
        boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
        transition: "all 160ms ease",
        "&:hover": {
          bgcolor: "rgba(37,99,235,0.05)",
          borderColor: "rgba(37,99,235,0.22)",
        },
      }}
    >
      <Badge
        color="primary"
        badgeContent={chat.unreadCount}
        invisible={!chat.unreadCount}
        overlap="circular"
        sx={{ mr: 1.5 }}
      >
        <Avatar src={getDisplayAvatar(chat, memberType)} sx={{ width: 42, height: 42 }} />
      </Badge>

      <ListItemText
        disableTypography
        primary={
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Typography variant="subtitle2" noWrap>
              {getDisplayName(chat, memberType)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatRelativeDate(chat.lastMessageAt || chat.updatedAt)}
            </Typography>
          </Stack>
        }
        secondary={
          <Stack spacing={0.6} sx={{ mt: 0.65 }}>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
              <Chip
                size="small"
                label={getScopeLabel(chat, memberType)}
                variant="outlined"
                color={chat.chatScope === "ADMIN_SUPPORT" ? "secondary" : "primary"}
              />
              {chat.unreadCount > 0 && (
                <Chip
                  size="small"
                  label={`${chat.unreadCount} unread`}
                  color="primary"
                  icon={<MarkUnreadChatAltRounded sx={{ fontSize: 15 }} />}
                />
              )}
            </Stack>
            <Stack direction="row" spacing={0.7} alignItems="center">
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: presence?.isOnline ? "success.main" : "grey.400",
                  boxShadow: presence?.isOnline ? "0 0 0 4px rgba(34,197,94,0.14)" : "none",
                  flexShrink: 0,
                }}
              />
              <Typography variant="caption" color={presence?.isOnline ? "success.main" : "text.secondary"} sx={{ fontWeight: 600 }}>
                {presenceLabel}
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {getDisplayMeta(chat, memberType)}
            </Typography>
          </Stack>
        }
      />
    </ListItemButton>
  );
}

export function HeaderChat() {
  const user = useReactiveVar(userVar);
  const router = useRouter();
  const isLoggedIn = Boolean(user._id);
  const [open, setOpen] = useState(false);
  const href = getChatHref(user.memberType);

  const unreadResult = useQuery(GET_MY_UNREAD_CHAT_COUNT, {
    skip: !isLoggedIn,
    fetchPolicy: "cache-and-network",
  });

  const userDirectResult = useQuery(GET_MY_CHATS, {
    skip: !open || user.memberType !== "USER",
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: PREVIEW_LIMIT, direction: "DESC", search: { chatScope: "BRAND_DIRECT" } } },
  });

  const brandDirectResult = useQuery(GET_BRAND_CHATS, {
    skip: !open || user.memberType !== "BRAND",
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: PREVIEW_LIMIT, direction: "DESC", search: { chatScope: "BRAND_DIRECT" } } },
  });

  const supportResult = useQuery(GET_MY_SUPPORT_CHATS, {
    skip: !open || (user.memberType !== "USER" && user.memberType !== "BRAND"),
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: PREVIEW_LIMIT, direction: "DESC", search: { chatScope: "ADMIN_SUPPORT" } } },
  });

  const adminSupportResult = useQuery(GET_ADMIN_SUPPORT_CHATS, {
    skip: !open || user.memberType !== "ADMIN",
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: PREVIEW_LIMIT, direction: "DESC", search: { chatScope: "ADMIN_SUPPORT" } } },
  });

  const unreadCount = Number((unreadResult.data as any)?.getMyUnreadChatCount ?? 0);

  const previewChats = useMemo(() => {
    const userDirectChats = (((userDirectResult.data as any)?.getMyChats?.list ?? []) as PreviewChat[]);
    const brandDirectChats = (((brandDirectResult.data as any)?.getBrandChats?.list ?? []) as PreviewChat[]);
    const mySupportChats = (((supportResult.data as any)?.getMySupportChats?.list ?? []) as PreviewChat[]);
    const adminSupportChats = (((adminSupportResult.data as any)?.getAdminSupportChats?.list ?? []) as PreviewChat[]);

    const combined =
      user.memberType === "USER"
        ? [...userDirectChats, ...mySupportChats]
        : user.memberType === "BRAND"
          ? [...brandDirectChats, ...mySupportChats]
          : adminSupportChats;

    return combined
      .filter((chat, index, arr) => arr.findIndex((item) => item._id === chat._id) === index)
      .sort((a, b) => {
        const timeA = new Date(a.lastMessageAt || a.updatedAt || 0).getTime();
        const timeB = new Date(b.lastMessageAt || b.updatedAt || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, PREVIEW_LIMIT);
  }, [
    adminSupportResult.data,
    brandDirectResult.data,
    supportResult.data,
    user.memberType,
    userDirectResult.data,
  ]);

  const previewLoading =
    (user.memberType === "USER" && (userDirectResult.loading || supportResult.loading)) ||
    (user.memberType === "BRAND" && (brandDirectResult.loading || supportResult.loading)) ||
    (user.memberType === "ADMIN" && adminSupportResult.loading);

  const handleIconClick = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setOpen(true);
  };

  return (
    <>
      <Badge badgeContent={unreadCount} color="primary" invisible={!isLoggedIn || unreadCount === 0}>
        <IconButton onClick={handleIconClick} aria-label="Chats">
          <SvgIcon sx={{ fontSize: 24 }}>
            <svg viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 18H5.75C4.784 18 4 17.216 4 16.25v-8.5C4 6.784 4.784 6 5.75 6h12.5C19.216 6 20 6.784 20 7.75v8.5c0 .966-.784 1.75-1.75 1.75H12l-3.5 3V18Z" />
                <path d="M8 10.5h8M8 13.5h5" />
              </g>
            </svg>
          </SvgIcon>
        </IconButton>
      </Badge>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 420 },
            maxWidth: "100vw",
            bgcolor: "transparent",
            backgroundImage: "none",
            boxShadow: "none",
          },
        }}
      >
        <Stack
          sx={{
            height: "100%",
            p: { xs: 1.25, sm: 1.5 },
            bgcolor: "rgba(248,250,252,0.82)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(241,245,249,0.95) 100%)",
            backdropFilter: "blur(14px)",
          }}
        >
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "rgba(148, 163, 184, 0.25)",
              boxShadow: "0 20px 46px rgba(15, 23, 42, 0.10)",
              bgcolor: "rgba(255,255,255,0.9)",
            }}
          >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{
              px: 3,
              py: 2.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "rgba(248,250,252,0.92)",
            }}
          >
            <Stack spacing={0.25}>
              <Typography variant="h4" fontWeight={700}>
                Messages
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recent conversations and unread activity
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Button
                component={Link}
                href={href}
                onClick={() => setOpen(false)}
                endIcon={<OpenInNewRounded fontSize="small" />}
                sx={{ textTransform: "none", borderRadius: 999 }}
              >
                View all
              </Button>

              <IconButton onClick={() => setOpen(false)} sx={{ bgcolor: "rgba(15,23,42,0.04)" }}>
                <CloseRounded />
              </IconButton>
            </Stack>
          </Stack>

          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 1.25,
              scrollBehavior: "smooth",
              "&::-webkit-scrollbar": { width: 8 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(148,163,184,0.4)",
                borderRadius: 999,
              },
            }}
          >
            {previewLoading && !previewChats.length ? (
              <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 220 }}>
                <CircularProgress size={26} />
              </Stack>
            ) : previewChats.length ? (
              <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {previewChats.map((chat, index) => (
                  <Box key={chat._id}>
                    <ChatPreviewRow chat={chat} href={href} memberType={user.memberType} onNavigate={() => setOpen(false)} />
                    {index < previewChats.length - 1 && <Divider sx={{ opacity: 0, my: 0.1 }} />}
                  </Box>
                ))}
              </List>
            ) : (
              <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ minHeight: 320, px: 3 }}>
                <ForumOutlined sx={{ fontSize: 40, color: "grey.300" }} />
                <Typography variant="h4" textAlign="center">
                  No conversations yet
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  No unread conversations
                </Typography>
                <Button
                  component={Link}
                  href={href}
                  onClick={() => setOpen(false)}
                  variant="contained"
                  endIcon={<OpenInNewRounded fontSize="small" />}
                  sx={{ mt: 2, minWidth: 240, borderRadius: 999 }}
                >
                  Open chat management
                </Button>
              </Stack>
            )}
          </Box>
          </Card>
        </Stack>
      </Drawer>
    </>
  );
}
