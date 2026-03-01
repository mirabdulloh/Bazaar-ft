"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
// LOCAL CUSTOM COMPONENTS
import ProductTabs from "../product-tabs";
import ProductIntro from "../product-intro";
import ProductReviews from "../product-reviews";
import AvailableShops from "../available-shops";
import RelatedProducts from "../related-products";
import ProductDescription from "../product-description";
import { useQuery } from "../../../lib/hooks/useQuery";
import { GET_CATEGORIES, GET_PRODUCT, GET_PRODUCTS } from "../../../../apollo/user/query";
// CUSTOM DATA MODEL
import Product from "models/Product.model";
import { T } from "../../../lib/types/common";

// ==============================================================
interface Props {
  productId: string;
}
// ==============================================================

interface GqlProduct {
  _id: string;
  productType?: string;
  productTitle: string;
  productPrice: number;
  productDiscountPrice: number;
  productImages: string[];
  productRatingAverage: number;
  productLikes: number;
  productViews: number;
  productDesc?: string;
  productSize?: string[] | string;
  productColor?: string[] | string;
  productStatus?: string;
  productCategoryId?: string;
  memberData?: { _id: string; memberNick?: string };
  meLiked?: { myFavorite: boolean }[];
}

interface GqlCategory {
  _id: string;
  categoryName: string;
}

interface AvailableBrand {
  id: string;
  name: string;
  image: string;
  url: string;
}

const parseVariantValues = (value?: string[] | string): string[] => {
  if (!value) return [];

  const rawValues = Array.isArray(value) ? value : value.split(/[,/|]/);

  return Array.from(new Set(rawValues.map((item) => item.trim()).filter(Boolean)));
};

const toProductModel = (p: GqlProduct, categoryById: Map<string, string>): Product => {
  const discountPct =
    p.productDiscountPrice > 0 && p.productDiscountPrice < p.productPrice
      ? Math.round(((p.productPrice - p.productDiscountPrice) / p.productPrice) * 100)
      : 0;
  const resolvedCategory = p.productCategoryId
    ? categoryById.get(p.productCategoryId) ?? p.productCategoryId
    : undefined;

  return {
    id: p._id,
    slug: p._id,
    title: p.productTitle,
    price: p.productPrice,
    discount: discountPct,
    thumbnail: p.productImages?.[0] ?? "/assets/images/products/product-1.png",
    images: p.productImages ?? [],
    rating: p.productRatingAverage ?? 0,
    description: p.productDesc,
    size: parseVariantValues(p.productSize),
    colors: parseVariantValues(p.productColor),
    status: p.productStatus,
    categories: resolvedCategory ? [resolvedCategory] : [],
    productLikes: p.productLikes,
    productViews: p.productViews,
    meLiked: p.meLiked?.[0]?.myFavorite === true,
    brand: p.memberData?.memberNick
  };
};

export default function ProductDetailsPageView(props: Props) {
  const { loading, data, error } = useQuery(GET_PRODUCT, {
    fetchPolicy: "cache-and-network",
    variables: { input: props.productId },
    notifyOnNetworkStatusChange: true
  });

  const { data: categoriesData } = useQuery(GET_CATEGORIES, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 200, search: {} } },
    notifyOnNetworkStatusChange: true
  });

  const categoryById = useMemo(() => {
    const categories: GqlCategory[] = (categoriesData as T)?.getCategories?.list ?? [];
    return new Map(categories.map((category) => [category._id, category.categoryName]));
  }, [categoriesData]);

  const product: Product | null = useMemo(() => {
    const gqlProduct: GqlProduct | undefined = (data as T)?.getProduct;
    return gqlProduct ? toProductModel(gqlProduct, categoryById) : null;
  }, [data, categoryById]);

  const currentRawProduct: GqlProduct | undefined = (data as T)?.getProduct;
  const productCategoryId = currentRawProduct?.productCategoryId;
  const currentBrandId = currentRawProduct?.memberData?._id;
  const currentType = currentRawProduct?.productType;

  const { data: categoryProductsData } = useQuery(GET_PRODUCTS, {
    fetchPolicy: "cache-and-network",
    skip: !productCategoryId,
    variables: {
      input: {
        page: 1,
        limit: 24,
        search: { productCategoryId }
      }
    },
    notifyOnNetworkStatusChange: true
  });

  const categoryProductsRaw: GqlProduct[] = useMemo(
    () => ((categoryProductsData as T)?.getProducts?.products ?? []) as GqlProduct[],
    [categoryProductsData]
  );

  const relatedProducts: Product[] = useMemo(() => {
    if (!currentRawProduct) return [];

    const withoutCurrent = categoryProductsRaw.filter((item) => item._id !== currentRawProduct._id);
    const sameBrand = withoutCurrent.filter((item) => item.memberData?._id === currentBrandId);
    const sameTypeOtherBrands = withoutCurrent.filter(
      (item) => item.memberData?._id !== currentBrandId && (!currentType || item.productType === currentType)
    );

    const selected = [...sameBrand];
    for (const candidate of sameTypeOtherBrands) {
      if (selected.length >= 8) break;
      if (!selected.some((item) => item._id === candidate._id)) selected.push(candidate);
    }

    return selected.slice(0, 8).map((item) => toProductModel(item, categoryById));
  }, [categoryProductsRaw, categoryById, currentRawProduct, currentBrandId, currentType]);

  const availableBrands: AvailableBrand[] = useMemo(() => {
    if (!currentRawProduct) return [];

    const grouped = new Map<string, AvailableBrand>();

    for (const item of categoryProductsRaw) {
      const brandId = item.memberData?._id;
      if (!brandId || brandId === currentBrandId) continue;
      if (grouped.has(brandId)) continue;

      grouped.set(brandId, {
        id: brandId,
        name: item.memberData?.memberNick || "Brand",
        image: item.memberData?.memberImage || "/assets/images/faces/propic.png",
        url: `/brands/${brandId}`
      });
    }

    return Array.from(grouped.values()).slice(0, 6);
  }, [categoryProductsRaw, currentRawProduct, currentBrandId]);

  if (loading && !product) {
    return (
      <Container className="mt-2 mb-2">
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="mt-2 mb-2">
        <Typography color="error.main">Failed to load product details.</Typography>
      </Container>
    );
  }

  return (
    <Container className="mt-2 mb-2">
      {/* PRODUCT DETAILS INFO AREA */}
      <ProductIntro product={product} />

      {/* PRODUCT DESCRIPTION AND REVIEW */}
      <ProductTabs description={<ProductDescription />} reviews={<ProductReviews productId={props.productId} />} />

      {/* AVAILABLE SHOPS AREA */}
      <AvailableShops shops={availableBrands} />

      {/* RELATED PRODUCTS AREA */}
      <RelatedProducts products={relatedProducts} />
    </Container>
  );
}
