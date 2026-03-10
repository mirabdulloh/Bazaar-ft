"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DoneAllRounded from "@mui/icons-material/DoneAllRounded";
import { T } from "lib/types/common";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function resolveImage(img?: string | null): string {
  if (!img || img === "null" || img === "undefined") return "";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const normalized = img.startsWith("/") ? img : `/${img}`;
  return API_URL ? `${API_URL}${normalized}` : normalized;
}

interface MessageBubbleProps {
  message: T;
  isMine: boolean;
  showAvatar?: boolean;
  isOptimistic?: boolean;
}

export function MessageBubble({
  message,
  isMine,
  showAvatar = true,
  isOptimistic = false,
}: MessageBubbleProps) {
  const time = message.createdAt
    ? new Date(message.createdAt as string).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  const senderImage = resolveImage(
    (message.senderData as T)?.memberImage as string
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMine ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 0.75,
        mb: 0.5,
      }}
    >
      {/* Avatar */}
      {!isMine && showAvatar ? (
        <Avatar
          src={senderImage}
          sx={{ width: 28, height: 28, flexShrink: 0, mb: "2px" }}
        />
      ) : (
        !isMine && <Box sx={{ width: 28, flexShrink: 0 }} />
      )}

      {/* Bubble */}
      <Box
        sx={{
          maxWidth: "75%",
          bgcolor: isMine ? "primary.main" : "grey.100",
          color: isMine ? "primary.contrastText" : "text.primary",
          px: 1.5,
          pt: 1,
          pb: 0.75,
          borderRadius: isMine
            ? "16px 16px 4px 16px"
            : "16px 16px 16px 4px",
          opacity: isOptimistic ? 0.7 : 1,
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
        }}
      >
        <Typography
          variant="body2"
          sx={{ wordBreak: "break-word", lineHeight: 1.4 }}
        >
          {message.message as string}
        </Typography>

        {time && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 0.4,
              mt: 0.25,
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontSize: "0.6rem", opacity: 0.7 }}
            >
              {time}
            </Typography>
            {isMine && !isOptimistic && (
              <DoneAllRounded sx={{ fontSize: 12, opacity: 0.7 }} />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
