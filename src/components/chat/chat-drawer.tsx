"use client";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import SendRounded from "@mui/icons-material/SendRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import { useChat } from "./chat-provider";

export function ChatDrawer() {
  const { open, closeChat } = useChat();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={closeChat}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 360 },
          maxWidth: "92vw",
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
          overflow: "hidden"
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

        <Stack spacing={1.5} sx={{ flex: 1, p: 2, overflowY: "auto" }}>
          <Box
            sx={{
              maxWidth: "80%",
              alignSelf: "flex-start",
              bgcolor: "grey.100",
              px: 1.5,
              py: 1,
              borderRadius: 2
            }}
          >
            <Typography variant="body2">
              Hi there. How can we help you today?
            </Typography>
          </Box>
        </Stack>

        <Divider />

        <Box sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type your message..."
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                bgcolor: "grey.50"
              }
            }}
          />
          <IconButton color="primary">
            <SendRounded />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
}
