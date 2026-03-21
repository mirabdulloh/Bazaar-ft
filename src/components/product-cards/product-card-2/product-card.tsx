"use client";

import { useState } from "react";
import Link from "next/link";
import { useReactiveVar } from "@apollo/client/react";
import { userVar } from "../../../../apollo/store";
import { sweetTopSmallErrorAlert } from "lib/sweetAlert";
import ServerImage from "components/server-image";
// MUI
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
// UTILS
import { calculateDiscount, currency } from "lib";
// LOCAL CUSTOM COMPONENTS
import HoverActions from "./hover-actions";
// STYLED COMPONENTS
import {
  CartOverlay,
  ContentWrapper,
  DiscountBadge,
  ImageBox,
  ImageLayer,
  StyledRoot,
  ViewBadge,
} from "./styles";
// CUSTOM DATA MODEL
import Product from "models/Product.model";

// ========================================================
interface Props {
  product: Product;
  showReview?: boolean;
  imageHeight?: number;
  likeProductHandler?: (productId: string) => void;
  enableSecondaryImage?: boolean;
}
// ========================================================

function ProductImage({
  src,
  alt,
  fallbackSrc,
}: {
  src: string;
  alt: string;
  fallbackSrc?: string;
}) {
  return (
    <ServerImage
      src={src}
      fallbackSrc={fallbackSrc}
      alt={alt}
      loading="eager"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        objectPosition: "center",
        display: "block",
      }}
    />
  );
}

export default function ProductCard2({
  product,
  showReview = true,
  imageHeight,
  likeProductHandler,
  enableSecondaryImage = true,
}: Props) {
  const { slug, title, price, thumbnail, rating, discount, images, productLikes, productViews } =
    product;
  const secondImage = enableSecondaryImage ? images?.[1] : undefined;
  const primaryFallback = images?.[0] && images[0] !== thumbnail ? images[0] : undefined;
  const discountedPrice = calculateDiscount(price, discount);
  const originalPrice = currency(price);

  const user = useReactiveVar(userVar);
  const [liked, setLiked] = useState(product.meLiked ?? false);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?._id) {
      sweetTopSmallErrorAlert("Please log in to like products", 2500);
      return;
    }
    setLiked((prev) => !prev);
    likeProductHandler?.(product.id);
  };

  return (
    <StyledRoot hasSecondImage={!!secondImage}>
      <Link href={`/products/${slug}`} style={{ textDecoration: "none" }}>
        <ImageBox className="card-img-box" imageHeight={imageHeight}>
          {/* Primary image */}
          <ImageLayer className="img-primary">
            <ProductImage alt={title} src={thumbnail} fallbackSrc={primaryFallback} />
          </ImageLayer>

          {/* Secondary image — shown on hover */}
          {secondImage && (
            <ImageLayer className="img-secondary">
              <ProductImage alt={title} src={secondImage} />
            </ImageLayer>
          )}

          {/* Discount badge — top left */}
          {discount > 0 && <DiscountBadge>{discount}% OFF</DiscountBadge>}

          {/* Views badge — top right */}
          {productViews !== undefined && (
            <ViewBadge>
              <VisibilityOutlinedIcon />
              <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>
                {productViews}
              </Typography>
            </ViewBadge>
          )}

          {/* Add to Cart — slides up on hover */}
          <CartOverlay className="cart-overlay">
            <HoverActions product={product} />
          </CartOverlay>
        </ImageBox>
      </Link>

      {/* Card info */}
      <ContentWrapper>
        <Link href={`/products/${slug}`} style={{ textDecoration: "none", color: "inherit" }}>
          <Typography
            className="title"
            sx={{ mb: 0.25, transition: "color 0.2s", "&:hover": { color: "primary.main" } }}
          >
            {title}
          </Typography>
        </Link>

        {showReview && <Rating size="small" value={rating} readOnly sx={{ mb: 0.25 }} />}

        <div className="price-row">
          {/* Price block */}
          <div>
            <span className="current-price">{discountedPrice}</span>
            {discount > 0 && <span className="original-price">{originalPrice}</span>}
          </div>

          {/* Likes */}
          {productLikes !== undefined && (
            <div className="likes" onClick={handleLikeClick} role="button" aria-label="Like product">
              {liked ? <FavoriteIcon sx={{ color: "error.main" }} /> : <FavoriteBorderIcon />}
              <span>{productLikes}</span>
            </div>
          )}
        </div>
      </ContentWrapper>
    </StyledRoot>
  );
}
