import { redirect } from "next/navigation";

export default async function AdminProductCreateRedirect() {
  redirect("/admin/products");
}
