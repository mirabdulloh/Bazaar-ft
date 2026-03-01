"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
// MUI
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
// APOLLO
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { LIKE_TARGET_PRODUCT } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";
// UTILS
import { calculateDiscount, currency } from "lib";
import { sweetLikeSuccessAlert, sweetMixinErrorAlert } from "lib/sweetAlert";
import { Message } from "lib/types/common";
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
  ViewBadge
} from "./styles";
// CUSTOM DATA MODEL
import Product from "models/Product.model";

// ========================================================
interface Props {
  product: Product;
  showReview?: boolean;
  imageHeight?: number;
}
// ========================================================

export default function ProductCard2({ product, showReview = true, imageHeight }: Props) {
  const { slug, title, price, thumbnail, rating, discount, images, productLikes, productViews } =
    product;
  const secondImage = images?.[1];
  const discountedPrice = calculateDiscount(price, discount);
  const originalPrice = currency(price);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(productLikes ?? 0);

  /** APOLLO REQUESTS **/
  const [likeTargetProduct, { loading: likeLoading }] = useMutation<{
    likeTargetProduct: { productLikes: number };
  }>(LIKE_TARGET_PRODUCT);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (likeLoading) return;
    try {
      const { data } = await likeTargetProduct({ variables: { input: product.id } });
      const updated = data?.likeTargetProduct;
      if (updated?.productLikes !== undefined) {
        setLikeCount(updated.productLikes);
      } else {
        // Optimistic toggle
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
      }
      setLiked((prev) => !prev);
    } catch {
      // silently ignore (e.g. not logged in)
    }
  };

  return (
    <StyledRoot hasSecondImage={!!secondImage}>
      <Link href={`/products/${slug}`} style={{ textDecoration: "none" }}>
        <ImageBox className="card-img-box" imageHeight={imageHeight}>
          {/* Primary image */}
          <ImageLayer className="img-primary">
            <Image
              fill
              alt={title}
              src={thumbnail}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </ImageLayer>

          {/* Secondary image — shown on hover (opacity controlled by CSS class, not inline style) */}
          {secondImage && (
            <ImageLayer className="img-secondary">
              <Image
                fill
                alt={title}
                src={secondImage}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
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

          {/* Likes — interactive */}
          {productLikes !== undefined && (
            <div className="likes" onClick={handleLike} role="button" aria-label="Like product">
              {liked ? <FavoriteIcon sx={{ color: "error.main" }} /> : <FavoriteBorderIcon />}
              <span>{likeCount}</span>
            </div>
          )}
        </div>
      </ContentWrapper>
    </StyledRoot>
  );
}
