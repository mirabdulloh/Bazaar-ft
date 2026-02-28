"use client";

import { useState } from "react";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import LongProductCard from "./long-product-card";
import { SectionCreator } from "components/section-header";
import ProductCard2 from "components/product-cards/product-card-2";
import Product from "models/Product.model";
import { useQuery } from "../../../lib/hooks/useQuery";
import { GET_PRODUCTS } from "../../../../apollo/user/query";
import { T } from "../../../lib/types/common";

interface GqlProduct {
  _id: string;
  productTitle: string;
  productPrice: number;
  productDiscountPrice: number;
  productImages: string[];
  productRatingAverage: number;
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
  };
}

export default function Section6() {
  const [products, setProducts] = useState<Product[]>([]);

  /** APOLLO REQUESTS **/
  const {
    loading: getTrendingLoading,
    data: _getTrendingData,
    error: _getTrendingError,
    refetch: getTrendingRefetch,
  } = useQuery(GET_PRODUCTS, {
    fetchPolicy: "cache-and-network",
    variables: {
      input: {
        page: 1,
        limit: 7,
        sort: "productViews",
        direction: "DESC",
        search: {},
      },
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      const raw: GqlProduct[] = data?.getProducts?.products ?? [];
      setProducts(raw.map(toProductModel));
    },
  });

  if (getTrendingLoading) {
    return (
      <SectionCreator title="Trending Now" seeMoreLink="/products/search?sort=popular">
        <Grid container spacing={4}>
          <Grid size={{ md: 3, xs: 12 }}>
            <Skeleton variant="rectangular" height={300} />
            <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
            <Skeleton variant="text" width="50%" />
          </Grid>
          <Grid container spacing={4} size={{ md: 9, xs: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid size={{ sm: 4, xs: 12 }} key={i}>
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
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
    <SectionCreator title="Trending Now" seeMoreLink="/products/search?sort=popular">
      <Grid container spacing={4}>
        <Grid size={{ md: 3, xs: 12 }}>
          <LongProductCard product={products[0]} />
        </Grid>

        <Grid container spacing={4} size={{ md: 9, xs: 12 }}>
          {TRENDING_ITEMS.map((product) => (
            <Grid size={{ sm: 4, xs: 16 }} key={product.id}>
              <ProductCard2 product={product} />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </SectionCreator>
  );
}
