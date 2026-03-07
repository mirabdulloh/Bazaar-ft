"use client";

import { useParams } from "next/navigation";
// LOCAL CUSTOM COMPONENT
import BrandForm from "../brand-form";
import PageWrapper from "../../page-wrapper";

export default function EditBrandPageView() {
  const params = useParams();
  const brandId = params?.slug as string;

  return (
    <PageWrapper title="Edit Brand">
      <BrandForm brandId={brandId} />
    </PageWrapper>
  );
}
