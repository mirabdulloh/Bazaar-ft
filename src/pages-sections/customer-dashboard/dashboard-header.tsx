"use client";

import Link from "next/link";
// MUI
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import { type SvgIconComponent } from "@mui/icons-material";
// GLOBAL CUSTOM COMPONENTS

// STYLED COMPONENT
const StyledRoot = styled("div")(({ theme }) => ({
  gap: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "1.5rem",
  ".left": {
    gap: ".75rem",
    display: "flex",
    alignItems: "center"
  },
  ".avatar": {
    width: 35,
    height: 35,
    backgroundColor: theme.palette.grey[100]
  },
  [theme.breakpoints.up("lg")]: {
    ".right": { display: "none" }
  },
  [theme.breakpoints.down("sm")]: {
    marginBottom: "1rem"
  }
}));

// ==============================================================
interface WithButton {
  Icon?: never;
  href?: string;
  title: string;
}

interface WithoutButton {
  href?: never;
  title: string;
  Icon?: SvgIconComponent;
}

type Props = WithoutButton | WithButton;
// ==============================================================

export default function DashboardHeader({ title, href, Icon }: Props) {
  return (
    <StyledRoot>
      <div className="left">
        {Icon && (
          <Avatar variant="rounded" className="avatar">
            <Icon color="primary" />
          </Avatar>
        )}

        {href && (
          <IconButton color="primary" href={href} LinkComponent={Link}>
            <ChevronLeft />
          </IconButton>
        )}

        <Typography noWrap variant="h2">
          {title}
        </Typography>
      </div>

      {/* Mobile nav is handled globally; keep header clean */}
    </StyledRoot>
  );
}
