"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { alpha, styled } from "@mui/material/styles";

export const ProfileHeroCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: 16,
  boxShadow: "none",
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(
    theme.palette.primary.main,
    0.01
  )} 100%)`,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2.5, 2),
    borderRadius: 12
  }
}));

export const StatBox = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(2, 3),
  borderRadius: 12,
  border: `1px solid ${theme.palette.grey[100]}`,
  minWidth: 100,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 1.5),
    minWidth: 0,
    flex: 1,
    borderRadius: 8
  }
}));

export const SectionCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: 12,
  boxShadow: "none"
}));

export const TableWrapper = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: 12,
  overflow: "hidden",
  minHeight: 520,
  display: "flex",
  flexDirection: "column",
  [theme.breakpoints.down("sm")]: {
    minHeight: 400,
    borderRadius: 10
  }
}));

export const TableHeader = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(120px, 1.2fr) 2fr minmax(100px, 0.8fr)",
  padding: `${theme.spacing(1.5)} ${theme.spacing(2.5)}`,
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  [theme.breakpoints.down("sm")]: {
    display: "none"
  }
}));

export const TableRow = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(120px, 1.2fr) 2fr minmax(100px, 0.8fr)",
  alignItems: "center",
  padding: `${theme.spacing(2)} ${theme.spacing(2.5)}`,
  borderBottom: `1px solid ${theme.palette.grey[100]}`,
  transition: "background-color 0.15s ease",
  "&:last-child": { borderBottom: "none" },
  "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.02) },
  [theme.breakpoints.down("sm")]: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
    gridTemplateColumns: "unset"
  }
}));

export const DetailBadge = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontSize: 13,
  color: theme.palette.text.secondary,
  fontWeight: 500
}));
