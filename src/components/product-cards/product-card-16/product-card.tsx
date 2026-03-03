"use client";

import { useState } from "react";
import Link from "next/link";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
// MUI ICONS
import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
// APOLLO
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { LIKE_TARGET_PRODUCT } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";
// GLOBAL CUSTOM COMPONENTS
import LazyImage from "components/LazyImage";
import { FlexBox } from "components/flex-box";
// LOCAL CUSTOM COMPONENTS
import AddToCart from "./add-to-cart";
import DiscountChip from "../discount-chip";
// CUSTOM UTILS LIBRARY FUNCTIONS
import { calculateDiscount, currency } from "lib";
import { sweetLikeSuccessAlert, sweetUnlikeAlert, sweetMixinErrorAlert } from "lib/sweetAlert";
// STYLED COMPONENTS
import { PriceText, StyledRoot } from "./styles";
// CUSTOM DATA MODEL
import Product from "models/Product.model";
import { Message } from "../../../lib/types/common";

// ==============================================================
type Props = { product: Product };
// ==============================================================

export default function ProductCard16({ product }: Props) {
  const { slug, title, thumbnail, price, discount, rating, productLikes, productViews, productRank, meLiked, id } = product;
  const isBestSeller = (productRank ?? 0) >= 5;

  const user = useReactiveVar(userVar);
  const [likes, setLikes] = useState<number>(productLikes ?? 0);
  const [liked, setLiked] = useState<boolean>(meLiked ?? false);

  /** APOLLO REQUESTS **/
  const [likeTargetProduct] = useMutation<{ likeTargetProduct: { _id: string; productLikes: number } }>(LIKE_TARGET_PRODUCT);

  /** HANDLERS **/
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);

      const { data } = await likeTargetProduct({ variables: { input: id } });
      const updated = data?.likeTargetProduct;
      if (updated?._id) {
        setLikes(updated.productLikes);
        if (liked) {
          setLiked(false);
          await sweetUnlikeAlert();
        } else {
          setLiked(true);
          await sweetLikeSuccessAlert();
        }
      }
    } catch (err: any) {
      console.log("Err on handleLike:", err);
      sweetMixinErrorAlert(err.message).then();
    }
  };

  return (
    <StyledRoot>
      <Link href={`/products/${slug}`}>
        <div className="img-wrapper">
          <LazyImage alt={title} width={380} height={379} src={thumbnail} />

          {/* Discount chip — top left */}
          {discount ? <DiscountChip discount={discount} sx={{ left: 12, top: 12 }} /> : null}

          {/* Best Seller chip — top right */}
          {isBestSeller && (
            <Chip
              label="Best Seller"
              size="small"
              color="warning"
              sx={{
                position: "absolute",
                right: 12,
                top: 12,
                fontWeight: 700,
                fontSize: 11,
                height: 22,
              }}
            />
          )}
        </div>
      </Link>

      {/* CONTENT ROW — text left, Add to Cart right */}
      <div className="content">
        {/* Left: all text info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href={`/products/${slug}`}>
            <Typography
              variant="body1"
              fontWeight={600}
              sx={{
                mb: 0.5,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {title}
            </Typography>
          </Link>

          <Rating readOnly value={rating} size="small" precision={0.5} />

          <PriceText>
            {calculateDiscount(price, discount)}
            {discount && <span className="base-price">{currency(price)}</span>}
          </PriceText>

          {/* LIKES + VIEWS */}
          <FlexBox alignItems="center" gap={1.5} mt={1}>
            {/* Interactive like button */}
            <FlexBox alignItems="center" gap={0.4}>
              <IconButton
                size="small"
                onClick={handleLike}
                sx={{ p: 0, color: liked ? "error.main" : "grey.500" }}
              >
                {liked
                  ? <Favorite sx={{ fontSize: 20 }} />
                  : <FavoriteBorder sx={{ fontSize: 20 }} />
                }
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                {likes}
              </Typography>
            </FlexBox>

            {/* Views (display only) */}
            <FlexBox alignItems="center" gap={0.4}>
              <VisibilityOutlined sx={{ fontSize: 20, color: "grey.500" }} />
              <Typography variant="body2" color="text.secondary">
                {productViews ?? 0}
              </Typography>
            </FlexBox>
          </FlexBox>
        </div>

        {/* Right: Add to Cart button */}
        <AddToCart product={product} />
      </div>
    </StyledRoot>
  );
}
