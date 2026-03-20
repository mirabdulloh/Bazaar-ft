"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "../../../../node_modules/react-i18next";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import LongProductCard from "./long-product-card";
import { SectionCreator } from "components/section-header";
import ProductCard2 from "components/product-cards/product-card-2";
import ProductsCarousel from "../section-3/products-carousel";
import Product from "models/Product.model";
import { useQuery } from "../../../lib/hooks/useQuery";
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { GET_PRODUCTS } from "../../../../apollo/user/query";
import { LIKE_TARGET_PRODUCT } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";
import { sweetLikeSuccessAlert, sweetMixinErrorAlert } from "lib/sweetAlert";
import { T, Message } from "../../../lib/types/common";
import { resolveServerMedia, resolveServerMediaThumb } from "lib/server-media";

interface GqlProduct {
  _id: string;
  memberId?: string;
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

function toProductModel(p: GqlProduct): Product {
  const discountPct =
    p.productDiscountPrice > 0 && p.productDiscountPrice < p.productPrice
      ? Math.round(((p.productPrice - p.productDiscountPrice) / p.productPrice) * 100)
      : 0;
  const originalImage =
    resolveServerMedia(p.productImages?.[0]) || "/assets/images/products/product-1.png";
  return {
    id: p._id,
    memberId: p.memberId,
    slug: p._id,
    title: p.productTitle,
    price: p.productPrice,
    discount: discountPct,
    thumbnail: resolveServerMediaThumb(p.productImages?.[0]) || originalImage,
    images: (p.productImages ?? []).map(resolveServerMedia).filter(Boolean),
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
  limit: 7,
  sort: "productViews",
  direction: "DESC",
  search: {},
};

export default function Section6() {
  const { t } = useTranslation();
  const [likeOverrides, setLikeOverrides] = useState<Record<string, number>>({});
  const user = useReactiveVar(userVar);

  /** APOLLO REQUESTS **/
  const [likeTargetProduct] = useMutation<{ likeTargetProduct: { _id: string; productLikes: number } }>(LIKE_TARGET_PRODUCT);

  const {
    loading: getTrendingLoading,
    data: getTrendingData,
  } = useQuery(GET_PRODUCTS, {
    fetchPolicy: "cache-and-network",
    variables: { input: initialInput },
  });

  const products = useMemo(() => {
    const raw: GqlProduct[] = getTrendingData?.getProducts?.products ?? [];
    return raw.map((product) => {
      const model = toProductModel(product);
      const overriddenLikes = likeOverrides[model.id];
      return overriddenLikes === undefined ? model : { ...model, productLikes: overriddenLikes };
    });
  }, [getTrendingData, likeOverrides]);

  const showInitialLoading = getTrendingLoading && !products.length;

  /** HANDLERS **/
  const likeProductHandler = async (user: T, productId: string) => {
    try {
      if (!productId) return;
      if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);

      const { data } = await likeTargetProduct({ variables: { input: productId } });
      const updated = data?.likeTargetProduct;

      if (updated?._id) {
        setLikeOverrides((prev) => ({ ...prev, [updated._id]: updated.productLikes }));
      }
      await sweetLikeSuccessAlert();
    } catch (err: any) {
      if (err.message !== Message.NOT_AUTHENTICATED) {
        sweetMixinErrorAlert(err.message).then();
      }
    }
  };

  if (showInitialLoading) {
    return (
      <SectionCreator title={t("Trending Now", { defaultValue: "Trending Now" })} seeMoreLink="/products/search?sort=popular">
        {/* Mobile loading skeleton */}
        <Box sx={{ display: { xs: "block", md: "none" } }}>
          <Box display="flex" gap={2} overflow="hidden">
            {Array.from({ length: 2 }).map((_, i) => (
              <Box key={i} sx={{ minWidth: "75vw", flex: "0 0 auto" }}>
                <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 2 }} />
                <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
                <Skeleton variant="text" width="50%" />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Desktop loading skeleton */}
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Grid container spacing={4}>
            <Grid size={{ md: 3 }}>
              <Skeleton variant="rectangular" height={700} sx={{ borderRadius: 3 }} />
              <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
              <Skeleton variant="text" width="50%" />
            </Grid>
            <Grid container spacing={4} size={{ md: 9 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Grid size={{ sm: 4 }} key={i}>
                  <Skeleton variant="rectangular" height={460} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
                  <Skeleton variant="text" width="50%" />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Box>
      </SectionCreator>
    );
  }

  if (!products.length) return null;

  const TRENDING_ITEMS = products.slice(1);

  return (
    <SectionCreator title={t("Trending Now", { defaultValue: "Trending Now" })} seeMoreLink="/products/search?sort=popular">
      {/* Mobile: all products in a carousel */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <ProductsCarousel>
          {products.map((product) => (
            <ProductCard2
              key={product.id}
              product={product}
              enableSecondaryImage={false}
              likeProductHandler={(productId) => likeProductHandler(user, productId)}
            />
          ))}
        </ProductsCarousel>
      </Box>

      {/* Desktop: tall solo card left + grid right */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Grid container spacing={4}>
          <Grid size={{ md: 3 }}>
            <LongProductCard
              product={products[0]}
              fallbackImage={products[0]?.images?.[0]}
              likeProductHandler={(productId) => likeProductHandler(user, productId)}
            />
          </Grid>

          <Grid container spacing={4} size={{ md: 9 }}>
            {TRENDING_ITEMS.map((product) => (
              <Grid size={{ sm: 4 }} key={product.id}>
                <ProductCard2
                  product={product}
                  enableSecondaryImage={false}
                  likeProductHandler={(productId) => likeProductHandler(user, productId)}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Box>
    </SectionCreator>
  );
}
