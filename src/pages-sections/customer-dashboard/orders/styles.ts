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
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: 16,
  },
}));

export const DetailBrandAvatar = styled(Avatar)(({ theme }) => ({
  width: 72,
  height: 72,
  border: `2px solid ${theme.palette.primary.main}`,
  [theme.breakpoints.down("sm")]: {
    width: 58,
    height: 58,
  },
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
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1.5),
  },
}));

export const DetailMetaCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: 14,
  border: `1px solid ${theme.palette.grey[200]}`,
  backgroundColor: theme.palette.grey[50],
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.1),
    borderRadius: 12,
  },
}));

export const DetailSectionCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(3),
  borderRadius: 18,
  border: `1px solid ${theme.palette.grey[200]}`,
  boxShadow: "none",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.75),
    marginBottom: theme.spacing(2),
    borderRadius: 14,
  },
}));

export const DetailActionBar = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: theme.spacing(1),
  flexWrap: "wrap",
  marginTop: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    justifyContent: "stretch",
    marginTop: theme.spacing(1.5),
    "& > *": {
      flex: "1 1 calc(50% - 4px)",
      minWidth: 0,
    },
  },
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
  [theme.breakpoints.down("sm")]: {
    fontSize: 11,
    padding: `${theme.spacing(0.45)} ${theme.spacing(0.85)}`,
  },
}));

export const OrderStepsScroller = styled(Box)(({ theme }) => ({
  width: "100%",
  overflowX: "auto",
  overflowY: "hidden",
  WebkitOverflowScrolling: "touch",
  paddingBottom: theme.spacing(0.5),
}));

export const OrderStepsRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  minWidth: "max-content",
  [theme.breakpoints.down("sm")]: {
    gap: theme.spacing(0.5),
  },
  "& .line": {
    height: 2,
    minWidth: 56,
    flex: "0 0 56px",
    marginTop: 31,
    borderRadius: 999,
    [theme.breakpoints.down("sm")]: {
      minWidth: 38,
      flexBasis: 38,
      marginTop: 27,
    },
  },
}));

export const OrderStepItem = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(0.5),
  minWidth: 88,
  textAlign: "center",
  [theme.breakpoints.down("sm")]: {
    minWidth: 74,
  },
}));

export const OrderStepAvatar = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  transition: "all 0.3s ease",
  "&.done": {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
  },
  "&.active": {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
    boxShadow: `0 0 0 4px ${theme.palette.primary.light}`,
  },
  "&.idle": {
    color: theme.palette.text.disabled,
    backgroundColor: theme.palette.grey[100],
  },
  [theme.breakpoints.down("sm")]: {
    width: 56,
    height: 56,
  },
}));

export const OrderStepCheckBadge = styled(Avatar)(({ theme }) => ({
  top: -4,
  right: -4,
  width: 20,
  height: 20,
  position: "absolute",
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.primary.light,
  boxShadow: theme.shadows[1],
  "& svg": { fontSize: 14 },
  [theme.breakpoints.down("sm")]: {
    width: 18,
    height: 18,
    "& svg": { fontSize: 12 },
  },
}));
