import { redirect } from "next/navigation";

export default function AddressPage() {
  redirect("/profile?tab=addresses");
}
