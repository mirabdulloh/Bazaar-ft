"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import { styled, alpha } from "@mui/material/styles";

// ─── Main profile card wrapper ────────────────────────────────────────────────
export const ProfileCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: 12,
  overflow: "hidden",
  elevation: 0,
  boxShadow: "none",
  [theme.breakpoints.down("md")]: {
    border: "none",
    borderRadius: 0,
    boxShadow: "none",
  },
}));

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export const SidebarWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  borderRight: `1px solid ${theme.palette.grey[200]}`,
  height: "100%",
  [theme.breakpoints.down("md")]: {
    borderRight: "none",
  },
}));

export const SidebarProfileBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  textAlign: "center",
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
}));

export const SidebarAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  marginLeft: "auto",
  marginRight: "auto",
  marginBottom: theme.spacing(1.5),
  border: `3px solid ${theme.palette.primary.main}`,
}));

export const SidebarNav = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
}));

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
export const NavItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isActive",
})<{ isActive?: boolean }>(({ theme, isActive }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: `${theme.spacing(1)} ${theme.spacing(1.5)}`,
  marginBottom: 2,
  borderRadius: 8,
  cursor: "pointer",
  transition: "all 0.2s ease",
  borderLeft: "3px solid transparent",
  color: theme.palette.text.secondary,
  fontWeight: 400,
  ...(isActive && {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    fontWeight: 600,
    borderLeftColor: theme.palette.primary.main,
  }),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    color: theme.palette.primary.main,
  },
}));

export const LogoutNavItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: `${theme.spacing(1)} ${theme.spacing(1.5)}`,
  borderRadius: 8,
  cursor: "pointer",
  transition: "all 0.2s ease",
  color: theme.palette.error.main,
  "&:hover": {
    backgroundColor: alpha(theme.palette.error.main, 0.06),
  },
}));

// ─── Section Label ────────────────────────────────────────────────────────────
export const SectionLabel = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(1.5),
  paddingRight: theme.spacing(1.5),
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(0.5),
  display: "block",
  fontSize: 10,
  letterSpacing: 1.2,
  textTransform: "uppercase",
  color: theme.palette.text.disabled,
}));

// ─── Right content area ──────────────────────────────────────────────────────
export const ContentArea = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: 500,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

// ─── Section Title Bar (left border accent) ──────────────────────────────────
export const SectionTitleBar = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(1.5),
  borderLeft: `3px solid ${theme.palette.primary.main}`,
}));

// ─── Panel Card (used for every card in content panels) ──────────────────────
export const PanelCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  border: `1px solid ${theme.palette.grey[100]}`,
  borderRadius: 10,
  boxShadow: "none",
}));

// ─── Overview hero card with gradient ────────────────────────────────────────
export const OverviewHeroCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.grey[100]}`,
  borderRadius: 10,
  boxShadow: "none",
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
}));

export const OverviewAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  border: `3px solid ${theme.palette.primary.main}`,
}));

// ─── Stat Card ───────────────────────────────────────────────────────────────
export const StatCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  border: `1px solid ${theme.palette.grey[100]}`,
  borderRadius: 8,
  boxShadow: "none",
}));

// ─── Info Row ────────────────────────────────────────────────────────────────
export const InfoRowWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: theme.spacing(1.25),
  paddingBottom: theme.spacing(1.25),
  borderBottom: `1px solid ${theme.palette.grey[100]}`,
}));

// ─── Order item card ─────────────────────────────────────────────────────────
export const OrderCard = styled(Card)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  border: `1px solid ${theme.palette.grey[100]}`,
  borderRadius: 8,
  boxShadow: "none",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.grey[50],
  },
}));

export const OrderStatusRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1),
  flexWrap: "wrap",
  marginTop: theme.spacing(1.5),
}));

export const OrderSummaryGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: theme.spacing(1),
  marginTop: theme.spacing(1.5),
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
  },
}));

export const OrderSummaryCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.1),
  borderRadius: 10,
  border: `1px solid ${theme.palette.grey[200]}`,
  backgroundColor: theme.palette.grey[50],
}));

export const OrderItemsPreview = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  paddingTop: theme.spacing(1.25),
  paddingBottom: theme.spacing(1.25),
}));

export const OrderProductLine = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "60px minmax(0, 1fr) auto",
  gap: theme.spacing(1.5),
  alignItems: "center",
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "56px minmax(0, 1fr)",
  },
}));

export const OrderProductThumb = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: 10,
  overflow: "hidden",
  border: `1px solid ${theme.palette.grey[200]}`,
  backgroundColor: theme.palette.grey[100],
  position: "relative",
  flexShrink: 0,
  [theme.breakpoints.down("sm")]: {
    width: 56,
    height: 56,
  },
}));

export const OrderProductInfo = styled(Box)({
  minWidth: 0,
});

export const OrderActionBar = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: theme.spacing(1),
  flexWrap: "wrap",
  paddingTop: theme.spacing(1),
}));

export const OrderVariantBadge = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  padding: `${theme.spacing(0.35)} ${theme.spacing(1)}`,
  borderRadius: 999,
  border: `1px solid ${theme.palette.grey[200]}`,
  backgroundColor: theme.palette.common.white,
  color: theme.palette.text.secondary,
  fontSize: 11,
  fontWeight: 600,
}));

// ─── Empty state card ────────────────────────────────────────────────────────
export const EmptyCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: "center",
  border: `1px solid ${theme.palette.grey[100]}`,
  borderRadius: 10,
  boxShadow: "none",
}));

// ─── Product card ────────────────────────────────────────────────────────────
export const ProductCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[100]}`,
  borderRadius: 10,
  overflow: "hidden",
  boxShadow: "none",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    transform: "translateY(-2px)",
  },
}));

export const ProductImageBox = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: 140,
  backgroundColor: theme.palette.grey[50],
}));

// ─── People / follow card ────────────────────────────────────────────────────
export const PeopleCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  border: `1px solid ${theme.palette.grey[100]}`,
  borderRadius: 10,
  boxShadow: "none",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.grey[50],
  },
}));

// ─── People Table Styles ─────────────────────────────────────────────────────
export const PeopleTableWrapper = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: 12,
  overflow: "hidden",
  minHeight: 520,
  display: "flex",
  flexDirection: "column",
}));

export const PeopleTableHeader = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(120px, 1.2fr) 2fr minmax(100px, 0.8fr)",
  padding: `${theme.spacing(1.5)} ${theme.spacing(2.5)}`,
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));

export const PeopleTableRow = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(120px, 1.2fr) 2fr minmax(100px, 0.8fr)",
  alignItems: "center",
  padding: `${theme.spacing(2)} ${theme.spacing(2.5)}`,
  borderBottom: `1px solid ${theme.palette.grey[100]}`,
  transition: "background-color 0.15s ease",
  "&:last-child": {
    borderBottom: "none",
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
  [theme.breakpoints.down("sm")]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
    padding: theme.spacing(2),
  },
}));

export const PeopleNameCell = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  minWidth: 0,
  width: "100%",
});

export const PeopleDetailsCell = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2.5),
  flexWrap: "wrap",
  [theme.breakpoints.down("sm")]: {
    gap: theme.spacing(1),
    width: "100%",
    paddingLeft: 60,
  },
}));

export const PeopleSubscriptionCell = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 10,
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    paddingLeft: 60,
    justifyContent: "flex-start",
  },
}));

export const DetailBadge = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontSize: 13,
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

export const PaginationWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(1.5, 0, 0.5),
  gap: theme.spacing(1),
}));

// ─── Edit profile — avatar upload ────────────────────────────────────────────
export const AvatarUploadWrapper = styled(Box)({
  position: "relative",
  display: "inline-block",
});

export const EditAvatar = styled(Avatar)(({ theme }) => ({
  width: 90,
  height: 90,
  border: `3px solid ${theme.palette.primary.main}`,
}));

export const CameraButton = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: -2,
  right: -2,
  width: 30,
  height: 30,
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.main,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: theme.shadows[2],
  transition: "all 0.2s",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));
