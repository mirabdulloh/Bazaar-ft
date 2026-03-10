"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import SupportAgentRounded from "@mui/icons-material/SupportAgentRounded";
import { useReactiveVar } from "@apollo/client/react";
import { userVar } from "../../../../apollo/store";
import { CustomJwtPayload } from "lib/types/customJwtPayload";
import { useChat } from "../chat-provider";

export function SupportChatButton() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const user = useReactiveVar(userVar) as CustomJwtPayload;
  const isUser = user?.memberType === "USER";
  const isLoggedIn = !!user?._id;

  const { isSupportOpen, openSupport, closeSupport } = useChat();

  // Render nothing until client has hydrated — prevents SSR mismatch
  if (!mounted) return null;
  if (!isLoggedIn || !isUser) return null;
  if (isSupportOpen) return null;

  return (
    <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300 }}>
      <Fab
        color="primary"
        aria-label="Open support chat"
        onClick={openSupport}
        sx={{ boxShadow: 6 }}
      >
        <SupportAgentRounded />
      </Fab>
    </Box>
  );
}
