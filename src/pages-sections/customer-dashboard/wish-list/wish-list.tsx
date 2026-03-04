"use client";

import { Fragment, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Grid from "@mui/material/Grid";
import Favorite from "@mui/icons-material/Favorite";
import Typography from "@mui/material/Typography";
// CUSTOM COMPONENTS
import Pagination from "../pagination";
import DashboardHeader from "../dashboard-header";
import ProductCard17 from "components/product-cards/product-card-17";
// CUSTOM DATA MODEL
import Product from "models/Product.model";
// APOLLO
import { useReactiveVar } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_FAVORITE_PRODUCTS } from "../../../../apollo/user/query";
import { userVar } from "../../../../apollo/store";
import { T } from "lib/types/common";

// ==================================================================
interface GqlProduct {
  _id: string;
  productTitle: string;
  productPrice: number;
  productDiscountPrice: number;
  productImages: string[];
  productRatingAverage: number;
  productLikes: number;
  productViews: number;
  productRank?: number;
  productStockQuantity?: number;
}
// ==================================================================

const PAGE_SIZE = 6;

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
    productRank: p.productRank,
    productStockQuantity: p.productStockQuantity,
  };
}

export default function WishListPageView() {
  const user = useReactiveVar(userVar);
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const { data, loading } = useQuery(GET_FAVORITE_PRODUCTS, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    skip: !user?._id,
    variables: { input: { page, limit: PAGE_SIZE } },
  });

  const rawProducts: GqlProduct[] = useMemo(
    () => (data as T)?.getFavoriteProducts?.products ?? [],
    [data]
  );

  const totalPages = useMemo(() => {
    const total = (data as T)?.getFavoriteProducts?.metaData?.total ?? 0;
    return total > 0 ? Math.ceil(total / PAGE_SIZE) : 0;
  }, [data]);

  const products = useMemo(() => rawProducts.map(toProductModel), [rawProducts]);

  return (
    <Fragment>
      <DashboardHeader title="My Wish List" Icon={Favorite} />

      {!user?._id ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Please login to view your wishlist.
        </Typography>
      ) : loading ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading wishlist...
        </Typography>
      ) : products.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No items in your wishlist yet.
        </Typography>
      ) : (
        <Fragment>
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid size={{ lg: 4, sm: 6, xs: 12 }} key={product.id}>
                <ProductCard17 bgWhite product={product} />
              </Grid>
            ))}
          </Grid>

          <Pagination count={totalPages} />
        </Fragment>
      )}
    </Fragment>
  );
}
