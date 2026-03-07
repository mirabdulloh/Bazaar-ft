"use client";

import { useParams } from "next/navigation";
// LOCAL CUSTOM COMPONENT
import CategoryForm from "../category-form";
import PageWrapper from "../../page-wrapper";

export default function EditCategoryPageView() {
  const params = useParams();
  const categoryId = params?.slug as string;

  return (
    <PageWrapper title="Edit Category">
      <CategoryForm categoryId={categoryId} />
    </PageWrapper>
  );
}
