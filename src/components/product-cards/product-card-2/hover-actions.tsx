"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import useCart from "hooks/useCart";
import Product from "models/Product.model";

// ========================================================
type Props = { product: Product };
// ========================================================

export default function HoverActions({ product }: Props) {
  const { id, slug, title, price, thumbnail } = product;
  const { dispatch } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent Link navigation
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
