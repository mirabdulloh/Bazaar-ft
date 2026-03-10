"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import SendRounded from "@mui/icons-material/SendRounded";
import EmojiEmotionsOutlined from "@mui/icons-material/EmojiEmotionsOutlined";

interface ChatInputProps {
  onSend: (message: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const TYPING_DEBOUNCE_MS = 300;
const TYPING_STOP_MS = 2000;

export function ChatInput({
  onSend,
  onTypingStart,
  onTypingStop,
  disabled = false,
  placeholder = "Type a message…",
}: ChatInputProps) {
  const [text, setText] = useState("");
  const isTypingRef = useRef(false);
  const typingStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingStartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (typingStartTimerRef.current) clearTimeout(typingStartTimerRef.current);
      if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current);
    };
  }, []);

  const triggerTypingStop = useCallback(() => {
    if (!isTypingRef.current) return;
    isTypingRef.current = false;
    onTypingStop?.();
  }, [onTypingStop]);

  const handleChange = useCallback(
    (value: string) => {
      setText(value);

      if (!value) {
        triggerTypingStop();
        return;
      }

      // Debounce typing start
      if (!isTypingRef.current) {
        if (typingStartTimerRef.current)
          clearTimeout(typingStartTimerRef.current);
        typingStartTimerRef.current = setTimeout(() => {
          if (!isTypingRef.current) {
            isTypingRef.current = true;
            onTypingStart?.();
          }
        }, TYPING_DEBOUNCE_MS);
      }

      // Reset typing stop timer
      if (typingStopTimerRef.current)
        clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = setTimeout(
        triggerTypingStop,
        TYPING_STOP_MS
      );
    },
    [onTypingStart, triggerTypingStop]
  );

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    setText("");
    triggerTypingStop();
    onSend(trimmed);
  }, [text, disabled, onSend, triggerTypingStop]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5, p: 1.5 }}>
      <IconButton size="small" disabled sx={{ color: "text.disabled" }}>
        <EmojiEmotionsOutlined fontSize="small" />
      </IconButton>

      <TextField
        fullWidth
        multiline
        maxRows={4}
        size="small"
        placeholder={placeholder}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 999,
            bgcolor: "grey.50",
            fontSize: "0.875rem",
          },
        }}
      />

      <IconButton
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        color="primary"
        sx={{
          bgcolor: text.trim() ? "primary.main" : "transparent",
          color: text.trim() ? "primary.contrastText" : "text.disabled",
          "&:hover": { bgcolor: text.trim() ? "primary.dark" : "transparent" },
          transition: "all 0.2s ease",
          flexShrink: 0,
        }}
      >
        <SendRounded fontSize="small" />
      </IconButton>
    </Box>
  );
}
