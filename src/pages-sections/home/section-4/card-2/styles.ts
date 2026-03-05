"use client";

import { styled } from "@mui/material/styles";

// STYLED COMPONENT
export const Wrapper = styled("div")(({ theme }) => ({
  gap: 10,
  minHeight: 260,
  display: "flex",
  overflow: "hidden",
  position: "relative",
  color: theme.palette.common.white,
  "&::before": {
    inset: 0,
    zIndex: 1,
    width: "100%",
    height: "100%",
    content: "''",
    position: "absolute",
    background:
      "linear-gradient(90deg, rgba(8,16,24,0.5) 0%, rgba(8,16,24,0.22) 45%, rgba(8,16,24,0) 70%)"
  },
  "& img": {
    objectFit: "cover",
    objectPosition: "center"
  },
  "& .content": {
    zIndex: 2,
    maxWidth: 300,
    paddingLeft: "2rem",
    paddingTop: "2rem",
    position: "relative",
    "& .body": {
      fontSize: 14,
      marginTop: ".25rem",
      textShadow: "0 6px 16px rgba(8,16,24,0.4)"
    },
    "& .title": {
      fontWeight: 600,
      lineHeight: 1.3,
      fontSize: "1.25rem",
      textShadow: "0 6px 18px rgba(8,16,24,0.45)"
    },
    "& .btn": {
      fontWeight: 600,
      fontSize: 12,
      marginTop: "1.5rem",
      display: "inline-block",
      borderBottom: `2px solid ${theme.palette.common.white}`
    }
  },
  [theme.breakpoints.down("sm")]: { minHeight: 220 }
}));
