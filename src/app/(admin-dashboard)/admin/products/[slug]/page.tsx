import { redirect } from "next/navigation";

export default async function AdminProductDetailRedirect() {
  redirect("/admin/products");
}
