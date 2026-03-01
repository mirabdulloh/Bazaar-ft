"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { layoutConstant } from "utils/constants";

type TabButtonProps = {
  active?: boolean;
};

export const PageRoot = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  minHeight: "100%",
  overflowX: "hidden",
  paddingBottom: theme.spacing(8),
  [theme.breakpoints.down("lg")]: {
    paddingBottom: layoutConstant.mobileNavHeight + 24
  }
}));

export const HeroSection = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  textAlign: "center",
  padding: theme.spacing(5, 0),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(7, 0)
  }
}));

export const HeroTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: 34,
  lineHeight: 1.2,
  [theme.breakpoints.up("sm")]: {
    fontSize: 42
  },
  [theme.breakpoints.up("md")]: {
    fontSize: 52
  }
}));

export const HeroSubtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(1)
}));

export const TabWrap = styled(Paper)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  borderRadius: 999,
  backgroundColor: theme.palette.grey[200],
  maxWidth: 460,
  width: "100%",
  marginInline: "auto",
  marginBottom: theme.spacing(4),
  boxShadow: "none"
}));

export const TabButton = styled("button", {
  shouldForwardProp: (prop) => prop !== "active"
})<TabButtonProps>(({ theme, active }) => ({
  appearance: "none",
  border: 0,
  width: "100%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  cursor: "pointer",
  borderRadius: 999,
  padding: theme.spacing(1.1, 1.2),
  color: theme.palette.text.primary,
  backgroundColor: active ? theme.palette.common.white : "transparent",
  boxShadow: active ? theme.shadows[1] : "none",
  transition: "all 0.2s ease",
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  [theme.breakpoints.down("sm")]: {
    fontSize: 14,
    padding: theme.spacing(1)
  }
}));

export const ContentContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3.5),
  [theme.breakpoints.up("md")]: {
    paddingTop: theme.spacing(5)
  }
}));

export const SectionHeader = styled(Box)(({ theme }) => ({
  textAlign: "center",
  marginBottom: theme.spacing(3.5)
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: 30,
  marginBottom: theme.spacing(0.8),
  lineHeight: 1.2,
  [theme.breakpoints.up("sm")]: {
    fontSize: 38
  },
  [theme.breakpoints.up("md")]: {
    fontSize: 44
  }
}));

export const SectionSubtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary
}));

export const CenterStateBox = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  paddingBlock: theme.spacing(7)
}));

export const StateText = styled(Typography)(({ theme }) => ({
  textAlign: "center"
}));

export const ListStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1.25)
}));

export const NoticeCard = styled(Paper)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "52px 1fr",
  gap: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(2, 2.5),
  boxShadow: "none",
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(2.1, 3)
  },
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
    gap: theme.spacing(0.5),
    padding: theme.spacing(1.8, 2)
  }
}));

export const ListIndex = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  paddingTop: theme.spacing(0.4),
  [theme.breakpoints.down("sm")]: {
    paddingTop: 0
  }
}));

export const NoticeTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  lineHeight: 1.35,
  fontSize: 19,
  wordBreak: "break-word",
  [theme.breakpoints.up("md")]: {
    fontSize: 20
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: 17
  }
}));

export const MetaRow = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(0.75),
  color: theme.palette.text.secondary,
  gap: theme.spacing(1.5),
  flexWrap: "wrap",
  [theme.breakpoints.down("sm")]: {
    gap: theme.spacing(0.6)
  }
}));

export const FaqCard = styled(Paper)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(2, 2.5),
  boxShadow: "none",
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(2.2, 3)
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.8, 2)
  }
}));

export const FaqRow = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "52px 1fr",
  gap: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
    gap: theme.spacing(0.7)
  }
}));

export const FaqTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: 19,
  lineHeight: 1.35,
  marginBottom: theme.spacing(0.7),
  wordBreak: "break-word",
  [theme.breakpoints.up("md")]: {
    fontSize: 20
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: 17
  }
}));

export const FaqAnswer = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word"
}));
