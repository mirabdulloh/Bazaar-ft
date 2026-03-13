"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";

import useCart from "hooks/useCart";
import { useVariantPicker } from "contexts/VariantPickerContext";
import IconLink from "components/icon-link";
import { useReactiveVar } from "@apollo/client/react";
import { userVar } from "../../../../../../../apollo/store";

import Product from "models/Product.model";

export default function ButtonGroup({ product }: { product: Product }) {
  const [isLoading, setLoading] = useState(false);
  const { dispatch } = useCart();
  const { openPicker } = useVariantPicker();
  const router = useRouter();
  const user = useReactiveVar(userVar);

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
        payload: { id: product.id, slug: product.slug, price: product.price, title: product.title, thumbnail: product.thumbnail, qty: 1 }
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
