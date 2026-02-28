"use client";

import { useState } from "react";
import { SectionCreator } from "components/section-header";
import ProductCard2 from "components/product-cards/product-card-2";
import ProductsCarousel from "../section-3/products-carousel";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
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
  productLikes: number;
  productViews: number;
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
  };
}

export default function Section5() {
  const [products, setProducts] = useState<Product[]>([]);

  /** APOLLO REQUESTS **/
  const {
    loading: getBestSellersLoading,
    data: _getBestSellersData,
    error: _getBestSellersError,
    refetch: getBestSellersRefetch,
  } = useQuery(GET_PRODUCTS, {
    fetchPolicy: "cache-and-network",
    variables: {
      input: {
        page: 1,
        limit: 8,
        sort: "productRank",
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

  if (getBestSellersLoading) {
    return (
      <SectionCreator title="Best Sellers" seeMoreLink="/products/search?sort=best-sellers">
        <Box display="flex" gap={2} overflow="hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Box key={i} minWidth={260} flex="0 0 auto">
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
    <SectionCreator title="Best Sellers" seeMoreLink="/products/search?sort=best-sellers">
      <ProductsCarousel>
        {products.map((product) => (
          <ProductCard2 key={product.id} product={product} />
        ))}
      </ProductsCarousel>
    </SectionCreator>
  );
}
