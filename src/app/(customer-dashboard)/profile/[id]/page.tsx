import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileEditPageView } from "pages-sections/customer-dashboard/profile/page-view";
// API FUNCTIONS
import api from "utils/__api__/users";

export async function generateMetadata(): Promise<Metadata> {
  const user = await api.getUser();

  if (!user) {
    return notFound();
  }

  const name = `${user.name.firstName} ${user.name.lastName}`;

  return {
    title: name + " - BAZAAR",
    description: "BAZAAR — Fashion platform connecting brands and shoppers.",
    
    keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
  };
}

export default async function ProfileEdit() {
  const user = await api.getUser();

  if (!user) {
    return notFound();
  }

  return <ProfileEditPageView user={user} />;
}
