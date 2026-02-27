import { PropsWithChildren } from "react";
import VendorDashboardLayout from "components/layouts/brand-dashboard";

export default function Layout({ children }: PropsWithChildren) {
  return <VendorDashboardLayout>{children}</VendorDashboardLayout>;
}
