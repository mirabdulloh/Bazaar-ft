import Link from "next/link";
import Image from "next/image";
// MUI
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
// UTILS
import { calculateDiscount, currency } from "lib";
// LOCAL CUSTOM COMPONENTS
import HoverActions from "./hover-actions";
// STYLED COMPONENTS
import { CartOverlay, ContentWrapper, DiscountBadge, ImageBox, ImageLayer, StyledRoot, ViewBadge } from "./styles";
// CUSTOM DATA MODEL
import Product from "models/Product.model";

// ========================================================
interface Props {
  product: Product;
  showReview?: boolean;
}
// ========================================================

export default function ProductCard2({ product, showReview = true }: Props) {
  const { slug, title, price, thumbnail, rating, discount, images, productLikes, productViews } = product;
  const secondImage = images?.[1];
  const discountedPrice = calculateDiscount(price, discount);
  const originalPrice = currency(price);

  return (
    <StyledRoot hasSecondImage={!!secondImage}>
      <Link href={`/products/${slug}`} style={{ textDecoration: "none" }}>
        <ImageBox className="card-img-box">

          {/* Primary image */}
          <ImageLayer className="img-primary">
            <Image
              fill
              alt={title}
              src={thumbnail}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </ImageLayer>

          {/* Secondary image — shown on hover */}
          {secondImage && (
            <ImageLayer className="img-secondary" style={{ opacity: 0 }}>
              <Image
                fill
                alt={title}
                src={secondImage}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </ImageLayer>
          )}

          {/* Discount badge — top left */}
          {discount > 0 && (
            <DiscountBadge>{discount}% OFF</DiscountBadge>
          )}

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
            {discount > 0 && (
              <span className="original-price">{originalPrice}</span>
            )}
          </div>

          {/* Likes */}
          {productLikes !== undefined && (
            <div className="likes">
              <FavoriteBorderIcon />
              <span>{productLikes}</span>
            </div>
          )}
        </div>
      </ContentWrapper>
    </StyledRoot>
  );
}
