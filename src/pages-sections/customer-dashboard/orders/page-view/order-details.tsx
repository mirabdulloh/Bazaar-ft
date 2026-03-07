"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ErrorOutlineOutlined from "@mui/icons-material/ErrorOutlineOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import OrderSummery from "../order-summery";
import OrderProgress from "../order-progress";
import OrderedProducts from "../ordered-products";
import DashboardHeader from "../../dashboard-header";
import { useQuery } from "../../../../lib/hooks/useQuery";
import { useMutation } from "@apollo/client/react";
import { GET_ORDER } from "../../../../../apollo/user/query";
import { CANCEL_ORDER } from "../../../../../apollo/user/mutation";
import { sweetConfirmAlert, sweetTopSmallSuccessAlert, sweetMixinErrorAlert } from "lib/sweetAlert";
import { T } from "../../../../lib/types/common";

// =============================================================
type Props = { orderId: string };
// =============================================================

export function OrderDetailsPageView({ orderId }: Props) {
  const [cancelling, setCancelling] = useState(false);

  const { data, loading, refetch } = useQuery(GET_ORDER, {
    variables: { input: orderId },
    fetchPolicy: "cache-and-network",
    skip: !orderId,
  });

  const [cancelOrder] = useMutation(CANCEL_ORDER);

  const order: T | null = (data as T)?.getOrder ?? null;
  const isPending = order?.orderStatus === "PENDING";

  const handleCancel = async () => {
    const confirmed = await sweetConfirmAlert(
      "Cancel this order?",
      "This action cannot be undone. Your order will be cancelled.",
      "Yes, Cancel Order"
    );
    if (!confirmed) return;

    setCancelling(true);
    try {
      await cancelOrder({ variables: { orderId: String(order!._id) } });
      await sweetTopSmallSuccessAlert("Order cancelled successfully.");
      refetch();
    } catch (err: any) {
      sweetMixinErrorAlert(err.message ?? "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Box>
      <DashboardHeader href="/orders" title="Order Details" />

      {loading && !order ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Skeleton variant="rounded" height={160} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" height={140} sx={{ borderRadius: 2 }} />
        </Box>
      ) : !order ? (
        <Stack alignItems="center" justifyContent="center" py={8} gap={1.5}>
          <ErrorOutlineOutlined sx={{ fontSize: 56, color: "grey.300" }} />
          <Typography variant="body1" color="text.secondary">
            Order not found.
          </Typography>
        </Stack>
      ) : (
        <>
          <OrderProgress order={order} />
          <OrderedProducts order={order} />
          <OrderSummery order={order} />

          {/* Cancel button — only available while order is PENDING */}
          {isPending && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<CancelOutlined />}
                onClick={handleCancel}
                disabled={cancelling}
                loading={cancelling}
              >
                Cancel Order
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
