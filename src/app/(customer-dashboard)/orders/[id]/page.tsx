import { redirect } from "next/navigation";
import { IdParams } from "models/Common";

export default async function OrderDetailsRedirect({ params }: IdParams) {
  const { id } = await params;
  redirect(`/profile?tab=orders&orderId=${id}`);
}
