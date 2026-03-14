"use client";

import { useEffect, useMemo, useState } from "react";
// MUI
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
// APOLLO
import { useApolloClient } from "@apollo/client/react";
import { CHECK_COUPON, GET_MY_COUPON_CLAIMS } from "../../../../apollo/user/query";
import { useQuery } from "../../../lib/hooks/useQuery";
// GLOBAL CUSTOM COMPONENTS
import FlexBetween from "components/flex-box/flex-between";
// HOOKS / UTILS
import useCart from "hooks/useCart";
import { getCartItemKey, getCartSubtotal } from "contexts/CartContext";
import { calculateEstimatedCouponDiscount, getCartBrandsNote } from "lib/cart";
import { currency } from "lib";
import { T } from "../../../lib/types/common";
import { getJwtToken } from "../../../lib/auth";

const CARD_STYLES = {
  padding: 3,
  border: "1px solid",
  borderColor: "grey.100",
  borderRadius: 3,
} as const;

export default function CheckoutSummary() {
  const client = useApolloClient();
  const { state, dispatch } = useCart();
  const [couponInput, setCouponInput] = useState(state.couponCode);
  const [validatedCoupon, setValidatedCoupon] = useState<T | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const hasSession = Boolean(getJwtToken());

  const { data: couponData, loading: couponLoading } = useQuery(CHECK_COUPON, {
    variables: { couponCode: state.couponCode },
    skip: !state.couponCode,
    fetchPolicy: "cache-and-network",
  });

  const { data: claimData, loading: claimsLoading } = useQuery(GET_MY_COUPON_CLAIMS, {
    variables: {
      input: {
        page: 1,
        limit: 20,
        sort: "claimedAt",
        direction: "DESC",
      },
    },
    skip: !hasSession,
    fetchPolicy: "cache-and-network",
  });

  const queriedCoupon = ((couponData as T)?.checkCoupon ?? null) as T | null;
  const appliedCoupon = (validatedCoupon ?? queriedCoupon) as T | null;
  const claimedCoupons = (((claimData as T)?.getMyCouponClaims?.list ?? []) as T[]).filter(
    (claim) => claim?.claimStatus === "CLAIMED" && claim?.coupon
  );

  useEffect(() => {
    if (state.couponCode) {
      setCouponInput(state.couponCode);
    } else {
      setValidatedCoupon(null);
    }
  }, [state.couponCode]);

  useEffect(() => {
    if (queriedCoupon) setValidatedCoupon(queriedCoupon);
  }, [queriedCoupon]);

  const { subtotal, total, discount } = useMemo(() => {
    if (!state?.cart?.length) {
      return { subtotal: 0, total: 0, discount: 0 };
    }

    const subtotal = getCartSubtotal(state.cart);
    const discount = calculateEstimatedCouponDiscount(appliedCoupon, state.cart);
    const total = Math.max(subtotal - discount, 0);
    return { subtotal, total, discount };
  }, [appliedCoupon, state.cart]);

  const couponNote = useMemo(
    () => getCartBrandsNote(state.cart, appliedCoupon as { couponType?: string | null } | null),
    [appliedCoupon, state.cart]
  );

  const applyCouponCode = async (rawCode: string, successText?: string) => {
    const nextCode = rawCode.trim().toUpperCase();
    if (!nextCode) {
      setCouponMessage({ type: "error", text: "Enter a coupon code first." });
      return;
    }

    setApplyingCoupon(true);
    try {
      const result = await client.query({
        query: CHECK_COUPON,
        variables: { couponCode: nextCode },
        fetchPolicy: "network-only",
      });
      setValidatedCoupon(((result.data as T)?.checkCoupon ?? null) as T | null);

      dispatch({ type: "SET_COUPON_CODE", couponCode: nextCode });
      setCouponInput(nextCode);
      setCouponMessage({ type: "success", text: successText ?? `Coupon ${nextCode} applied.` });
    } catch (err: any) {
      setCouponMessage({ type: "error", text: err?.message || "Invalid or expired coupon code." });
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleApplyCoupon = async () => {
    await applyCouponCode(couponInput);
  };

  const handleRemoveCoupon = () => {
    setValidatedCoupon(null);
    dispatch({ type: "SET_COUPON_CODE", couponCode: "" });
    setCouponInput("");
    setCouponMessage(null);
  };

  const handleApplyClaimedCoupon = async (couponCode: string) => {
    await applyCouponCode(couponCode, `Coupon ${couponCode.trim().toUpperCase()} selected from your claimed coupons.`);
  };

  if (!state || !state.cart.length) return null;

  return (
    <Card elevation={0} sx={CARD_STYLES}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Order Details
      </Typography>

      {state.cart.map((item) => (
        <FlexBetween mb={1.5} key={getCartItemKey(item)} gap={2}>
          <Typography variant="body2" sx={{ pr: 1 }}>
            <strong>{item.qty}</strong> x {item.title}
          </Typography>

          <Typography variant="body2" fontWeight={600}>
            {currency(item.price * item.qty)}
          </Typography>
        </FlexBetween>
      ))}

      <Divider sx={{ my: 2.5 }} />

      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        Coupon Code
      </Typography>

      {hasSession && (
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            My Claimed Coupons
          </Typography>

          {claimsLoading ? (
            <Typography variant="caption" color="text.disabled">
              Loading your coupons...
            </Typography>
          ) : claimedCoupons.length ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {claimedCoupons.map((claim: T) => {
                const coupon = claim.coupon as T;
                const code = String(coupon?.couponCode ?? "");
                const isApplied = state.couponCode === code;
                const label =
                  coupon?.discountType === "PERCENTAGE"
                    ? `${code} · ${coupon.discountValue ?? 0}%`
                    : `${code} · ${currency(Number(coupon?.discountValue ?? 0))}`;

                return (
                  <Button
                    key={String(claim._id)}
                    size="small"
                    variant={isApplied ? "contained" : "outlined"}
                    color={isApplied ? "primary" : "inherit"}
                    onClick={() => void handleApplyClaimedCoupon(code)}
                    disabled={applyingCoupon}
                    sx={{ textTransform: "none" }}
                  >
                    {label}
                  </Button>
                );
              })}
            </Stack>
          ) : (
            <Typography variant="caption" color="text.disabled">
              No claimed coupons yet. Claim them in My Profile.
            </Typography>
          )}
        </Box>
      )}

      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          size="small"
          label="Coupon code"
          placeholder="Enter coupon code"
          value={couponInput}
          onChange={(event) => {
            setCouponInput(event.target.value.toUpperCase());
            if (couponMessage) setCouponMessage(null);
          }}
        />

        <Button variant="contained" onClick={handleApplyCoupon} disabled={!couponInput.trim() || applyingCoupon}>
          Apply
        </Button>
      </Stack>

      {state.couponCode && (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 1.5 }}>
          <Chip
            color="primary"
            variant="outlined"
            label={couponLoading ? "Checking coupon..." : `Applied: ${state.couponCode}`}
          />
          <Button size="small" color="inherit" onClick={handleRemoveCoupon}>
            Remove
          </Button>
        </Stack>
      )}

      {appliedCoupon && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          {appliedCoupon.discountType === "PERCENTAGE"
            ? `${appliedCoupon.discountValue ?? 0}% off`
            : `${currency(Number(appliedCoupon.discountValue ?? 0))} off`}
          {" · "}
          {appliedCoupon.couponType === "BRAND" ? "Brand coupon" : "Platform coupon"}
        </Typography>
      )}

      {couponNote && (
        <Alert severity="info" sx={{ mt: 1.5, borderRadius: 2 }}>
          {couponNote}
        </Alert>
      )}

      {couponMessage && (
        <Alert severity={couponMessage.type} sx={{ mt: 1.5, borderRadius: 2 }}>
          {couponMessage.text}
        </Alert>
      )}

      <Divider sx={{ my: 2.5 }} />

      <ListItem title="Subtotal" value={subtotal} />
      <ListItem title="Shipping" value={0} emptyLabel="Free" />
      <ListItem title="Discount" value={discount} mb={2} />

      <Divider sx={{ mb: 1.5 }} />

      <ListItem title="Total" value={total} labelVariant="subtitle1" valueVariant="h6" />
    </Card>
  );
}

function ListItem({
  title,
  value = 0,
  mb = 0.5,
  emptyLabel = "-",
  labelVariant = "body2",
  valueVariant = "body1",
}: {
  title: string;
  value?: number;
  mb?: number;
  emptyLabel?: string;
  labelVariant?: "body2" | "subtitle1";
  valueVariant?: "body1" | "h6";
}) {
  return (
    <FlexBetween mb={mb}>
      <Typography variant={labelVariant} color="text.secondary">
        {title}:
      </Typography>

      <Typography variant={valueVariant} fontWeight={700}>
        {value ? currency(value) : emptyLabel}
      </Typography>
    </FlexBetween>
  );
}
