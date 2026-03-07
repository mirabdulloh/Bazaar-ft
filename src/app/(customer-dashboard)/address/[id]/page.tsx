import { redirect } from "next/navigation";

// No single-address query exists — editing is handled via dialog on /address
export default async function AddressEditPage() {
  redirect("/address");
}
