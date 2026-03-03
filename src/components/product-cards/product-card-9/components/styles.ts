"use client";

import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";

export const StyledFavoriteIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "mode" && prop !== "liked",
})<{ mode?: "floating" | "inline"; liked?: boolean }>(({ theme, mode = "floating", liked }) => ({
  ...(mode === "floating"
    ? {
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 1,
        bgcolor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        "&:hover": { bgcolor: theme.palette.background.paper },
      }
    : {
        padding: theme.spacing(0.3),
      }),
  color: liked ? theme.palette.error.main : theme.palette.grey[500],
}));

