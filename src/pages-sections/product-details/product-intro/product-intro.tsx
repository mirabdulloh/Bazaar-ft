"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
// MUI
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
// APOLLO
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { LIKE_TARGET_PRODUCT } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";
// LOCAL CUSTOM COMPONENTS
import AddToCart from "./add-to-cart";
import ProductGallery from "./product-gallery";
import ProductVariantSelector from "./product-variant-selector";
// UTILS
import { calculateDiscount, currency } from "lib";
import { sweetLikeSuccessAlert, sweetUnlikeAlert, sweetMixinErrorAlert, sweetTopSmallErrorAlert } from "lib/sweetAlert";
import { Message } from "../../../lib/types/common";
// STYLED COMPONENTS
import { StyledRoot } from "./styles";
// CUSTOM DATA MODEL
import Product from "models/Product.model";

// ================================================================
type Props = { product: Product };
// ================================================================

function StockBadge({ qty }: { qty: number | undefined }) {
  if (qty === undefined) {
    return (
      <Typography variant="body2" color="text.secondary">
        Check availability
      </Typography>
    );
  }
  if (qty === 0) {
    return <Chip label="Out of Stock" color="error" size="small" sx={{ fontWeight: 700 }} />;
  }
  if (qty <= 5) {
    return (
      <Typography variant="body2" color="error.main" fontWeight={700}>
        🔥 Only {qty} left! Order soon.
      </Typography>
    );
  }
  if (qty <= 10) {
    return (
      <Typography variant="body2" color="warning.main" fontWeight={600}>
        Only {qty} left in stock.
      </Typography>
    );
  }
  return (
    <Typography variant="body2" color="success.main" fontWeight={600}>
      {qty} in stock
    </Typography>
  );
}

export default function ProductIntro({ product }: Props) {
  const searchParams = useSearchParams();
  const user = useReactiveVar(userVar);

  // Derived directly from Apollo cache — auto-updates when mutation response merges
  const liked = product.meLiked ?? false;
  const likes = product.productLikes ?? 0;

  const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

  const selectedSize = searchParams.get("size") ?? "";
  const selectedColor = searchParams.get("color") ?? "";

  const category = product.categories?.[0] ? String(product.categories[0]) : "N/A";
  const hasDiscount = product.discount > 0;
  const currentPrice = hasDiscount
    ? calculateDiscount(product.price, product.discount)
    : currency(product.price);
  const outOfStock = product.productStockQuantity === 0;

  const handleLike = async () => {
    try {
      if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
      await likeTargetProduct({ variables: { input: product.id } });
      if (liked) {
        await sweetUnlikeAlert();
      } else {
        await sweetLikeSuccessAlert();
      }
    } catch (err: any) {
      if (err.message === Message.NOT_AUTHENTICATED) {
        sweetTopSmallErrorAlert("Please log in to like products", 2500);
      } else {
        sweetMixinErrorAlert(err.message).then();
      }
    }
  };

  return (
    <StyledRoot>
      <Grid container spacing={3} justifyContent="space-around">
        {/* IMAGE GALLERY AREA */}
        <Grid size={{ lg: 6, md: 7, xs: 12 }}>
          <ProductGallery images={product.images!} />
        </Grid>

        <Grid size={{ lg: 5, md: 5, xs: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
            <Typography variant="h1" sx={{ flex: 1 }}>{product.title}</Typography>
            <IconButton
              onClick={handleLike}
              sx={{
                color: liked ? "error.main" : "grey.400",
                flexShrink: 0,
                mt: 0.5,
                "&:hover": { color: "error.main" }
              }}
            >
              {liked ? <Favorite fontSize="large" /> : <FavoriteBorder fontSize="large" />}
            </IconButton>
          </div>

          <Typography variant="body1">
            Category: <strong>{category}</strong>
          </Typography>

          <Typography variant="body1" fontSize={30} fontWeight={700} sx={{ my: 1 }}>
            {currentPrice}{" "}
            {hasDiscount && (
              <Typography
                component="span"
                sx={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "text.secondary",
                  textDecoration: "line-through"
                }}
              >
                {currency(product.price)}
              </Typography>
            )}
          </Typography>

          {/* PRODUCT BRAND */}
          {product.brand && (
            <p className="brand">
              Brand: <strong>{product.brand}</strong>
            </p>
          )}

          {/* PRODUCT RATING */}
          <div className="rating">
            <span>Rated:</span>
            <Rating readOnly color="warn" size="small" value={product.rating} />
            <Typography variant="h6">({product.productRatingCount ?? 0})</Typography>
          </div>

          {/* PRODUCT VARIANTS */}
          <ProductVariantSelector sizes={product.size} colors={product.colors} />

          {/* STOCK BADGE */}
          <div style={{ marginTop: "0.75rem", marginBottom: "1rem" }}>
            <StockBadge qty={product.productStockQuantity} />
          </div>

          {/* ADD TO CART BUTTON */}
          <AddToCart
            product={product}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
            outOfStock={outOfStock}
          />

          {/* SHOP NAME */}
          {product.shop && (
            <p className="shop">
              Sold By:
              <Link href={`/brands/${product.shop.slug}`}>
                <strong>{product.shop.name}</strong>
              </Link>
            </p>
          )}
        </Grid>
      </Grid>
    </StyledRoot>
  );
}
