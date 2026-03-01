"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
// MUI
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
// MUI ICON COMPONENTS
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
// APOLLO
import { useMutation } from "@apollo/client/react";
import { LIKE_TARGET_PRODUCT } from "../../../../apollo/user/mutation";
// GLOBAL CUSTOM COMPONENTS
import { FlexBetween, FlexBox } from "components/flex-box";
// CUSTOM UTILS LIBRARY FUNCTIONS
import { calculateDiscount, currency } from "lib";
// CUSTOM DATA MODEL
import Product from "models/Product.model";

// ===========================================================
type Props = { product: Product };
// ===========================================================

export default function LongProductCard({ product }: Props) {
  if (!product) return null;

  const { slug, title, price, thumbnail, rating, discount, productLikes } = product;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(productLikes ?? 0);

  /** APOLLO REQUESTS **/
  const [likeTargetProduct, { loading: likeLoading }] = useMutation(LIKE_TARGET_PRODUCT);

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
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
      }
      setLiked((prev) => !prev);
    } catch {
      // silently ignore
    }
  };

  return (
    <div>
      <Link href={`/products/${slug}`} style={{ textDecoration: "none" }}>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: 340, md: 700 },
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "grey.100",
            transition: "box-shadow 0.3s ease",
            "&:hover": { boxShadow: "0 12px 32px rgba(0,0,0,0.12)" },
          }}
        >
          <Image
            fill
            alt={title}
            src={thumbnail}
            sizes="(max-width: 768px) 100vw, 320px"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </Box>
      </Link>

      <FlexBetween mt={1.5} alignItems="flex-start">
        <Box>
          <Typography
            noWrap
            sx={{
              fontWeight: 600,
              fontSize: 15,
              mb: 0.5,
              transition: "color 0.2s",
              "&:hover": { color: "primary.main" },
            }}
          >
            {title}
          </Typography>

          <Rating size="small" value={rating} readOnly sx={{ mb: 0.5 }} />

          <FlexBox alignItems="center" gap={1}>
            <Typography fontWeight={700} fontSize={18} color="primary.main" lineHeight={1.2}>
              {calculateDiscount(price, discount)}
            </Typography>
            {discount > 0 && (
              <Box component="del" sx={{ color: "grey.400", fontWeight: 400, fontSize: 12 }}>
                {currency(price)}
              </Box>
            )}
          </FlexBox>
        </Box>

        <IconButton
          onClick={handleLike}
          disableRipple={false}
          size="small"
          sx={{ mt: 0.5, color: liked ? "error.main" : "grey.500" }}
        >
          {liked
            ? <FavoriteIcon fontSize="medium" />
            : <FavoriteBorder fontSize="medium" />
          }
          {likeCount > 0 && (
            <Typography component="span" variant="caption" sx={{ ml: 0.5, fontWeight: 500 }}>
              {likeCount}
            </Typography>
          )}
        </IconButton>
      </FlexBetween>
    </div>
  );
}
