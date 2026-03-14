"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
// MUI
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Radio from "@mui/material/Radio";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import CreditCardOutlined from "@mui/icons-material/CreditCardOutlined";
import AccountBalanceOutlined from "@mui/icons-material/AccountBalanceOutlined";
import PhoneAndroidOutlined from "@mui/icons-material/PhoneAndroidOutlined";
// APOLLO
import { useMutation } from "@apollo/client/react";
import { CREATE_ORDER } from "../../../apollo/user/mutation";
// CONTEXT
import useCart from "hooks/useCart";
// UTILS
import { sweetMixinErrorAlert } from "lib/sweetAlert";
import { T } from "../../lib/types/common";

export default function PaymentForm() {
  const router = useRouter();
  const { state, dispatch } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<string>("CREDIT_CARD");
  const [cardInfo, setCardInfo] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [placing, setPlacing] = useState(false);
  const [createOrder] = useMutation(CREATE_ORDER);

  const handlePlaceOrder = async () => {
    if (!state.selectedAddressId) {
      sweetMixinErrorAlert("Please go back to Details and select a delivery address.");
      return;
    }
    if (!state.cart.length) {
      sweetMixinErrorAlert("Your cart is empty.");
      return;
    }

    setPlacing(true);
    try {
      const { data } = await createOrder({
        variables: {
          input: {
            orderDeliveryAddressId: state.selectedAddressId,
            orderPaymentMethod: paymentMethod,
            couponCode: state.couponCode || undefined,
            items: state.cart.map((item) => ({
              productId: item.id,
              itemQuantity: item.qty,
              selectedSize: item.size || undefined,
              selectedColor: item.color || undefined,
            })),
          },
        },
      });

      const createdOrders: T[] = (data as T)?.createOrder?.orders ?? [];
      if (!createdOrders.length) {
        throw new Error("Order creation returned no orders.");
      }

      dispatch({ type: "CLEAR_CART" });
      if (createdOrders.length === 1) {
        router.push(`/profile?tab=orders&orderId=${createdOrders[0]._id as string}`);
      } else {
        router.push("/profile?tab=orders");
      }
    } catch (err: any) {
      sweetMixinErrorAlert(err.message ?? "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          mb: 4,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "grey.50",
          borderRadius: 3,
          padding: { sm: 3, xs: 2 }
        }}
      >
        <Typography variant="h5" sx={{ mb: 0.75 }}>
          Payment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Payment is entered here only. The final total, including coupon discount, is written into the order when you place it.
        </Typography>

        {!state.selectedAddressId && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            No delivery address selected yet. Go back to Details before placing the order.
          </Alert>
        )}

        <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
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

        <Divider sx={{ my: 3 }} />

        {(paymentMethod === "CREDIT_CARD" || paymentMethod === "DEBIT_CARD") && (
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Card Number"
              placeholder="0000 0000 0000 0000"
              value={cardInfo.number}
              inputProps={{ maxLength: 19 }}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
                setCardInfo((prev) => ({ ...prev, number: formatted }));
              }}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Expiry (MM/YY)"
                placeholder="MM/YY"
                value={cardInfo.expiry}
                inputProps={{ maxLength: 5 }}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2);
                  setCardInfo((prev) => ({ ...prev, expiry: val }));
                }}
              />

              <TextField
                fullWidth
                size="small"
                label="CVV"
                placeholder="123"
                type="password"
                value={cardInfo.cvv}
                inputProps={{ maxLength: 4 }}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setCardInfo((prev) => ({ ...prev, cvv: val }));
                }}
              />
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Cardholder Name"
              placeholder="Name on card"
              value={cardInfo.name}
              onChange={(e) => setCardInfo((prev) => ({ ...prev, name: e.target.value }))}
            />

            <Alert severity="info" sx={{ borderRadius: 2 }}>
              This payment step is static for now. Order placement still stores the selected payment method and final discounted total correctly.
            </Alert>
          </Stack>
        )}

        {paymentMethod === "BANK_TRANSFER" && (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Bank transfer is recorded as the selected payment method when you place the order.
          </Alert>
        )}

        {paymentMethod === "MOBILE_PAYMENT" && (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Mobile payment is recorded as the selected payment method when you place the order.
          </Alert>
        )}
      </Card>

      <Stack direction="row" spacing={3}>
        <Button
          fullWidth
          size="large"
          type="button"
          color="primary"
          href="/checkout"
          variant="outlined"
          LinkComponent={Link}
        >
          Back to Details
        </Button>

        <Button
          fullWidth
          size="large"
          type="button"
          color="primary"
          variant="contained"
          onClick={handlePlaceOrder}
          disabled={!state.cart.length || !state.selectedAddressId || placing}
        >
          Place Order
        </Button>
      </Stack>
    </>
  );
}
