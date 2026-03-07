"use client";

import { useState, useEffect, useRef } from "react";
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
  // Prevents stale-cache prop sync from overriding an in-flight optimistic update
  const pendingRef = useRef(false);

  // Sync with Apollo cache/network updates (e.g. after tab switch + refetch)
  useEffect(() => {
    if (!pendingRef.current) {
      setLiked(meLiked ?? false);
    }
  }, [meLiked]);

  const [likeTargetProduct] = useMutation<{
    likeTargetProduct: { _id: string; productLikes: number };
  }>(LIKE_TARGET_PRODUCT);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
      pendingRef.current = true;
      const newLiked = !liked;
      setLiked(newLiked);
      const { data } = await likeTargetProduct({ variables: { input: id } });
      if (data?.likeTargetProduct?._id) {
        if (newLiked) {
          await sweetLikeSuccessAlert();
        } else {
          await sweetUnlikeAlert();
        }
      } else {
        // Mutation returned no data — revert
        setLiked(!newLiked);
      }
    } catch (err: any) {
      setLiked(meLiked ?? false);
      sweetMixinErrorAlert(err.message).then();
    } finally {
      pendingRef.current = false;
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
