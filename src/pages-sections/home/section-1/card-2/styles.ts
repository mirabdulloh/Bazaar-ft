"use client";

import { styled } from "@mui/material/styles";

interface WrapperProps {
  delay?: number;
}

// STYLED COMPONENT
export const Wrapper = styled("div", {
  shouldForwardProp: (prop) => prop !== "delay"
})<WrapperProps>(({ theme, delay = 0 }) => ({
  gap: 10,
  minHeight: 260,
  overflow: "hidden",
  position: "relative",
  display: "flex",
  alignItems: "center",
  color: theme.palette.common.white,
  opacity: 0,
  transform: "translate3d(0, 24px, 0)",
  animation: `heroSmallCardReveal 680ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms forwards`,
  "@keyframes heroSmallCardReveal": {
    "0%": { opacity: 0, transform: "translate3d(0, 24px, 0)" },
    "100%": { opacity: 1, transform: "translate3d(0, 0, 0)" }
  },

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
    opacity: 0,
    transform: "scale(1.08)",
    animation: `heroSmallImageReveal 920ms cubic-bezier(0.22, 1, 0.36, 1) ${delay + 100}ms forwards`
  },
  "@keyframes heroSmallImageReveal": {
    "0%": { opacity: 0, transform: "scale(1.08)" },
    "100%": { opacity: 1, transform: "scale(1)" }
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
