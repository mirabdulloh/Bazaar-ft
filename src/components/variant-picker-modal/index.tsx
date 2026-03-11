"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// MUI
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
// CONTEXTS
import { useReactiveVar } from "@apollo/client/react";
import { userVar } from "../../../apollo/store";
import { useVariantPicker } from "contexts/VariantPickerContext";
import useCart from "hooks/useCart";
import { currency } from "lib";
import { toCssColor } from "lib/colorUtils";

/** Normalize backend field which may be a single string or an array of strings */
function toArray(val: string | string[] | undefined | null): string[] {
  if (!val) return [];
  const raw = Array.isArray(val) ? val : [val];
  const split = raw.flatMap((item) => String(item).split(/[,/|]/));
  return Array.from(new Set(split.map((s) => s.trim()).filter(Boolean)));
}

export default function VariantPickerModal() {
  const router = useRouter();
  const { state, closePicker } = useVariantPicker();
  const { dispatch } = useCart();
  const user = useReactiveVar(userVar);
  const { open, product } = state;

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Reset selections whenever modal opens for a new product
  useEffect(() => {
    if (open) {
      setSelectedSize("");
      setSelectedColor("");
      setError("");
    }
  }, [open, product?.id]);

  if (!product) return null;

  const sizeOptions  = toArray(product.size as unknown as string | string[]);
  const colorOptions = toArray(product.colors as unknown as string | string[]);
  const hasSizes  = sizeOptions.length > 0;
  const hasColors = colorOptions.length > 0;

  const handleConfirm = () => {
    if (!user?._id) {
      closePicker();
      router.push("/login");
      return;
    }
    if (hasSizes && !selectedSize) {
      setError("Please select a size");
      return;
    }
    if (hasColors && !selectedColor) {
      setError("Please select a color");
      return;
    }

    dispatch({
      type: "CHANGE_CART_AMOUNT",
      payload: {
        id: product.id,
        slug: product.slug,
        price: product.price,
        title: product.title,
        thumbnail: product.thumbnail,
        qty: 1,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      },
    });

    closePicker();
    router.push("/mini-cart", { scroll: false });
  };

  return (
    <Dialog
      open={open}
      onClose={closePicker}
      maxWidth="xs"
      fullWidth
      sx={{ zIndex: 1600 }}
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0 } } }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, pt: 2 }}>
        <Typography variant="h6" fontWeight={700}>Select Options</Typography>
        <IconButton size="small" onClick={closePicker}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 1.5, pb: 3, px: 2.5 }}>
        {/* Product info row */}
        <Box sx={{ display: "flex", gap: 2, mb: 2.5 }}>
          <Box sx={{ position: "relative", width: 72, height: 72, flexShrink: 0, borderRadius: 2, overflow: "hidden", bgcolor: "grey.100" }}>
            <Image src={product.thumbnail} alt={product.title} fill style={{ objectFit: "cover" }} />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3, mb: 0.5 }}>
              {product.title}
            </Typography>
            <Typography variant="body1" color="primary" fontWeight={700}>
              {currency(product.price)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Size selection */}
        {hasSizes && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Size{selectedSize ? `: ${selectedSize}` : ""}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {sizeOptions.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  size="small"
                  variant={selectedSize === s ? "filled" : "outlined"}
                  color={selectedSize === s ? "primary" : "default"}
                  onClick={() => { setSelectedSize(selectedSize === s ? "" : s); setError(""); }}
                  sx={{ cursor: "pointer", fontWeight: 500 }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Color selection */}
        {hasColors && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Color{selectedColor ? `: ${selectedColor}` : ""}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {colorOptions.map((c) => (
                <Box
                  key={c}
                  onClick={() => { setSelectedColor(selectedColor === c ? "" : c); setError(""); }}
                  sx={{
                    display: "flex", alignItems: "center", gap: 0.75,
                    px: 1.25, py: 0.5,
                    border: selectedColor === c ? "2px solid" : "1px solid",
                    borderColor: selectedColor === c ? "primary.main" : "divider",
                    borderRadius: 2,
                    cursor: "pointer",
                    bgcolor: selectedColor === c ? "primary.50" : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <Box sx={{
                    width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                    bgcolor: toCssColor(c),
                    border: "1px solid rgba(0,0,0,0.2)"
                  }} />
                  <Typography variant="caption" fontWeight={selectedColor === c ? 700 : 500}>
                    {c}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Validation error */}
        {error && (
          <Typography variant="caption" color="error" sx={{ display: "block", mb: 1.5 }}>
            {error}
          </Typography>
        )}

        {/* Confirm button */}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          onClick={handleConfirm}
          sx={{ mt: 1, borderRadius: 2, fontWeight: 700, textTransform: "none" }}
        >
          Add to Cart
        </Button>
      </DialogContent>
    </Dialog>
  );
}
