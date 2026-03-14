"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// MUI
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Radio from "@mui/material/Radio";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import AddLocationAltOutlined from "@mui/icons-material/AddLocationAltOutlined";
// APOLLO
import { useReactiveVar } from "@apollo/client/react";
import { userVar } from "../../../../apollo/store";
import { useQuery } from "../../../lib/hooks/useQuery";
import { GET_ADDRESSES } from "../../../../apollo/user/query";
// CONTEXT
import useCart from "hooks/useCart";
// UTILS
import { sweetMixinErrorAlert } from "lib/sweetAlert";
import { T } from "../../../lib/types/common";

export default function CheckoutForm() {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const { state, dispatch } = useCart();

  const { data: addressData, loading: addressLoading } = useQuery(GET_ADDRESSES, {
    skip: !user?._id,
    fetchPolicy: "cache-and-network",
  });

  const addresses: T[] = (addressData as T)?.getAddresses ?? [];

  useEffect(() => {
    if (!state.selectedAddressId && addresses.length) {
      dispatch({ type: "SET_CHECKOUT_ADDRESS", addressId: String(addresses[0]._id ?? "") });
    }
  }, [addresses, dispatch, state.selectedAddressId]);

  const handleContinue = () => {
    if (!state.selectedAddressId) {
      sweetMixinErrorAlert("Please select a delivery address.");
      return;
    }

    router.push("/payment");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "grey.200", borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 0.75 }}>
          Delivery Details
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select the address for this order. Coupon usage is shown in the summary on the right. Payment happens in the next step.
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
              href="/profile"
              variant="outlined"
              size="small"
              sx={{ textTransform: "none" }}
            >
              Go to Profile → Add Address
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {addresses.map((addr: T) => {
              const addressId = String(addr._id ?? "");
              const isSelected = state.selectedAddressId === addressId;

              return (
                <Box
                  key={addressId}
                  onClick={() => dispatch({ type: "SET_CHECKOUT_ADDRESS", addressId })}
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
                  <Radio checked={isSelected} size="small" sx={{ mt: -0.5, p: 0.5 }} color="primary" />
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {addr.addressName as string}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {addr.addressLine1 as string}
                      {addr.addressLine2 ? `, ${addr.addressLine2 as string}` : ""}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {addr.addressCity as string}, {addr.addressZipCode as string}, {addr.addressCountry as string}
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
              href="/profile"
              variant="text"
              size="small"
              startIcon={<AddLocationAltOutlined />}
              sx={{ alignSelf: "flex-start", textTransform: "none", mt: 0.5 }}
            >
              Manage addresses in Profile
            </Button>
          </Box>
        )}
      </Card>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button size="large" fullWidth href="/cart" component={Link} variant="outlined" color="primary">
          Back to Cart
        </Button>

        <Button size="large" fullWidth variant="contained" color="primary" onClick={handleContinue}>
          Continue to Payment
        </Button>
      </Box>
    </Box>
  );
}
