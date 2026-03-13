import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaymentDetailsPageView } from "pages-sections/customer-dashboard/payment-methods/page-view";
// API FUNCTIONS
import api from "utils/__api__/payments";
// TYPES
import { IdParams } from "models/Common";

export const metadata: Metadata = {
  title: "Payment Details - BAZAAR",
  description: `BAZAAR — Fashion platform connecting brands and shoppers`,
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default async function PaymentMethodDetails({ params }: IdParams) {
  const { id } = await params;
  const payment = await api.getPayment(id);

  if (!payment) notFound();

  return <PaymentDetailsPageView payment={payment} />;
}
