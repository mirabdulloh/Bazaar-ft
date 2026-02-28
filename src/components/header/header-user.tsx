"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import SvgIcon from "@mui/material/SvgIcon";
import Typography from "@mui/material/Typography";
import { useReactiveVar } from "@apollo/client/react";
// APOLLO STORE
import { userVar } from "../../../apollo/store";
// AUTH
import { logOut } from "lib/auth";

export function HeaderUser() {
  const user = useReactiveVar(userVar);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isLoggedIn = !!user._id;

  if (!mounted || !isLoggedIn) {
    return (
      <Link href="/login">
        <IconButton>
          <SvgIcon fontSize="small">
            <svg viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="9" r="3" />
                <circle cx="12" cy="12" r="10" />
                <path
                  strokeLinecap="round"
                  d="M17.97 20c-.16-2.892-1.045-5-5.97-5s-5.81 2.108-5.97 5"
                />
              </g>
            </svg>
          </SvgIcon>
        </IconButton>
      </Link>
    );
  }

  const isAdminOrBrand = user.memberType === "ADMIN" || user.memberType === "BRAND";
  const dashboardHref = user.memberType === "ADMIN" ? "/admin/brands" : "/brand/dashboard";

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
        <Avatar
          src={user.memberImage || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.memberNick || "U")}&backgroundColor=6366f1&textColor=ffffff`}
          alt={user.memberNick}
          sx={{ width: 32, height: 32 }}
        />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{ paper: { sx: { minWidth: 160, mt: 1 } } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {user.memberNick}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "lowercase" }}>
            {user.memberType}
          </Typography>
        </Box>

        <Divider />

        <MenuItem component={Link} href="/profile" onClick={() => setAnchorEl(null)}>
          My Profile
        </MenuItem>
        <MenuItem component={Link} href="/orders" onClick={() => setAnchorEl(null)}>
          My Orders
        </MenuItem>
        {isAdminOrBrand && (
          <MenuItem component={Link} href={dashboardHref} onClick={() => setAnchorEl(null)}>
            Dashboard
          </MenuItem>
        )}

        <Divider />

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            logOut();
          }}
          sx={{ color: "error.main" }}
        >
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
