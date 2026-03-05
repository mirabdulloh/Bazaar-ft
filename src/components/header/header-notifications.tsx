"use client";

import { useMemo } from "react";
import Link from "next/link";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import SvgIcon from "@mui/material/SvgIcon";
import { useReactiveVar } from "@apollo/client/react";
import { GET_MY_NOTIFICATIONS } from "../../../apollo/user/query";
import { useQuery } from "lib/hooks/useQuery";
import { T } from "lib/types/common";
import { userVar } from "../../../apollo/store";

const UNREAD_INPUT = {
  page: 1,
  limit: 1,
  sort: "createdAt",
  direction: "DESC",
  search: { notificationStatus: "UNREAD" }
};

export function HeaderNotifications() {
  const user = useReactiveVar(userVar);
  const isLoggedIn = !!user._id;

  const { data } = useQuery(GET_MY_NOTIFICATIONS, {
    variables: { input: UNREAD_INPUT },
    skip: !isLoggedIn
  });

  const unreadCount = useMemo(() => {
    if (!isLoggedIn) return 0;
    const total = (data as T)?.getMyNotifications?.metaCounter?.[0]?.total ?? 0;
    return Number.isFinite(total) ? total : 0;
  }, [data, isLoggedIn]);

  return (
    <Badge badgeContent={unreadCount} color="primary" invisible={unreadCount === 0}>
      <IconButton LinkComponent={Link} href="/notifications" aria-label="Notifications">
        <SvgIcon fontSize="small">
          <svg viewBox="0 0 24 24">
            <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M15 18H9" />
              <path d="M18 9a6 6 0 1 0-12 0v3.5c0 .65-.26 1.27-.72 1.73L4 16h16l-1.28-1.77a2.5 2.5 0 0 1-.72-1.73V9Z" />
            </g>
          </svg>
        </SvgIcon>
      </IconButton>
    </Badge>
  );
}
