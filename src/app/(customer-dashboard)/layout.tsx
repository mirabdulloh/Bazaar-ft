import type { PropsWithChildren } from "react";
import ShopLayout1 from "components/layouts/shop-layout-1";
import { CustomerDashboardLayout } from "components/layouts/customer-dashboard";
// API FUNCTIONS
import api from "utils/__api__/layout";

export default async function Layout1({ children }: PropsWithChildren) {
  const data = await api.getLayoutData();

  if (!data) return <>{children}</>;

  return (
    <ShopLayout1 data={data}>
      <CustomerDashboardLayout>{children}</CustomerDashboardLayout>
    </ShopLayout1>
  );
}
