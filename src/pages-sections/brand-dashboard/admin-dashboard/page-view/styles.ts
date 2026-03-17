import { alpha, styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";

export const HeroCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3.5),
  minHeight: 220,
  border: `1px solid ${theme.palette.divider}`,
  background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.12)} 0%, ${theme.palette.background.paper} 52%, ${alpha(theme.palette.success.main, 0.08)} 100%)`,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2.25),
    minHeight: "auto"
  }
}));

export const StatCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2.5),
  height: "100%",
  border: `1px solid ${theme.palette.divider}`,
  transition: "transform .2s ease, box-shadow .2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4]
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2)
  }
}));

export const SectionCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  height: "100%",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2)
  }
}));

export const QueueRow = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr) auto",
  gap: theme.spacing(2),
  alignItems: "center",
  padding: theme.spacing(1.75, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
    gap: theme.spacing(1.25),
    alignItems: "flex-start"
  },
  "&:last-of-type": {
    borderBottom: "none",
    paddingBottom: 0
  }
}));

export const OrderRow = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr) minmax(0,1fr) auto auto",
  gap: theme.spacing(2),
  alignItems: "center",
  padding: theme.spacing(1.5, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "1fr",
    alignItems: "flex-start"
  },
  "&:last-of-type": {
    borderBottom: "none",
    paddingBottom: 0
  }
}));

export const QuickLinkStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1.25),
  "& a": {
    textDecoration: "none"
  }
}));
