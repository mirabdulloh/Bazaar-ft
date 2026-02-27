import type { Metadata } from "next";
import { LoginPageView } from "pages-sections/sessions/page-view";

export const metadata: Metadata = {
  title: "Login - Seoulé",
  description:
    "Seoulé — Fashion platform connecting brands and shoppers",
  
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};

export default function Login() {
  return <LoginPageView />;
}
