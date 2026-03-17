import { redirect } from "next/navigation";

export default async function AdminOrderDetailsRedirect() {
  redirect("/admin/orders");
}
