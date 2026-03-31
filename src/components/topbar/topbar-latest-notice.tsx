"use client";

import { useMemo } from "react";
import { Topbar } from "./top-bar";
import { GET_NOTICES } from "../../../apollo/user/query";
import { useQuery } from "lib/hooks/useQuery";
import { T } from "lib/types/common";

type Props = {
  label: string;
  fallbackTitle: string;
};

const DEFAULT_NOTICE_FALLBACK = "Latest updates from BAZAAR";

const LATEST_NOTICE_INPUT = {
  page: 1,
  limit: 1,
  sort: "createdAt",
  direction: "DESC",
  search: {}
};

export default function TopbarLatestNotice({ label }: Props) {
  const { data } = useQuery(GET_NOTICES, {
    variables: { input: LATEST_NOTICE_INPUT },
    fetchPolicy: "network-only"
  });

  const latestTitle = useMemo(() => {
    const list = (data as T)?.getNotices?.list ?? [];
    return list[0]?.noticeTitle?.trim() || DEFAULT_NOTICE_FALLBACK;
  }, [data]);

  return <Topbar.Left label={label} title={latestTitle} />;
}
