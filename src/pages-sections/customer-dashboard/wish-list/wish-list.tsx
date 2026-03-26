"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Favorite from "@mui/icons-material/Favorite";
import RemoveRedEyeOutlined from "@mui/icons-material/RemoveRedEyeOutlined";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
// APOLLO
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_FAVORITE_PRODUCTS } from "../../../../apollo/user/query";
import { LIKE_TARGET_PRODUCT } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";
// HOOKS
import useCart from "hooks/useCart";
import { useVariantPicker } from "contexts/VariantPickerContext";
// COMPONENTS
import Pagination from "../pagination";
import DashboardHeader from "../dashboard-header";
// TYPES
import Product from "models/Product.model";
import { T } from "lib/types/common";

// ==================================================================
const PAGE_SIZE = 8;
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

function resolveImg(raw?: string): string {
  if (!raw) return "/assets/images/products/product-1.png";
  return raw.startsWith("http") ? raw : `${BASE}/${raw}`;
}

function toProduct(p: T): Product & { _rawId: string } {
  const price = p.productPrice as number;
  const discPrice = p.productDiscountPrice as number;
  const discount =
    discPrice > 0 && discPrice < price
      ? Math.round(((price - discPrice) / price) * 100)
      : 0;
  const images = ((p.productImages as string[]) ?? []).map(resolveImg);
  const parseVariants = (val?: string[] | string): string[] => {
    if (!val) return [];
    const arr = Array.isArray(val) ? val : val.split(/[,/|]/);
    return Array.from(new Set(arr.map((v) => v.trim()).filter(Boolean)));
  };
  return {
    _rawId: p._id as string,
    id: p._id as string,
    memberId: p.memberId as string,
    slug: p._id as string,
    title: p.productTitle as string,
    price,
    discount,
    thumbnail: images[0] ?? "/assets/images/products/product-1.png",
    images,
    rating: (p.productRatingAverage as number) ?? 0,
    categories: [],
    size: parseVariants(p.productSize as string[] | string),
    colors: parseVariants(p.productColor as string[] | string),
    productLikes: p.productLikes as number,
    productStockQuantity: p.productStockQuantity as number,
  };
}
// ==================================================================

export default function WishListPageView() {
  const user = useReactiveVar(userVar);
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const { data, loading, refetch } = useQuery(GET_FAVORITE_PRODUCTS, {
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    skip: !user?._id,
    variables: { input: { page, limit: PAGE_SIZE } },
  });

  const rawProducts = useMemo(
    () => ((data as T)?.getFavoriteProducts?.products ?? []) as T[],
    [data]
  );

  const totalPages = useMemo(() => {
    const total = (data as T)?.getFavoriteProducts?.metaData?.total ?? 0;
    return total > 0 ? Math.ceil(total / PAGE_SIZE) : 0;
  }, [data]);

  const products = useMemo(() => rawProducts.map(toProduct), [rawProducts]);

  return (
    <Fragment>
      <DashboardHeader title="My Wish List" Icon={Favorite} />

      {!user?._id ? (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
          Please log in to view your wishlist.
        </Typography>
      ) : loading && products.length === 0 ? (
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Grid size={{ xs: 6, sm: 3 }} key={i}>
              <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : products.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Favorite sx={{ fontSize: 56, color: "grey.200", mb: 1.5 }} />
          <Typography variant="h6" fontWeight={600} color="text.secondary">
            Your wishlist is empty
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Browse our products and add your favorites here.
          </Typography>
          <Link href="/products/search">
            <Button variant="contained">Browse Products</Button>
          </Link>
        </Box>
      ) : (
        <Fragment>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {products.map((product) => (
              <Grid size={{ xs: 6, sm: 3 }} key={product.id}>
                <WishlistCard product={product} onRefetch={refetch} />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && <Pagination count={totalPages} />}
        </Fragment>
      )}
    </Fragment>
  );
}

// ── Wishlist Card ───────────────────────────────────────────────────
function WishlistCard({
  product,
  onRefetch,
}: {
  product: Product & { _rawId: string };
  onRefetch: () => void;
}) {
  const { id, title, price, discount, thumbnail, images } = product;
  const discountedPrice =
    discount > 0 ? price - Math.round((price * discount) / 100) : 0;

  const [removing, setRemoving] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quickViewLoading, setQuickViewLoading] = useState(false);
  const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
  const { dispatch } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const { openPicker } = useVariantPicker();

  useEffect(() => {
    setQuickViewLoading(false);
  }, [pathname]);

  const handleUnlike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoving(true);
    try {
      await likeTargetProduct({ variables: { input: id } });
      onRefetch();
    } catch {
      setRemoving(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const hasVariants = !!(product.size?.length || product.colors?.length);
    if (hasVariants) {
      openPicker(product);
      return;
    }
    setAddingToCart(true);
    setTimeout(() => {
      dispatch({
        type: "CHANGE_CART_AMOUNT",
        payload: { id, brandId: product.memberId, slug: id, price, title, thumbnail, qty: 1 },
      });
      router.push("/mini-cart", { scroll: false });
      setAddingToCart(false);
    }, 400);
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
        borderRadius: 2,
        bgcolor: "grey.50",
        transition: "all 250ms ease-in-out",
        "&:hover": {
          "& .hover-actions": { opacity: 1, transform: "translateY(0)" },
          "& .hover-img": { display: "block" },
          "& .main-img": { display: "none" },
        },
      }}
    >
      {/* Discount badge */}
      {discount > 0 && (
        <Chip
          label={`-${discount}%`}
          size="small"
          color="error"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 3,
            height: 20,
            fontSize: 10,
            fontWeight: 700,
          }}
        />
      )}

      {/* Like (heart) button — click to remove from wishlist */}
      <Tooltip title="Remove from wishlist" placement="top">
        <IconButton
          size="small"
          disabled={removing}
          onClick={handleUnlike}
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            zIndex: 3,
            bgcolor: "rgba(255,255,255,0.85)",
            color: "error.main",
            width: 28,
            height: 28,
            "&:hover": { bgcolor: "error.main", color: "white" },
          }}
        >
          <Favorite sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>

      {/* Image area */}
      <Box sx={{ position: "relative" }}>
        <Link href={`/products/${id}`} style={{ display: "block", position: "relative" }}>
          <Box
            sx={{
              height: 200,
              overflow: "hidden",
              cursor: "pointer",
              position: "relative",
            }}
          >
            {/* Main image */}
            <Box
              component="img"
              src={thumbnail}
              alt={title}
              className="main-img"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center",
                display: "block",
              }}
            />
            {/* Hover image */}
            {images.length > 1 && (
              <Box
                component="img"
                src={images[1]}
                alt={title}
                className="hover-img"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center",
                  display: "none",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              />
            )}
          </Box>
        </Link>

        {/* Hover actions: Add to Cart + Quick View */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            pointerEvents: "none",
          }}
        >
          <Box
            className="hover-actions"
            sx={{
              opacity: 0,
              px: 1,
              pb: 0.5,
              display: "flex",
              gap: 0.75,
              transition: "all 0.3s ease-in-out",
              transform: "translateY(12px)",
            }}
          >
            <Button
              size="small"
              variant="contained"
              type="button"
              sx={{
                pointerEvents: "auto",
                flex: 1,
                fontSize: 10,
                py: 0.6,
                borderRadius: 1.5,
                minWidth: 0,
              }}
              loading={addingToCart}
              onClick={handleAddToCart}
              startIcon={<ShoppingCartOutlined sx={{ fontSize: "13px !important" }} />}
            >
              Add to Cart
            </Button>

            <Link
              scroll={false}
              href={`/products/${id}/view`}
              style={{ flex: 1, pointerEvents: "auto" }}
              onClick={(e) => {
                e.stopPropagation();
                setQuickViewLoading(true);
              }}
            >
              <Button
                fullWidth
                size="small"
                variant="contained"
                type="button"
                loading={quickViewLoading}
                startIcon={<RemoveRedEyeOutlined sx={{ fontSize: "13px !important" }} />}
                sx={{
                  fontSize: 10,
                  py: 0.6,
                  borderRadius: 1.5,
                  minWidth: 0,
                  bgcolor: "white",
                  color: "text.primary",
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                Quick View
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 1.5, textAlign: "center" }}>
        <Link href={`/products/${id}`} style={{ textDecoration: "none" }}>
          <Typography
            variant="body2"
            fontWeight={600}
            color="text.primary"
            noWrap
            sx={{ mb: 0.5, "&:hover": { textDecoration: "underline" } }}
          >
            {title}
          </Typography>
        </Link>

        <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.75}>
          <Typography variant="body2" fontWeight={700} color="primary.main">
            ${discountedPrice > 0 ? discountedPrice.toFixed(2) : price.toFixed(2)}
          </Typography>
          {discount > 0 && (
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ textDecoration: "line-through" }}
            >
              ${price.toFixed(2)}
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
