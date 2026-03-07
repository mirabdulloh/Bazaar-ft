"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// MUI
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Radio from "@mui/material/Radio";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import CreditCardOutlined from "@mui/icons-material/CreditCardOutlined";
import AccountBalanceOutlined from "@mui/icons-material/AccountBalanceOutlined";
import PhoneAndroidOutlined from "@mui/icons-material/PhoneAndroidOutlined";
import AddLocationAltOutlined from "@mui/icons-material/AddLocationAltOutlined";
// APOLLO
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { userVar } from "../../../../apollo/store";
import { useQuery } from "../../../lib/hooks/useQuery";
import { GET_ADDRESSES } from "../../../../apollo/user/query";
import { CREATE_ORDER } from "../../../../apollo/user/mutation";
// CONTEXT
import useCart from "hooks/useCart";
// UTILS
import { sweetMixinErrorAlert } from "lib/sweetAlert";
import { T } from "../../../lib/types/common";

export default function CheckoutForm() {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const { state, dispatch } = useCart();
  const cart = state.cart;

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("CREDIT_CARD");
  const [placing, setPlacing] = useState(false);

  const { data: addressData, loading: addressLoading } = useQuery(GET_ADDRESSES, {
    skip: !user?._id,
    fetchPolicy: "cache-and-network",
  });

  const [createOrder] = useMutation(CREATE_ORDER);

  const addresses: T[] = (addressData as T)?.getAddresses ?? [];

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      sweetMixinErrorAlert("Please select a delivery address.");
      return;
    }
    if (!cart.length) {
      sweetMixinErrorAlert("Your cart is empty.");
      return;
    }

    setPlacing(true);
    try {
      const { data } = await createOrder({
        variables: {
          input: {
            orderDeliveryAddressId: selectedAddressId,
            orderPaymentMethod: paymentMethod,
            items: cart.map((item) => ({
              productId: item.id,
              itemQuantity: item.qty,
            })),
          },
        },
      });
      dispatch({ type: "CLEAR_CART" });
      router.push(`/orders/${data.createOrder._id}`);
    } catch (err: any) {
      sweetMixinErrorAlert(err.message ?? "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* ── Delivery Address ── */}
      <Card elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "grey.200", borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Delivery Address
        </Typography>

        {addressLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {[1, 2].map((i) => (
              <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        ) : addresses.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
              gap: 1.5,
              border: "1px dashed",
              borderColor: "grey.300",
              borderRadius: 2,
            }}
          >
            <AddLocationAltOutlined sx={{ fontSize: 40, color: "grey.400" }} />
            <Typography variant="body1" color="text.secondary">
              No saved addresses.
            </Typography>
            <Button
              component={Link}
              href="/address"
              variant="outlined"
              size="small"
              sx={{ textTransform: "none" }}
            >
              Add an address
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {addresses.map((addr: T) => {
              const isSelected = selectedAddressId === String(addr._id);
              return (
                <Box
                  key={String(addr._id)}
                  onClick={() => setSelectedAddressId(String(addr._id))}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor: isSelected ? "primary.main" : "grey.200",
                    bgcolor: isSelected ? "primary.50" : "transparent",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                  }}
                >
                  <Radio
                    checked={isSelected}
                    size="small"
                    sx={{ mt: -0.5, p: 0.5 }}
                    color="primary"
                  />
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {addr.addressName as string}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {addr.addressLine1 as string}
                      {addr.addressLine2 ? `, ${addr.addressLine2 as string}` : ""}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {addr.addressCity as string}, {addr.addressZipCode as string},{" "}
                      {addr.addressCountry as string}
                    </Typography>
                    {addr.addressPhone && (
                      <Typography variant="caption" color="text.disabled">
                        {addr.addressPhone as string}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}

            <Button
              component={Link}
              href="/address"
              variant="text"
              size="small"
              startIcon={<AddLocationAltOutlined />}
              sx={{ alignSelf: "flex-start", textTransform: "none", mt: 0.5 }}
            >
              Add another address
            </Button>
          </Box>
        )}
      </Card>

      {/* ── Payment Method ── */}
      <Card elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "grey.200", borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Payment Method
        </Typography>

        <RadioGroup
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {(
              [
                { value: "CREDIT_CARD", label: "Credit Card", Icon: CreditCardOutlined },
                { value: "DEBIT_CARD", label: "Debit Card", Icon: CreditCardOutlined },
                { value: "BANK_TRANSFER", label: "Bank Transfer", Icon: AccountBalanceOutlined },
                { value: "MOBILE_PAYMENT", label: "Mobile Payment", Icon: PhoneAndroidOutlined },
              ] as { value: string; label: string; Icon: React.ElementType }[]
            ).map(({ value, label, Icon }) => {
              const isSelected = paymentMethod === value;
              return (
                <Box
                  key={value}
                  onClick={() => setPaymentMethod(value)}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor: isSelected ? "primary.main" : "grey.200",
                    bgcolor: isSelected ? "primary.50" : "transparent",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <FormControlLabel
                    value={value}
                    control={<Radio size="small" color="primary" />}
                    label=""
                    sx={{ m: 0, p: 0 }}
                  />
                  <Icon sx={{ color: isSelected ? "primary.main" : "grey.500" }} />
                  <Typography variant="body2" fontWeight={isSelected ? 700 : 500}>
                    {label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </RadioGroup>
      </Card>

      <Divider />

      {/* ── Actions ── */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          size="large"
          fullWidth
          href="/cart"
          component={Link}
          variant="outlined"
          color="primary"
        >
          Back to Cart
        </Button>

        <Button
          size="large"
          fullWidth
          variant="contained"
          color="primary"
          onClick={handlePlaceOrder}
          loading={placing}
          disabled={!cart.length || placing}
        >
          Place Order
        </Button>
      </Box>
    </Box>
  );
}
