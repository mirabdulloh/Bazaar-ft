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
  minHeight: 500,
  // borderRadius: 12,
  overflow: "hidden",
  position: "relative",
  display: "flex",
  alignItems: "start",
  opacity: 0,
  transform: "translate3d(0, 26px, 0) scale(0.98)",
  animation: `heroCardReveal 760ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms forwards`,
  "@keyframes heroCardReveal": {
    "0%": { opacity: 0, transform: "translate3d(0, 26px, 0) scale(0.98)" },
    "100%": { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" }
  },
  // ":hover img": { transform: "scale(1.1)" },

  "& img": {
    objectFit: "cover",
    objectPosition: "top center",
    opacity: 0,
    transform: "scale(1.08)",
    animation: `heroImageReveal 980ms cubic-bezier(0.22, 1, 0.36, 1) ${delay + 120}ms forwards`
    // transition: "all 4s cubic-bezier(0, 0, 0.1, 1)"
  },
  "@keyframes heroImageReveal": {
    "0%": { opacity: 0, transform: "scale(1.08)" },
    "100%": { opacity: 1, transform: "scale(1)" }
    // transition: "all 4s cubic-bezier(0, 0, 0.1, 1)"
  },

  "& .content": {
    zIndex: 1,
    maxWidth: 370,
    paddingTop: "3rem",
    paddingLeft: "3rem",
    position: "relative",
    "& .title": {
      fontWeight: 700,
      lineHeight: 1.3,
      fontSize: "2rem",
      [theme.breakpoints.down("sm")]: { fontSize: "1.5rem" }
    },
    "& .body": {
      fontSize: 14,
      marginTop: ".5rem"
    },
    "& .badge": {
      fontSize: 14,
      marginBottom: ".5rem",
      display: "inline-block"
    },
    "& .btn": {
      fontWeight: 600,
      fontSize: 12,
      marginTop: "2rem",
      display: "inline-block",
      borderBottom: `2px solid ${theme.palette.primary.main}`
    },

    [theme.breakpoints.down("sm")]: { paddingLeft: "2rem", maxWidth: 270 }
  }
}));
