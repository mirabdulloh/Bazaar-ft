"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
// GLOBAL CUSTOM HOOK
import useCart from "hooks/useCart";
// CUSTOM DATA MODEL
import Product from "models/Product.model";
// UTILS
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from "lib/sweetAlert";

// ================================================================
type Props = {
  product: Product;
  qty: number;
  selectedSize?: string;
  selectedColor?: string;
};
// ================================================================

export default function AddToCart({ product, qty, selectedSize, selectedColor }: Props) {
  const { id, price, title, slug, thumbnail, size, colors } = product;

  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const { dispatch } = useCart();

  const handleAddToCart = async () => {
    // Validate selections
    if (size && size.length > 0 && !selectedSize) {
      await sweetMixinErrorAlert("Please select a size");
      return;
    }
    if (colors && colors.length > 0 && !selectedColor) {
      await sweetMixinErrorAlert("Please select a color");
      return;
    }

    setLoading(true);

    setTimeout(async () => {
      dispatch({
        type: "CHANGE_CART_AMOUNT",
        payload: {
          id,
          slug,
          price,
          title,
          thumbnail,
          qty,
          size: selectedSize || undefined,
          color: selectedColor || undefined,
        }
      });

      setLoading(false);
      await sweetTopSmallSuccessAlert("Added to cart!");
      router.push("/mini-cart", { scroll: false });
    }, 400);
  };

  return (
    <Button
      color="primary"
      variant="contained"
      loading={isLoading}
      onClick={handleAddToCart}
      sx={{ mb: 4.5, px: "1.75rem", height: 40 }}
    >
      Add to Cart
    </Button>
  );
}
