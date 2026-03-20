"use client";

import { useMemo, useState } from "react";
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
  limit: 8,
  sort: "createdAt",
  direction: "DESC",
  search: {},
};

export default function Section3() {
  const { t } = useTranslation();
  const [likeOverrides, setLikeOverrides] = useState<Record<string, number>>({});
  const user = useReactiveVar(userVar);

  /** APOLLO REQUESTS **/
  const [likeTargetProduct] = useMutation<{ likeTargetProduct: { _id: string; productLikes: number } }>(LIKE_TARGET_PRODUCT);

  const {
    loading: getNewArrivalsLoading,
    data: getNewArrivalsData,
  } = useQuery(GET_PRODUCTS, {
    fetchPolicy: "cache-and-network",
    variables: { input: initialInput },
  });

  const products = useMemo(() => {
    const raw: GqlProduct[] = getNewArrivalsData?.getProducts?.products ?? [];
    return raw.map((product) => {
      const model = toProductModel(product);
      const overriddenLikes = likeOverrides[model.id];
      return overriddenLikes === undefined ? model : { ...model, productLikes: overriddenLikes };
    });
  }, [getNewArrivalsData, likeOverrides]);

  const showInitialLoading = getNewArrivalsLoading && !products.length;

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
      <SectionCreator title={t("New Arrivals", { defaultValue: "New Arrivals" })} seeMoreLink="/products/search?sort=newest">
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
    <SectionCreator title={t("New Arrivals", { defaultValue: "New Arrivals" })} seeMoreLink="/products/search?sort=newest">
      <ProductsCarousel>
        {products.map((product) => (
          <ProductCard2
            key={product.id}
            product={product}
            showReview={false}
            enableSecondaryImage={false}
            likeProductHandler={(productId) => likeProductHandler(user, productId)}
          />
        ))}
      </ProductsCarousel>
    </SectionCreator>
  );
}
