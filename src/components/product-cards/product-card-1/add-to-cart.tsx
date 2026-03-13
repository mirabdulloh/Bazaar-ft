"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Add from "@mui/icons-material/Add";
// GLOBAL CUSTOM HOOKS
import useCart from "hooks/useCart";
import { useVariantPicker } from "contexts/VariantPickerContext";
// APOLLO
import { useReactiveVar } from "@apollo/client/react";
import { userVar } from "../../../../apollo/store";
// CUSTOM DATA MODEL
import Product from "models/Product.model";

// ==============================================================
type Props = { product: Product };
// ==============================================================

export default function AddToCart({ product }: Props) {
  const { id, slug, title, price, thumbnail } = product;

  const { dispatch } = useCart();
  const router = useRouter();
  const { openPicker } = useVariantPicker();
  const user = useReactiveVar(userVar);
  const [isLoading, setLoading] = useState(false);

  const handleAddToCart = () => {
    if (!user?._id) {
      router.push("/login");
      return;
    }
    const hasVariants = !!(product.size?.length || product.colors?.length);
    if (hasVariants) {
      openPicker(product);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      dispatch({
        type: "CHANGE_CART_AMOUNT",
        payload: { id, slug, price, title, thumbnail, qty: 1 }
      });

      router.push("/mini-cart", { scroll: false });
      setLoading(false);
    }, 500);
  };

  return (
    <Button
      color="primary"
      variant="outlined"
      loading={isLoading}
      onClick={handleAddToCart}
      sx={{ p: "5px", minWidth: 0, alignSelf: "center", flexShrink: 0 }}
    >
      <Add fontSize="small" />
    </Button>
  );
}
