"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
// MUI
import Grid from "@mui/material/Grid";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Remove from "@mui/icons-material/Remove";
import Add from "@mui/icons-material/Add";
// LOCAL CUSTOM COMPONENTS
import AddToCart from "./add-to-cart";
import ProductGallery from "./product-gallery";
import ProductVariantSelector from "./product-variant-selector";
// CUSTOM UTILS LIBRARY FUNCTION
import { calculateDiscount, currency } from "lib";
// STYLED COMPONENTS
import { StyledRoot } from "./styles";
// CUSTOM DATA MODEL
import Product from "models/Product.model";

// ================================================================
type Props = { product: Product };
// ================================================================

export default function ProductIntro({ product }: Props) {
  const searchParams = useSearchParams();
  const [qty, setQty] = useState(1);

  const selectedSize = searchParams.get("size") ?? "";
  const selectedColor = searchParams.get("color") ?? "";
  const maxQty = product.productStockQuantity ?? 99;

  const category = product.categories?.[0] ? String(product.categories[0]) : "N/A";
  const hasDiscount = product.discount > 0;
  const currentPrice = hasDiscount ? calculateDiscount(product.price, product.discount) : currency(product.price);

  const stockQty = product.productStockQuantity;
  const stockDisplay =
    stockQty === undefined ? (
      <Typography variant="body2" color="text.secondary">Stock Available</Typography>
    ) : stockQty <= 10 ? (
      <Typography variant="body2" color="error.main" fontWeight={600}>
        Only {stockQty} left in stock!
      </Typography>
    ) : (
      <Typography variant="body2" color="success.main" fontWeight={600}>In Stock</Typography>
    );

  return (
    <StyledRoot>
      <Grid container spacing={3} justifyContent="space-around">
        {/* IMAGE GALLERY AREA */}
        <Grid size={{ lg: 6, md: 7, xs: 12 }}>
          <ProductGallery images={product.images!} />
        </Grid>

        <Grid size={{ lg: 5, md: 5, xs: 12 }}>
          <Typography variant="h1">{product.title}</Typography>

          <Typography variant="body1">
            Category: <strong>{category}</strong>
          </Typography>

          <Typography variant="body1">
            Product Code: <strong>{product.id}</strong>
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

          {/* STOCK */}
          <div style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>
            {stockDisplay}
          </div>

          {/* QUANTITY STEPPER */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <IconButton
              size="small"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}
            >
              <Remove fontSize="small" />
            </IconButton>

            <Typography variant="h6" sx={{ minWidth: 28, textAlign: "center" }}>
              {qty}
            </Typography>

            <IconButton
              size="small"
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}
            >
              <Add fontSize="small" />
            </IconButton>
          </div>

          {/* ADD TO CART BUTTON */}
          <AddToCart
            product={product}
            qty={qty}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
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
