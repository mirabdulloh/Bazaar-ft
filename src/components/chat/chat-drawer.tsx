"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import SendRounded from "@mui/icons-material/SendRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import { useChat } from "./chat-provider";
import { useQuery } from "lib/hooks/useQuery";
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { OPEN_OR_GET_CHAT, SEND_MESSAGE } from "../../../apollo/user/mutation";
import { GET_BRANDS, GET_MESSAGES } from "../../../apollo/user/query";
import { userVar } from "../../../apollo/store";
import { T } from "lib/types/common";
import { CustomJwtPayload } from "lib/types/customJwtPayload";

const SUPPORT_BRAND_ID = process.env.NEXT_PUBLIC_SUPPORT_BRAND_ID ?? "";

const getBrandIdFromPath = (pathname: string) => {
  const match = pathname.match(/^\/brands\/([^/?#]+)/);
  return match?.[1] ?? "";
};

export function ChatDrawer() {
  const { open, closeChat } = useChat();
  const pathname = usePathname();
  const user = useReactiveVar(userVar) as CustomJwtPayload;
  const isLoggedIn = !!user?._id;

  const [conversationId, setConversationId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<T[]>([]);

  const pathBrandId = useMemo(() => getBrandIdFromPath(pathname || ""), [pathname]);

  const { data: brandsData, loading: brandsLoading } = useQuery(GET_BRANDS, {
    variables: { input: { page: 1, limit: 8, search: {}, sort: "memberRank", direction: "DESC" } },
    skip: !open || !!pathBrandId || !!SUPPORT_BRAND_ID,
    fetchPolicy: "cache-and-network"
  });

  const brands: T[] = (brandsData as T)?.getBrands?.brands ?? [];

  const { data: messagesData, loading: messagesLoading, refetch: refetchMessages } = useQuery(GET_MESSAGES, {
    variables: { input: { page: 1, limit: 50, conversationId } },
    skip: !conversationId,
    fetchPolicy: "cache-and-network"
  });

  useEffect(() => {
    if (!messagesData) return;
    const list: T[] = (messagesData as T)?.getMessages?.list ?? [];
    setLocalMessages(list);
  }, [messagesData]);

  const [openOrGetChat, { loading: openingChat }] = useMutation(OPEN_OR_GET_CHAT);
  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE);

  const ensureConversation = useCallback(async (id: string) => {
    if (!id || !isLoggedIn) return;
    const res = await openOrGetChat({
      variables: { input: { brandId: id, chatSubject: "Support Chat" } }
    });
    const chatId = (res?.data as T)?.openOrGetChat?._id as string;
    if (chatId) {
      setConversationId(chatId);
    }
  }, [openOrGetChat, isLoggedIn]);

  useEffect(() => {
    if (!open || !isLoggedIn || conversationId) return;
    const preferredId = pathBrandId || SUPPORT_BRAND_ID;
    if (preferredId) {
      ensureConversation(preferredId);
    }
  }, [open, isLoggedIn, conversationId, pathBrandId, ensureConversation]);

  const handleSelectBrand = async (id: string) => {
    await ensureConversation(id);
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || !conversationId) return;
    setMessage("");
    const optimistic: T = {
      _id: `local-${Date.now()}`,
      conversationId,
      senderId: user._id,
      message: trimmed,
      createdAt: new Date().toISOString()
    };
    setLocalMessages((prev) => [...prev, optimistic]);
    try {
      await sendMessage({ variables: { input: { conversationId, message: trimmed } } });
      refetchMessages();
    } catch {
      // ignore for now
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={closeChat}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 360 },
            maxWidth: "92vw",
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            overflow: "hidden"
          }
        }
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Live Chat
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Typically replies within a few minutes
            </Typography>
          </Box>
          <IconButton onClick={closeChat}>
            <CloseRounded />
          </IconButton>
        </Box>

        <Divider />

        {!isLoggedIn ? (
          <Box sx={{ flex: 1, p: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Stack spacing={2} textAlign="center">
              <Typography variant="body1" fontWeight={600}>
                Please log in to start a chat
              </Typography>
              <Button component={Link} href="/login" variant="contained">
                Go to Login
              </Button>
            </Stack>
          </Box>
        ) : !conversationId && !pathBrandId && !SUPPORT_BRAND_ID ? (
          <Box sx={{ flex: 1, p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Choose a brand to start a chat
            </Typography>
            <Stack spacing={1}>
              {brandsLoading ? (
                <Typography variant="body2" color="text.secondary">Loading brands…</Typography>
              ) : brands.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No brands available.</Typography>
              ) : (
                brands.map((b: T) => (
                  <Button
                    key={b._id as string}
                    variant="outlined"
                    onClick={() => handleSelectBrand(b._id as string)}
                    sx={{ justifyContent: "flex-start", gap: 1, textTransform: "none" }}
                  >
                    <Avatar src={(b.brandLogo as string) || (b.memberData as T)?.memberImage} sx={{ width: 28, height: 28 }} />
                    <Typography variant="body2" fontWeight={600}>
                      {b.brandName as string}
                    </Typography>
                  </Button>
                ))
              )}
            </Stack>
          </Box>
        ) : (
          <Stack spacing={1} sx={{ flex: 1, p: 2, overflowY: "auto" }}>
            {(openingChat || (messagesLoading && localMessages.length === 0)) ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 120 }}>
                <CircularProgress size={24} />
              </Box>
            ) : localMessages.length === 0 ? (
              <Box
                sx={{
                  maxWidth: "80%",
                  alignSelf: "flex-start",
                  bgcolor: "grey.100",
                  px: 1.5,
                  py: 1,
                  borderRadius: "14px 14px 14px 4px",
                }}
              >
                <Typography variant="body2">Hi there. How can we help you today?</Typography>
              </Box>
            ) : (
              localMessages.map((m: T) => {
                const isMine = m.senderId === user._id;
                const time = m.createdAt
                  ? new Date(m.createdAt as string).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                  : "";
                return (
                  <Box
                    key={m._id as string}
                    sx={{
                      maxWidth: "80%",
                      alignSelf: isMine ? "flex-end" : "flex-start",
                      bgcolor: isMine ? "primary.main" : "grey.100",
                      color: isMine ? "primary.contrastText" : "text.primary",
                      px: 1.5,
                      pt: 1,
                      pb: 0.75,
                      borderRadius: isMine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    }}
                  >
                    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>{m.message as string}</Typography>
                    {time && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          textAlign: "right",
                          mt: 0.25,
                          fontSize: "0.6rem",
                          opacity: 0.7,
                        }}
                      >
                        {time}
                      </Typography>
                    )}
                  </Box>
                );
              })
            )}
          </Stack>
        )}

        <Divider />

        <Box sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                bgcolor: "grey.50"
              }
            }}
          />
          <IconButton color="primary" onClick={handleSend} disabled={!conversationId || sending || openingChat}>
            <SendRounded />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
}
