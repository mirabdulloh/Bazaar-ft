"use client";

import { useMemo } from "react";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import FlexBetween from "components/flex-box/flex-between";
import useCart from "hooks/useCart";
import { useQuery } from "../../lib/hooks/useQuery";
import { CHECK_COUPON } from "../../../apollo/user/query";
import { getCartSubtotal } from "contexts/CartContext";
import { calculateEstimatedCouponDiscount, getCartBrandsNote } from "lib/cart";
import { currency } from "lib";
import { T } from "../../lib/types/common";

export default function PaymentSummary() {
  const { state } = useCart();
  const { data: couponData } = useQuery(CHECK_COUPON, {
    variables: { couponCode: state.couponCode },
    skip: !state.couponCode,
    fetchPolicy: "cache-and-network",
  });

  const appliedCoupon = ((couponData as T)?.checkCoupon ?? null) as T | null;

  const { subtotal, discount, total } = useMemo(() => {
    const subtotal = getCartSubtotal(state.cart);
    const discount = calculateEstimatedCouponDiscount(appliedCoupon, state.cart);
    return {
      subtotal,
      discount,
      total: Math.max(subtotal - discount, 0),
    };
  }, [appliedCoupon, state.cart]);

  const couponNote = useMemo(
    () => getCartBrandsNote(state.cart, appliedCoupon as { couponType?: string | null } | null),
    [appliedCoupon, state.cart]
  );

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "grey.50",
        borderRadius: 3,
        padding: { sm: 3, xs: 2 },
      }}
    >
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Payment Summary
      </Typography>

      <ListItem title="Subtotal" amount={subtotal} />
      <ListItem title="Shipping" emptyLabel="Free" />
      <ListItem title="Discount" amount={discount} />

      {state.couponCode && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          Coupon: {state.couponCode}
        </Typography>
      )}

      {couponNote && (
        <Alert severity="info" sx={{ mt: 1.5, borderRadius: 2 }}>
          {couponNote}
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="h4" textAlign="right">
        {currency(total)}
      </Typography>
    </Card>
  );
}

function ListItem({ title, amount = 0, emptyLabel = "-" }: { title: string; amount?: number; emptyLabel?: string }) {
  return (
    <FlexBetween mb={1}>
      <Typography variant="body2" color="text.secondary">
        {title}:
      </Typography>
      <Typography variant="body1" fontWeight={600}>
        {amount ? currency(amount) : emptyLabel}
      </Typography>
    </FlexBetween>
  );
}
