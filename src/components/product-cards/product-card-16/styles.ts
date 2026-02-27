"use client";

import { styled } from "@mui/material/styles";

export const StyledRoot = styled("div")(({ theme }) => ({
  borderRadius: 12,
  overflow: "hidden",
  border: `1px solid ${theme.palette.divider}`,
  "&:hover .img-wrapper img": { scale: 1.1 },
  "& .img-wrapper": {
    display: "flex",
    position: "relative",
    backgroundColor: theme.palette.grey[50],
    img: { transition: "0.3s" }
  },
  "& .content": {
    padding: "1rem",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between"
  }
}));

export const PriceText = styled("p")(({ theme }) => ({
  fontSize: 17,
  lineHeight: 1,
  fontWeight: 600,
  marginTop: ".75rem",
  color: theme.palette.primary.main,
  ".base-price": {
    fontSize: 13,
    marginLeft: 8,
    textDecoration: "line-through",
    color: theme.palette.grey[600]
  }
}));
