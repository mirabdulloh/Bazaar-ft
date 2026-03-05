"use client";

import { styled } from "@mui/material/styles";

// STYLED COMPONENT
export const Wrapper = styled("div")(({ theme }) => ({
  gap: 10,
  minHeight: 280,
  display: "flex",
  overflow: "hidden",
  position: "relative",
  alignItems: "flex-end",
  color: theme.palette.common.white,

  "&::before": {
    inset: 0,
    zIndex: 1,
    width: "100%",
    height: "100%",
    content: "''",
    position: "absolute",
    background:
      "linear-gradient(90deg, rgba(8,16,24,0.6) 0%, rgba(8,16,24,0.25) 45%, rgba(8,16,24,0) 70%)"
  },

  "& img": {
    objectFit: "cover",
    objectPosition: "center"
  },

  "& .content": {
    zIndex: 2,
    maxWidth: 370,
    paddingLeft: "3rem",
    paddingBottom: "3rem",
    position: "relative",
    "& .title": {
      lineHeight: 1.3,
      fontSize: "1.75rem",
      textShadow: "0 8px 22px rgba(8,16,24,0.45)"
    },
    "& .btn": {
      borderRadius: 0,
      marginTop: "1.5rem",
      backgroundColor: theme.palette.common.white,
      color: theme.palette.text.primary
    }
  },

  [theme.breakpoints.down("sm")]: {
    minHeight: 240,
    "& .content": {
      maxWidth: 270,
      paddingLeft: "2rem",
      paddingBottom: "2rem"
    }
  }
}));
