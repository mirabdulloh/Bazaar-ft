"use client";

import { styled } from "@mui/material/styles";

export const StyledRoot = styled("div")<{ hasSecondImage?: boolean }>(({ hasSecondImage }) => ({
  height: "100%",
  margin: "auto",
  position: "relative",
  "&:hover .card-img-box": { boxShadow: "0 12px 32px rgba(0,0,0,0.12)" },
  "&:hover .img-primary": { opacity: hasSecondImage ? 0 : 1 },
  "&:hover .img-secondary": { opacity: 1 },
  "&:hover .cart-overlay": { transform: "translateY(0)" },
}));

export const ImageBox = styled("div")(({ theme }) => ({
  borderRadius: 12,
  overflow: "hidden",
  position: "relative",
  height: 370,
  backgroundColor: theme.palette.grey[100],
  transition: "box-shadow 0.35s ease",
  [theme.breakpoints.down("sm")]: { height: 260 },
}));

export const ImageLayer = styled("div")({
  position: "absolute",
  inset: 0,
  transition: "opacity 0.45s ease",
  "& img": {
    objectFit: "cover",
    objectPosition: "center",
  },
});

// Discount badge — top left, replaces default DiscountChip
export const DiscountBadge = styled("div")(({ theme }) => ({
  position: "absolute",
  top: 12,
  left: 12,
  zIndex: 1,
  backgroundColor: theme.palette.error.main,
  color: "#fff",
  borderRadius: 6,
  padding: "5px 10px",
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: "0.4px",
  lineHeight: 1.4,
  textTransform: "uppercase",
}));

// Views badge — top right, frosted dark pill
export const ViewBadge = styled("div")({
  position: "absolute",
  top: 12,
  right: 12,
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  gap: 5,
  backgroundColor: "rgba(0,0,0,0.5)",
  backdropFilter: "blur(6px)",
  borderRadius: 8,
  padding: "5px 10px",
  "& svg": { fontSize: 15, color: "#fff" },
});

export const CartOverlay = styled("div")({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  padding: 12,
  transform: "translateY(110%)",
  transition: "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
});

export const ContentWrapper = styled("div")(({ theme }) => ({
  marginTop: 12,
  // Product title
  "& .title": {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    fontWeight: 600,
    fontSize: 15,
    [theme.breakpoints.down("sm")]: { fontSize: 14 },
  },
  // Price row — price on left, likes on right
  "& .price-row": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 5,
  },
  // Current (discounted) price
  "& .current-price": {
    fontSize: 18,
    fontWeight: 700,
    color: theme.palette.primary.main,
    lineHeight: 1.2,
    [theme.breakpoints.down("sm")]: { fontSize: 16 },
  },
  // Original price with strikethrough
  "& .original-price": {
    fontSize: 12,
    fontWeight: 400,
    color: theme.palette.grey[400],
    textDecoration: "line-through",
    marginLeft: 5,
    [theme.breakpoints.down("sm")]: { fontSize: 11 },
  },
  // Likes — right of price
  "& .likes": {
    display: "flex",
    alignItems: "center",
    gap: 4,
    "& svg": { fontSize: 17, color: theme.palette.grey[500] },
    "& span": {
      fontSize: 13,
      color: theme.palette.text.secondary,
      fontWeight: 500,
    },
  },
}));
