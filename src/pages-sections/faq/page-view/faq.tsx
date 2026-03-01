"use client";

import CustomerSupportPageView from "pages-sections/customer-support/page-view";
import { T } from "../../../lib/types/common";

type Props = {
  initialInput?: T;
};

export default function FaqPageView({ initialInput }: Props) {
  return <CustomerSupportPageView initialTab="faq" initialFaqInput={initialInput} />;
}
