import Link from "next/link";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
// MUI ICONS
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
// GLOBAL CUSTOM COMPONENTS
import LazyImage from "components/LazyImage";
import { FlexBox } from "components/flex-box";
// LOCAL CUSTOM COMPONENTS
import DiscountChip from "../discount-chip";
import ProductPrice from "../product-price";
import AddToCartButton from "./components/add-to-cart";
import FavoriteButton from "./components/favorite-button";
// CUSTOM DATA MODEL
import Product from "models/Product.model";
// STYLED COMPONENT
import { ContentWrapper, Wrapper } from "./styles";

// ===========================================================
type Props = { product: Product };
// ===========================================================

export default function ProductCard9({ product }: Props) {
  const { thumbnail, title, price, discount, rating, slug, productLikes, productViews, productRank } = product;
  const isBestSeller = (productRank ?? 0) >= 5;

  return (
    <Wrapper>
      {/* LIKE BUTTON — wired to real mutation */}
      <FavoriteButton product={product} />

      <ContentWrapper>
        <div className="img-wrapper">
          <DiscountChip discount={discount} />
          <LazyImage src={thumbnail} alt={title} width={500} height={500} />
        </div>

        <div className="content">
          <div>
            {/* BADGES ROW */}
            <FlexBox alignItems="center" gap={1} mb={0.5} flexWrap="wrap">
              {isBestSeller && (
                <Chip
                  label="Best Seller"
                  size="small"
                  color="warning"
                  sx={{ fontWeight: 700, fontSize: 11, height: 20 }}
                />
              )}
              {discount ? (
                <Chip
                  label={`${discount}% off`}
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ fontSize: 11, height: 20 }}
                />
              ) : null}
            </FlexBox>

            {/* TITLE */}
            <Link href={`/products/${slug}`}>
              <Typography
                variant="h6"
                sx={{
                  mt: 0.5,
                  mb: 1,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {title}
              </Typography>
            </Link>

            <Rating size="small" value={rating} color="warn" readOnly />

            <ProductPrice price={price} discount={discount} />

            {/* LIKES + VIEWS */}
            <FlexBox alignItems="center" gap={1.5} mt={1}>
              <FlexBox alignItems="center" gap={0.5}>
                <FavoriteBorder sx={{ fontSize: 16, color: "grey.500" }} />
                <Typography variant="body2" color="text.secondary">
                  {productLikes ?? 0}
                </Typography>
              </FlexBox>
              <FlexBox alignItems="center" gap={0.5}>
                <VisibilityOutlined sx={{ fontSize: 16, color: "grey.500" }} />
                <Typography variant="body2" color="text.secondary">
                  {productViews ?? 0}
                </Typography>
              </FlexBox>
            </FlexBox>
          </div>

          <AddToCartButton product={product} />
        </div>
      </ContentWrapper>
    </Wrapper>
  );
}
