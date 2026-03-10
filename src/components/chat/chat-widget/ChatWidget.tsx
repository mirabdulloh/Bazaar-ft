"use client";

import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import ListItemButton from "@mui/material/ListItemButton";
import Paper from "@mui/material/Paper";
import Slide from "@mui/material/Slide";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ChatBubbleOutlineRounded from "@mui/icons-material/ChatBubbleOutlineRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import { useReactiveVar } from "@apollo/client/react";
import { userVar } from "../../../../apollo/store";
import { CustomJwtPayload } from "lib/types/customJwtPayload";
import { useChat } from "../chat-provider";
import { useQuery } from "lib/hooks/useQuery";
import { GET_BRANDS } from "../../../../apollo/user/query";
import { MessageBubble } from "../shared/MessageBubble";
import { ChatInput } from "../shared/ChatInput";
import { T } from "lib/types/common";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function resolveImage(img?: string | null): string {
  if (!img || img === "null" || img === "undefined") return "";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const normalized = img.startsWith("/") ? img : `/${img}`;
  return API_URL ? `${API_URL}${normalized}` : normalized;
}

// ─── Screen A: Brand Selection ────────────────────────────────────────────────

function BrandSelectionScreen() {
  const [search, setSearch] = useState("");
  const { openBrandChat, openingChat } = useChat();

  const { data: brandsData, loading: brandsLoading } = useQuery(GET_BRANDS, {
    fetchPolicy: "cache-and-network",
    variables: {
      input: { page: 1, limit: 20, search: {}, sort: "memberRank", direction: "DESC" },
    },
  });

  const brands: T[] = (brandsData as T)?.getBrands?.brands ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return brands;
    const q = search.toLowerCase();
    return brands.filter((b: T) =>
      (b.brandName as string)?.toLowerCase().includes(q)
    );
  }, [brands, search]);

  return (
    <>
      {/* Search */}
      <Box sx={{ p: 1.5, pb: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search brands…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded sx={{ fontSize: 18, color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 999,
              fontSize: "0.85rem",
            },
          }}
        />
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ px: 2, pb: 0.5 }}>
        Select a brand to start a chat
      </Typography>

      {/* Brand list */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {brandsLoading || openingChat ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : filtered.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ p: 2, textAlign: "center" }}
          >
            {search ? "No brands found." : "No brands available."}
          </Typography>
        ) : (
          filtered.map((brand: T) => {
            const avatar = resolveImage(
              (brand.brandLogo as string) ||
                ((brand.memberData as T)?.memberImage as string)
            );
            return (
              <ListItemButton
                key={brand._id as string}
                onClick={() => openBrandChat(brand._id as string)}
                sx={{ px: 2, py: 1.25, gap: 1.5 }}
              >
                <Avatar src={avatar} sx={{ width: 40, height: 40, flexShrink: 0 }}>
                  {(brand.brandName as string)?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {brand.brandName as string}
                  </Typography>
                  {brand.brandDesc && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {brand.brandDesc as string}
                    </Typography>
                  )}
                </Box>
                <ChatBubbleOutlineRounded
                  sx={{ fontSize: 18, color: "text.disabled", flexShrink: 0 }}
                />
              </ListItemButton>
            );
          })
        )}
      </Box>
    </>
  );
}

// ─── Screen B: Chat Thread ────────────────────────────────────────────────────

function ChatThreadScreen() {
  const user = useReactiveVar(userVar) as CustomJwtPayload;
  const { localMessages, conversationId, sendNavbarMessage, goBackToBrands } =
    useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages.length]);

  const handleSend = async (text: string) => {
    try {
      await sendNavbarMessage(text);
    } catch {
      // Error already rolled back optimistic; re-throw if needed
    }
  };

  return (
    <>
      {/* Messages area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 0.25,
        }}
      >
        {localMessages.length === 0 ? (
          <Box
            sx={{
              maxWidth: "80%",
              alignSelf: "flex-start",
              bgcolor: "grey.100",
              px: 1.5,
              py: 1,
              borderRadius: "16px 16px 16px 4px",
            }}
          >
            <Typography variant="body2">
              Hi! How can we help you today?
            </Typography>
          </Box>
        ) : (
          localMessages.map((msg: T, idx: number) => {
            const isMine = String(msg.senderId) === String(user._id);
            const prevMsg = localMessages[idx - 1] as T | undefined;
            const showAvatar =
              !isMine &&
              (prevMsg === undefined ||
                String(prevMsg.senderId) !== String(msg.senderId));
            return (
              <MessageBubble
                key={String(msg._id)}
                message={msg}
                isMine={isMine}
                showAvatar={showAvatar}
                isOptimistic={String(msg._id).startsWith("local-")}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={!conversationId}
        placeholder="Type your message…"
      />
    </>
  );
}

// ─── Main ChatWidget ──────────────────────────────────────────────────────────

export function ChatWidget() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const user = useReactiveVar(userVar) as CustomJwtPayload;
  const isUser = user?.memberType === "USER";
  const isLoggedIn = !!user?._id;

  const { isOpen, closeChat, screen, goBackToBrands } = useChat();

  const headerTitle = screen === "chat" ? "Chat" : "Chat with a Brand";

  if (!mounted || !isLoggedIn || !isUser) return null;

  return (
    <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
      <Paper
        elevation={12}
        sx={{
          position: "fixed",
          bottom: { xs: 0, sm: 80 },
          right: { xs: 0, sm: 24 },
          left: { xs: 0, sm: "auto" },
          width: { xs: "100vw", sm: 360 },
          height: { xs: "100dvh", sm: 500 },
          zIndex: 1300,
          borderRadius: { xs: 0, sm: 3 },
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        {/* ── Header ── */}
        <Box
          sx={{
            px: 1.5,
            py: 1,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          {screen === "chat" && (
            <IconButton
              size="small"
              onClick={goBackToBrands}
              aria-label="Back to brands"
            >
              <ArrowBackRounded fontSize="small" />
            </IconButton>
          )}

          <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1, ml: screen === "brands" ? 0.5 : 0 }}>
            {headerTitle}
          </Typography>

          <IconButton size="small" onClick={closeChat} aria-label="Close chat">
            <CloseRounded fontSize="small" />
          </IconButton>
        </Box>

        {/* ── Body ── */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {screen === "brands" ? <BrandSelectionScreen /> : <ChatThreadScreen />}
        </Box>
      </Paper>
    </Slide>
  );
}
