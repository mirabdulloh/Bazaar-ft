import type { Metadata } from "next";
import { ResetPasswordPageView } from "pages-sections/sessions/page-view";

export const metadata: Metadata = {
  title: "Reset Password - Seoulé",
  description:
    "Seoulé — Fashion platform connecting brands and shoppers",
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function ResetPassword() {
  return <ResetPasswordPageView />;
}
