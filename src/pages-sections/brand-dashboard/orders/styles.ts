import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import { alpha, styled } from "@mui/material/styles";

export const FilterToolbarCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(1.25),
  marginBottom: theme.spacing(2),
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
}));

export const FilterPillButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ theme, active }) => ({
  minWidth: 0,
  borderRadius: 999,
  paddingInline: theme.spacing(1.75),
  textTransform: "none",
  fontWeight: 700,
  border: `1px solid ${active ? theme.palette.info.main : theme.palette.divider}`,
  color: active ? theme.palette.info.main : theme.palette.text.secondary,
  backgroundColor: active ? alpha(theme.palette.info.main, 0.08) : theme.palette.common.white,
  "&:hover": {
    borderColor: theme.palette.info.main,
    backgroundColor: alpha(theme.palette.info.main, 0.08),
  },
}));

export const DetailDrawerContent = styled(Box)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  padding: theme.spacing(2.5),
  backgroundColor: theme.palette.grey[50],
}));

export const DetailHeaderCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  boxShadow: "none",
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2.25),
}));

export const SummaryGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: theme.spacing(1.25),
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
  },
}));

export const SummaryMetricCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.common.white,
}));

export const DetailSectionCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  boxShadow: "none",
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2.25),
}));

export const ProductLine = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "80px minmax(0, 1fr) auto",
  gap: theme.spacing(1.5),
  alignItems: "center",
  paddingBlock: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  "&:last-of-type": {
    borderBottom: 0,
    paddingBottom: 0,
  },
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "72px minmax(0, 1fr)",
  },
}));

export const ProductThumb = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: 16,
  overflow: "hidden",
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.grey[100],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  [theme.breakpoints.down("sm")]: {
    width: 72,
    height: 72,
  },
}));

export const ActionButtonRow = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing(1),
  flexWrap: "wrap",
  marginTop: theme.spacing(1),
}));
