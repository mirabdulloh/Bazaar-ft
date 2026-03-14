"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ErrorOutlineOutlined from "@mui/icons-material/ErrorOutlineOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutlineOutlined";
import OrderSummery from "../order-summery";
import OrderProgress from "../order-progress";
import OrderedProducts from "../ordered-products";
import DashboardHeader from "../../dashboard-header";
import { useQuery } from "../../../../lib/hooks/useQuery";
import { useMutation } from "@apollo/client/react";
import { GET_ORDER } from "../../../../../apollo/user/query";
import { CANCEL_ORDER, CONFIRM_ORDER_RECEIVED } from "../../../../../apollo/user/mutation";
import { sweetConfirmAlert, sweetTopSmallSuccessAlert, sweetMixinErrorAlert } from "lib/sweetAlert";
import { T } from "../../../../lib/types/common";

// =============================================================
type Props = { orderId: string };
type ViewProps = Props & { embedded?: boolean; backHref?: string; title?: string };
// =============================================================

export function OrderDetailsPageView({
  orderId,
  embedded = false,
  backHref = "/orders",
  title = "Order Details"
}: ViewProps) {
  const [cancelling, setCancelling] = useState(false);
  const [confirmingReceived, setConfirmingReceived] = useState(false);

  const { data, loading, refetch } = useQuery(GET_ORDER, {
    variables: { input: orderId },
    fetchPolicy: "cache-and-network",
    skip: !orderId,
  });

  const [cancelOrder] = useMutation(CANCEL_ORDER);
  const [confirmOrderReceived] = useMutation(CONFIRM_ORDER_RECEIVED);

  const order: T | null = (data as T)?.getOrder ?? null;
  const isPending = order?.orderStatus === "PENDING";
  const isShipped = order?.orderStatus === "SHIPPED";

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

  const handleConfirmReceived = async () => {
    const confirmed = await sweetConfirmAlert(
      "Mark order as received?",
      "This will complete the order and unlock review actions.",
      "Yes, I Received It"
    );
    if (!confirmed) return;

    setConfirmingReceived(true);
    try {
      await confirmOrderReceived({ variables: { orderId: String(order!._id) } });
      await sweetTopSmallSuccessAlert("Order marked as delivered.");
      refetch();
    } catch (err: any) {
      sweetMixinErrorAlert(err.message ?? "Failed to confirm delivery.");
    } finally {
      setConfirmingReceived(false);
    }
  };

  return (
    <Box>
      {!embedded && <DashboardHeader href={backHref} title={title} />}

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
          {(isPending || isShipped) && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1, flexWrap: "wrap" }}>
              {isShipped && (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<CheckCircleOutlineOutlined />}
                  onClick={handleConfirmReceived}
                  disabled={confirmingReceived}
                  loading={confirmingReceived}
                >
                  Mark as Received
                </Button>
              )}
              {isPending && (
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
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
