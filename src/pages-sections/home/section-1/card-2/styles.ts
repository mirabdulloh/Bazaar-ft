"use client";

import { styled } from "@mui/material/styles";

// STYLED COMPONENT
export const Wrapper = styled("div")(({ theme }) => ({
  gap: 10,
  minHeight: 260,
  overflow: "hidden",
  position: "relative",
  display: "flex",
  alignItems: "center",
  color: theme.palette.common.white,
  "&::before": {
    inset: 0,
    zIndex: 1,
    width: "100%",
    height: "100%",
    content: "''",
    position: "absolute",
    background:
      "linear-gradient(90deg, rgba(8,16,24,0.55) 0%, rgba(8,16,24,0.22) 45%, rgba(8,16,24,0) 70%)"
  },

  "& img": {
    objectFit: "cover",
    objectPosition: "center",
    opacity: 1,
    transform: "none"
  },

  "& .content": {
    zIndex: 2,
    maxWidth: 300,
    paddingLeft: "2rem",
    position: "relative",
    "& .title": {
      fontWeight: 700,
      lineHeight: 1.3,
      fontSize: "1.5rem",
      textShadow: "0 6px 18px rgba(8,16,24,0.45)",
      [theme.breakpoints.down("sm")]: { fontSize: "1.5rem" }
    },
    "& .body": {
      fontSize: 14,
      marginTop: ".5rem",
      textShadow: "0 5px 14px rgba(8,16,24,0.4)"
    },
    "& .badge": {
      fontSize: 14,
      marginBottom: ".5rem",
      display: "inline-block",
      textShadow: "0 4px 12px rgba(8,16,24,0.4)"
    },
    "& .btn": {
      fontWeight: 600,
      fontSize: 12,
      marginTop: "2rem",
      display: "inline-block",
      borderBottom: `2px solid ${theme.palette.common.white}`
    },

    [theme.breakpoints.down("sm")]: { paddingLeft: "2rem", maxWidth: 270 }
  }
}));
