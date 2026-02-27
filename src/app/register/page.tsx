import type { Metadata } from "next";
import { RegisterPageView } from "pages-sections/sessions/page-view";

export const metadata: Metadata = {
  title: "Register - Seoulé",
  description:
    "Seoulé — Fashion platform connecting brands and shoppers",
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function Register() {
  return <RegisterPageView />;
}
