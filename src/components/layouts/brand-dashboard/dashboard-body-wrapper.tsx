import { PropsWithChildren } from "react";
import { styled } from "@mui/material/styles";
// LOCAL CUSTOM HOOK
import { useLayout } from "./dashboard-layout-context";

// STYLED COMPONENTS
const RootStyle = styled("div", {
  shouldForwardProp: (prop) => prop !== "compact"
})<{ compact: boolean }>(({ theme, compact }) => ({
  height: "100vh",
  overflowY: "auto",
  overflowX: "hidden",
  backgroundColor: theme.palette.grey[50],
  transition: "margin-left 0.3s",
  marginLeft: compact ? 86 : 280,
  [theme.breakpoints.down("lg")]: {
    height: "auto",
    minHeight: "100vh",
    marginLeft: 0
  }
}));

export default function BodyWrapper({ children }: PropsWithChildren) {
  const { sidebarCompact } = useLayout();
  return <RootStyle compact={sidebarCompact}>{children}</RootStyle>;
}
