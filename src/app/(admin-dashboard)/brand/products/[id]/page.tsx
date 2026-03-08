import BrandProductForm from "pages-sections/brand-dashboard/brand-products/product-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BrandProductEditPage(props: Props) {
  const { id } = await props.params;
  return <BrandProductForm productId={id} />;
}
