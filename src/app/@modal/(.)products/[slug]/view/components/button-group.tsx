"use client";

import { useState } from "react";
import Button from "@mui/material/Button";

import useCart from "hooks/useCart";
import { useVariantPicker } from "contexts/VariantPickerContext";
import IconLink from "components/icon-link";

import Product from "models/Product.model";

export default function ButtonGroup({ product }: { product: Product }) {
  const [isLoading, setLoading] = useState(false);
  const { dispatch } = useCart();
  const { openPicker } = useVariantPicker();

  const handleAddToCart = () => {
    const hasVariants = !!(product.size?.length || product.colors?.length);
    if (hasVariants) {
      openPicker(product);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      dispatch({
        type: "CHANGE_CART_AMOUNT",
        payload: { ...product, qty: 1 }
      });
      setLoading(false);
    }, 500);
  };

  return (
    <>
      <Button
        disableElevation
        size="large"
        color="primary"
        variant="contained"
        loading={isLoading}
        onClick={handleAddToCart}
      >
        Add to Cart
      </Button>

      <IconLink title="View Product Details" url={`/products/${product.slug}`} sx={{ mt: 2 }} />
    </>
  );
}
