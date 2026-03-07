"use client";

import Link from "next/link";
import IconButton from "@mui/material/IconButton";
import SvgIcon from "@mui/material/SvgIcon";

export function HeaderChat() {
  return (
    <IconButton LinkComponent={Link} href="/support-tickets">
      <SvgIcon fontSize="small">
        <svg viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
            <path d="M20 12c0 3.866-3.582 7-8 7a8.66 8.66 0 0 1-2.66-.41L4 20l1.52-3.44A6.65 6.65 0 0 1 4 12c0-3.866 3.582-7 8-7s8 3.134 8 7Z" />
            <path strokeLinecap="round" d="M8.5 11.5h7M8.5 14.5h5" />
          </g>
        </svg>
      </SvgIcon>
    </IconButton>
  );
}
