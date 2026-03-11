"use client";

import { useState } from "react";
import { useTranslation } from "../../../../node_modules/react-i18next";
import { SectionCreator } from "components/section-header";
import ProductCard2 from "components/product-cards/product-card-2";
import ProductsCarousel from "./products-carousel";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Product from "models/Product.model";
import { useQuery } from "../../../lib/hooks/useQuery";
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { GET_PRODUCTS } from "../../../../apollo/user/query";
import { LIKE_TARGET_PRODUCT } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";
import { sweetLikeSuccessAlert, sweetMixinErrorAlert } from "lib/sweetAlert";
import { T, Message } from "../../../lib/types/common";

interface GqlProduct {
  _id: string;
  productTitle: string;
  productPrice: number;
  productDiscountPrice: number;
  productImages: string[];
  productRatingAverage: number;
  productLikes: number;
  productViews: number;
  productSize?: string;
  productColor?: string;
  meLiked?: { myFavorite: boolean }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
function resolveProductImage(img?: string | null): string {
  if (!img || img === "null" || img === "undefined") return "";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const normalized = img.startsWith("/") ? img : `/${img}`;
  return API_URL ? `${API_URL}${normalized}` : normalized;
}

function toProductModel(p: GqlProduct): Product {
  const discountPct =
    p.productDiscountPrice > 0 && p.productDiscountPrice < p.productPrice
      ? Math.round(((p.productPrice - p.productDiscountPrice) / p.productPrice) * 100)
      : 0;
  return {
    id: p._id,
    slug: p._id,
    title: p.productTitle,
    price: p.productPrice,
    discount: discountPct,
    thumbnail: resolveProductImage(p.productImages?.[0]) || "/assets/images/products/product-1.png",
    images: (p.productImages ?? []).map(resolveProductImage).filter(Boolean),
    rating: p.productRatingAverage ?? 0,
    categories: [],
    size: p.productSize ? [p.productSize] : [],
    colors: p.productColor ? [p.productColor] : [],
    productLikes: p.productLikes,
    productViews: p.productViews,
    meLiked: p.meLiked?.[0]?.myFavorite === true,
  };
}

const initialInput = {
  page: 1,
  limit: 20,
  sort: "productLikes",
  direction: "DESC",
  search: {},
};

export default function Section2() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const user = useReactiveVar(userVar);

  /** APOLLO REQUESTS **/
  const [likeTargetProduct] = useMutation<{ likeTargetProduct: { _id: string; productLikes: number } }>(LIKE_TARGET_PRODUCT);

  const {
    loading: getFlashDealsLoading,
    data: _getFlashDealsData,
    error: _getFlashDealsError,
    refetch: _getFlashDealsRefetch,
  } = useQuery(GET_PRODUCTS, {
    fetchPolicy: "cache-and-network",
    variables: { input: initialInput },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      const raw: GqlProduct[] = data?.getProducts?.products ?? [];
      const discounted = raw.filter(
        (p) => p.productDiscountPrice > 0 && p.productDiscountPrice < p.productPrice
      );
      setProducts(discounted.map(toProductModel));
    },
  });

  /** HANDLERS **/
  const likeProductHandler = async (user: T, productId: string) => {
    try {
      if (!productId) return;
      if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);

      const { data } = await likeTargetProduct({ variables: { input: productId } });
      const updated = data?.likeTargetProduct;

      if (updated?._id) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === updated._id ? { ...p, productLikes: updated.productLikes } : p
          )
        );
      }
      await sweetLikeSuccessAlert();
    } catch (err: any) {
      if (err.message !== Message.NOT_AUTHENTICATED) {
        sweetMixinErrorAlert(err.message).then();
      }
    }
  };

  if (getFlashDealsLoading) {
    return (
      <SectionCreator title={t("Flash Deals", { defaultValue: "Flash Deals" })} seeMoreLink="/products/search?sort=flash_deals">
        <Box display="flex" gap={2} overflow="hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Box key={i} sx={{ minWidth: { xs: "75vw", sm: 260 }, flex: "0 0 auto" }}>
              <Skeleton variant="rectangular" height={370} sx={{ borderRadius: 3 }} />
              <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
              <Skeleton variant="text" width="50%" />
            </Box>
          ))}
        </Box>
      </SectionCreator>
    );
  }

  if (!products.length) return null;

  return (
    <SectionCreator title={t("Flash Deals", { defaultValue: "Flash Deals" })} seeMoreLink="/products/search?sort=flash_deals">
      <ProductsCarousel>
        {products.map((product) => (
          <ProductCard2
            key={product.id}
            product={product}
            likeProductHandler={(productId) => likeProductHandler(user, productId)}
          />
        ))}
      </ProductsCarousel>
    </SectionCreator>
  );
}
