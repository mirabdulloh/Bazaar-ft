"use client";

import Link from "next/link";
import { useMemo } from "react";
// MUI
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
// HOOKS / UTILS
import useCart from "hooks/useCart";
import { getCartQuantity, getCartSubtotal } from "contexts/CartContext";
import { currency } from "lib";

export default function CheckoutForm() {
  const { state } = useCart();

  const pricing = useMemo(() => {
    const subtotal = getCartSubtotal(state.cart);
    const quantity = getCartQuantity(state.cart);

    return {
      quantity,
      subtotal,
      total: subtotal,
    };
  }, [state.cart]);

  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        position: { md: "sticky" },
        top: { md: 24 },
      }}
    >
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.75 }}>
        Cart Summary
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Review your cart items here. Delivery details and coupon usage continue in the next step.
      </Typography>

      <Stack spacing={1.25}>
        <SummaryRow label="Items" value={`${pricing.quantity}`} />
        <SummaryRow label="Subtotal" value={currency(pricing.subtotal)} />
        <SummaryRow label="Shipping" value="Added only if needed later" />
      </Stack>

      <Divider sx={{ my: 2.5 }} />

      <SummaryRow
        label="Current Total"
        value={currency(pricing.total)}
        labelVariant="subtitle1"
        valueVariant="h6"
      />

      <Box sx={{ mt: 1.25 }}>
        <Typography variant="caption" color="text.secondary">
          We do not apply tax here. Coupon discount is applied in the Details step and the final discounted total is written to the order in the database.
        </Typography>
      </Box>

      <Stack spacing={1.25} sx={{ mt: 3 }}>
        <Button component={Link} href="/checkout" variant="contained" size="large" fullWidth>
          Continue to Details
        </Button>

        <Button component={Link} href="/products/search" variant="outlined" size="large" fullWidth>
          Continue Shopping
        </Button>
      </Stack>
    </Card>
  );
}

function SummaryRow({
  label,
  value,
  labelVariant = "body2",
  valueVariant = "body1",
}: {
  label: string;
  value: string;
  labelVariant?: "body2" | "subtitle1";
  valueVariant?: "body1" | "h6";
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
      <Typography variant={labelVariant} color="text.secondary">
        {label}
      </Typography>
      <Typography variant={valueVariant} fontWeight={700}>
        {value}
      </Typography>
    </Box>
  );
}
