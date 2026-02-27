import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfilePageView } from "pages-sections/customer-dashboard/profile/page-view";
// API FUNCTIONS
import api from "utils/__api__/users";

export async function generateMetadata(): Promise<Metadata> {
  const user = await api.getUser();
  if (!user) notFound();

  const name = `${user.name.firstName} ${user.name.lastName}`;

  return {
    title: name + " - Seoulé",
    description: "Seoulé — Fashion platform connecting brands and shoppers.",
    
    keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
  };
}

export default async function Profile() {
  const user = await api.getUser();

  if (!user) notFound();

  return <ProfilePageView user={user} />;
}
