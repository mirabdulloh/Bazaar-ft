"use client";

import { useState } from "react";
import { useTranslation } from "../../../../node_modules/react-i18next";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import LongProductCard from "./long-product-card";
import { SectionCreator } from "components/section-header";
import ProductCard2 from "components/product-cards/product-card-2";
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
  meLiked?: { myFavorite: boolean }[];
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
    thumbnail: p.productImages?.[0] ?? "/assets/images/products/product-1.png",
    images: p.productImages ?? [],
    rating: p.productRatingAverage ?? 0,
    categories: [],
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
  const [products, setProducts] = useState<Product[]>([]);
  const user = useReactiveVar(userVar);

  /** APOLLO REQUESTS **/
  const [likeTargetProduct] = useMutation<{ likeTargetProduct: { _id: string; productLikes: number } }>(LIKE_TARGET_PRODUCT);

  const {
    loading: getTrendingLoading,
    data: _getTrendingData,
    error: _getTrendingError,
    refetch: _getTrendingRefetch,
  } = useQuery(GET_PRODUCTS, {
    fetchPolicy: "cache-and-network",
    variables: { input: initialInput },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      const raw: GqlProduct[] = data?.getProducts?.products ?? [];
      setProducts(raw.map(toProductModel));
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
      console.log('Err on likeProductHandler:', err);
      sweetMixinErrorAlert(err.message).then();
    }
  };

  if (getTrendingLoading) {
    return (
      <SectionCreator title={t("Trending Now", { defaultValue: "Trending Now" })} seeMoreLink="/products/search?sort=popular">
        <Grid container spacing={4}>
          <Grid size={{ md: 3, xs: 12 }}>
            <Skeleton variant="rectangular" height={700} sx={{ borderRadius: 3 }} />
            <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
            <Skeleton variant="text" width="50%" />
          </Grid>
          <Grid container spacing={4} size={{ md: 9, xs: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid size={{ sm: 4, xs: 12 }} key={i}>
                <Skeleton variant="rectangular" height={460} sx={{ borderRadius: 2 }} />
                <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
                <Skeleton variant="text" width="50%" />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </SectionCreator>
    );
  }

  if (!products.length) return null;

  const TRENDING_ITEMS = products.slice(1);

  return (
    <SectionCreator title={t("Trending Now", { defaultValue: "Trending Now" })} seeMoreLink="/products/search?sort=popular">
      <Grid container spacing={4}>
        <Grid size={{ md: 3, xs: 12 }}>
          <LongProductCard
            product={products[0]}
            likeProductHandler={(productId) => likeProductHandler(user, productId)}
          />
        </Grid>

        <Grid container spacing={4} size={{ md: 9, xs: 12 }}>
          {TRENDING_ITEMS.map((product) => (
            <Grid size={{ sm: 4, xs: 12 }} key={product.id}>
              <ProductCard2
                product={product}
                likeProductHandler={(productId) => likeProductHandler(user, productId)}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </SectionCreator>
  );
}
