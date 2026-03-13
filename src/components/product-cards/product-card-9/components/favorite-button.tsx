"use client";

import { useState } from "react";
import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
// APOLLO
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { LIKE_TARGET_PRODUCT } from "../../../../../apollo/user/mutation";
import { userVar } from "../../../../../apollo/store";
// UTILS
import { sweetLikeSuccessAlert, sweetUnlikeAlert, sweetMixinErrorAlert, sweetTopSmallErrorAlert } from "lib/sweetAlert";
import { Message } from "../../../../lib/types/common";
// DATA MODEL
import Product from "models/Product.model";
import { StyledFavoriteIconButton } from "./styles";

// ==============================================================
type Props = {
  product: Product;
  mode?: "floating" | "inline";
  onLikesChange?: (likes: number) => void;
};
// ==============================================================

export default function FavoriteButton({ product, mode = "floating", onLikesChange }: Props) {
  const { id, meLiked } = product;
  const user = useReactiveVar(userVar);
  const [liked, setLiked] = useState<boolean>(meLiked ?? false);

  /** APOLLO REQUESTS **/
  const [likeTargetProduct] = useMutation<{ likeTargetProduct: { _id: string; productLikes: number } }>(LIKE_TARGET_PRODUCT);

  /** HANDLER **/
  const handleFavorite = async () => {
    try {
      if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);

      const { data } = await likeTargetProduct({ variables: { input: id } });
      const updated = data?.likeTargetProduct;
      if (updated?._id) {
        if (typeof updated.productLikes === "number") {
          onLikesChange?.(updated.productLikes);
        }
        if (liked) {
          setLiked(false);
          await sweetUnlikeAlert();
        } else {
          setLiked(true);
          await sweetLikeSuccessAlert();
        }
      }
    } catch (err: any) {
      console.log("Err on FavoriteButton:", err);
      if (err.message === Message.NOT_AUTHENTICATED) {
        sweetTopSmallErrorAlert("Please log in to like products", 2500);
      } else {
        sweetMixinErrorAlert(err.message).then();
      }
    }
  };

  return (
    <StyledFavoriteIconButton
      size="small"
      mode={mode}
      liked={liked}
      onClick={handleFavorite}
    >
      {liked
        ? <Favorite fontSize="small" />
        : <FavoriteBorder fontSize="small" />
      }
    </StyledFavoriteIconButton>
  );
}
