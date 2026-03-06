import type { Metadata } from "next";
import MemberProfilePageView from "pages-sections/member/page-view/member-profile";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Member Profile - Seoulé",
    description: "View member profile on Seoulé.",
  };
}

export default async function MemberProfilePage({ params }: Props) {
  const { id } = await params;
  return <MemberProfilePageView memberId={id} />;
}
