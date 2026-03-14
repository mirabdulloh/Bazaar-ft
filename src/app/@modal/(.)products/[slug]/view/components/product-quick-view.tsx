"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import ButtonGroup from "./button-group";
import ImageCarousel from "./image-carousel";
import QuickViewModal from "./quick-view-modal";

import { currency } from "lib";
import { useQuery } from "lib/hooks/useQuery";
import { T } from "lib/types/common";
import { GET_CATEGORIES, GET_PRODUCT } from "../../../../../../../apollo/user/query";

import Product from "models/Product.model";

// =====================================================
type Props = { productId: string };
// =====================================================

interface GqlProduct {
  _id: string;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function resolveProductImage(img?: string | null): string {
  if (!img || img === "null" || img === "undefined") return "";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const normalized = img.startsWith("/") ? img : `/${img}`;
  return API_URL ? `${API_URL}${normalized}` : normalized;
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
    thumbnail: resolveProductImage(p.productImages?.[0]) || "/assets/images/products/product-1.png",
    images: (p.productImages ?? []).map(resolveProductImage).filter(Boolean),
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

export default function ProductQuickView({ productId }: Props) {
  const { loading, data, error } = useQuery(GET_PRODUCT, {
    fetchPolicy: "cache-and-network",
    variables: { input: productId },
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

  return (
    <QuickViewModal>
      {loading && !product ? (
        <Box py={8} px={4} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : error || !product ? (
        <Box py={6} px={4}>
          <Typography color="error.main">Failed to load product.</Typography>
        </Box>
      ) : (
        <>
          <Box position="relative" bgcolor="grey.100">
            <ImageCarousel images={product.images!} title={product.title} />
          </Box>

          <Box py={3} px={4}>
            <Typography variant="body1" fontSize={22} fontWeight={600} sx={{ mb: 1 }}>
              {product.title}
            </Typography>

            {product.categories?.[0] && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Category: {String(product.categories[0])}
              </Typography>
            )}

            {product.colors?.length ? (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Color: {product.colors.join(", ")}
              </Typography>
            ) : null}

            <Typography variant="body1" fontSize={22} fontWeight={600}>
              {currency(product.price)}
            </Typography>

            <Box display="flex" alignItems="center" gap={1} mb={3} mt={2}>
              <Rating size="small" color="warn" value={product.rating ?? 0} readOnly />
              <Typography variant="body1" lineHeight="1" color="text.secondary">
                ({product.productViews ?? 0})
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {product.description ||
                "Sed egestas, ante et vulputate volutpat, eros pede semper est, vitae luctus metus libero eu augue. Morbi purus liberpuro ate vol faucibus adipiscing."}
            </Typography>

            <ButtonGroup product={product} />
          </Box>
        </>
      )}
    </QuickViewModal>
  );
}
