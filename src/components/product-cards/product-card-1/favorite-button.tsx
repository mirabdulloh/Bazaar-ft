"use client";

import { useState } from "react";
// MUI
import IconButton from "@mui/material/IconButton";
import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
// APOLLO
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { LIKE_TARGET_PRODUCT } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";
// UTILS
import { sweetLikeSuccessAlert, sweetUnlikeAlert, sweetMixinErrorAlert } from "lib/sweetAlert";
import { Message } from "../../../lib/types/common";
// CUSTOM DATA MODEL
import Product from "models/Product.model";

// ==============================================================
type Props = { product: Product };
// ==============================================================

export default function FavoriteButton({ product }: Props) {
  const { id, meLiked } = product;
  const user = useReactiveVar(userVar);
  const [liked, setLiked] = useState<boolean>(meLiked ?? false);

  const [likeTargetProduct] = useMutation<{
    likeTargetProduct: { _id: string; productLikes: number };
  }>(LIKE_TARGET_PRODUCT);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
      const { data } = await likeTargetProduct({ variables: { input: id } });
      if (data?.likeTargetProduct?._id) {
        if (liked) {
          setLiked(false);
          await sweetUnlikeAlert();
        } else {
          setLiked(true);
          await sweetLikeSuccessAlert();
        }
      }
    } catch (err: any) {
      sweetMixinErrorAlert(err.message).then();
    }
  };

  return (
    <IconButton
      size="small"
      onClick={handleFavorite}
      sx={{
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 3,
        color: liked ? "error.main" : "grey.400",
        bgcolor: "background.paper",
        boxShadow: 1,
        "&:hover": { bgcolor: "background.paper", color: "error.main" },
      }}
    >
      {liked ? (
        <Favorite fontSize="small" />
      ) : (
        <FavoriteBorder fontSize="small" />
      )}
    </IconButton>
  );
}
