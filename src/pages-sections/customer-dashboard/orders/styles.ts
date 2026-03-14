import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { alpha, styled } from "@mui/material/styles";

export const DetailHeroCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: 20,
  border: `1px solid ${theme.palette.grey[200]}`,
  boxShadow: "none",
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${theme.palette.common.white} 60%)`,
}));

export const DetailBrandAvatar = styled(Avatar)(({ theme }) => ({
  width: 72,
  height: 72,
  border: `2px solid ${theme.palette.primary.main}`,
}));

export const DetailMetaGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: theme.spacing(1.25),
  marginTop: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
  },
}));

export const DetailMetaCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: 14,
  border: `1px solid ${theme.palette.grey[200]}`,
  backgroundColor: theme.palette.grey[50],
}));

export const DetailSectionCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(3),
  borderRadius: 18,
  border: `1px solid ${theme.palette.grey[200]}`,
  boxShadow: "none",
}));

export const DetailActionBar = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: theme.spacing(1),
  flexWrap: "wrap",
  marginTop: theme.spacing(2),
}));

export const InlineMetaBadge = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
  borderRadius: 999,
  border: `1px solid ${theme.palette.grey[200]}`,
  backgroundColor: theme.palette.common.white,
  color: theme.palette.text.secondary,
  fontSize: 12,
  fontWeight: 600,
}));
