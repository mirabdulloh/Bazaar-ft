"use client";

import CustomerSupportPageView from "pages-sections/customer-support/page-view";
import { T } from "../../../lib/types/common";

type Props = {
  initialInput?: T;
};

export default function NoticesPageView({ initialInput }: Props) {
  return <CustomerSupportPageView initialTab="notices" initialNoticeInput={initialInput} />;
}
