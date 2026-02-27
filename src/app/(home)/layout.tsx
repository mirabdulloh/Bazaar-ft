import type { PropsWithChildren } from "react";
import ShopLayout1 from "components/layouts/shop-layout-1";
import api from "utils/__api__/layout";

export default async function HomeLayout({ children }: PropsWithChildren) {
  const data = await api.getLayoutData();
  return <ShopLayout1 data={data}>{children}</ShopLayout1>;
}
