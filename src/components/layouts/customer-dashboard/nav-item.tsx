"use client";

import { usePathname } from "next/navigation";
import Typography from "@mui/material/Typography";
// CUSTOM ICON COMPONENTS
import IconComponent from "components/IconComponent";
// STYLED COMPONENTS
import { StyledLink } from "./styles";

// ==============================================================
interface Item {
  icon: string;
  href: string;
  title: string;
  count?: number;
}
// ==============================================================

export default function NavItem({ item }: { item: Item }) {
  const { href, icon, title, count } = item;

  const pathname = usePathname();

  return (
    <StyledLink href={href} key={title} isActive={pathname === href}>
      <div className="title">
        <IconComponent icon={icon} color="inherit" fontSize="small" className="nav-icon" />
        <Typography variant="body2">{title}</Typography>
      </div>

      {count ? <span>{count}</span> : null}
    </StyledLink>
  );
}
