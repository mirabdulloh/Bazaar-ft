"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { useReactiveVar } from "@apollo/client/react";
import { userVar } from "../../../../apollo/store";
import useCart from "hooks/useCart";
import { useVariantPicker } from "contexts/VariantPickerContext";
import Product from "models/Product.model";

// ========================================================
type Props = { product: Product };
// ========================================================

export default function HoverActions({ product }: Props) {
  const { id, slug, title, price, thumbnail } = product;
  const { dispatch } = useCart();
  const { openPicker } = useVariantPicker();
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent Link navigation

    if (!user?._id) {
      router.push("/login");
      return;
    }

    // If the product has size or color variants, show the picker modal
    if (product.size?.length || product.colors?.length) {
      openPicker(product);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      dispatch({
        type: "CHANGE_CART_AMOUNT",
        payload: { id, slug, price, title, thumbnail, qty: 1 },
      });
      router.push("/mini-cart", { scroll: false });
      setLoading(false);
    }, 400);
  };

  return (
    <Button
      fullWidth
      variant="contained"
      color="primary"
      loading={loading}
      onClick={handleAddToCart}
      startIcon={<ShoppingCartOutlinedIcon fontSize="small" />}
      sx={{
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 600,
        fontSize: 13,
        py: 1,
        backdropFilter: "blur(4px)",
      }}
    >
      Add to Cart
    </Button>
  );
}
