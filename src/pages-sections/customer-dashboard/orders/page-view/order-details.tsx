"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ErrorOutlineOutlined from "@mui/icons-material/ErrorOutlineOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutlineOutlined";
import StorefrontOutlined from "@mui/icons-material/StorefrontOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import OrderSummery from "../order-summery";
import OrderProgress from "../order-progress";
import OrderedProducts from "../ordered-products";
import DashboardHeader from "../../dashboard-header";
import { useQuery } from "../../../../lib/hooks/useQuery";
import { useMutation } from "@apollo/client/react";
import { GET_ORDER } from "../../../../../apollo/user/query";
import { CANCEL_ORDER, CONFIRM_ORDER_RECEIVED } from "../../../../../apollo/user/mutation";
import { currency } from "lib";
import { FlexBox } from "components/flex-box";
import { sweetConfirmAlert, sweetTopSmallSuccessAlert, sweetMixinErrorAlert } from "lib/sweetAlert";
import { T } from "../../../../lib/types/common";
import {
  DetailActionBar,
  DetailBrandAvatar,
  DetailHeroCard,
  DetailMetaCard,
  DetailMetaGrid,
  InlineMetaBadge,
} from "../styles";

// =============================================================
type Props = { orderId: string };
type ViewProps = Props & { embedded?: boolean; backHref?: string; title?: string };
// =============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function resolveImage(img?: string | null): string {
  if (!img) return "";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const normalized = img.startsWith("/") ? img : `/${img}`;
  return API_URL ? `${API_URL}${normalized}` : normalized;
}

function countOrderUnits(order: T): number {
  return (Array.isArray(order.orderItems) ? order.orderItems : []).reduce(
    (sum: number, item: T) => sum + Number(item?.itemQuantity ?? 0),
    0
  );
}

function formatOrderDate(value: unknown): string {
  return new Date(String(value ?? "")).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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
          <Skeleton variant="rounded" height={210} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" height={180} sx={{ borderRadius: 3 }} />
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
          <DetailHeroCard>
            <FlexBox alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
              <FlexBox alignItems="center" gap={1.75} flexWrap="wrap">
                {order.brand?.memberImage ? (
                  <DetailBrandAvatar src={resolveImage(order.brand.memberImage as string)} alt={String(order.brand.memberNick ?? "Brand")} />
                ) : (
                  <DetailBrandAvatar>
                    <StorefrontOutlined />
                  </DetailBrandAvatar>
                )}

                <Box>
                  <Typography variant="h5" fontWeight={800}>
                    {String(order.brand?.memberNick ?? "Brand")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                    Order #{String(order._id).slice(-8).toUpperCase()} • placed {formatOrderDate(order.createdAt)}
                  </Typography>

                  <FlexBox gap={0.75} flexWrap="wrap" sx={{ mt: 1.25 }}>
                    <Chip
                      label={String(order.orderStatus)}
                      size="small"
                      color={order.orderStatus === "DELIVERED" ? "success" : order.orderStatus === "CANCELLED" || order.orderStatus === "REFUNDED" ? "error" : "warning"}
                      sx={{ fontWeight: 700, fontSize: 10 }}
                    />
                    <Chip
                      label={`Payment ${String(order.orderPaymentStatus ?? "PENDING")}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: 10 }}
                    />
                    <Chip
                      label={`Delivery ${String(order.orderDeliveryStatus ?? "PREPARING")}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: 10 }}
                    />
                  </FlexBox>
                </Box>
              </FlexBox>

              <Box textAlign={{ xs: "left", md: "right" }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Final total
                </Typography>
                <Typography variant="h4" fontWeight={800} color="primary.main">
                  {currency(Number(order.orderFinalPrice ?? order.orderTotalPrice ?? 0))}
                </Typography>
              </Box>
            </FlexBox>

            <DetailMetaGrid>
              <DetailMetaCard>
                <Typography variant="caption" color="text.secondary">
                  Items
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.4 }}>
                  {countOrderUnits(order)}
                </Typography>
              </DetailMetaCard>

              <DetailMetaCard>
                <Typography variant="caption" color="text.secondary">
                  Payment Method
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.4 }}>
                  {String(order.orderPaymentMethod ?? "CARD").replaceAll("_", " ")}
                </Typography>
              </DetailMetaCard>

              <DetailMetaCard>
                <Typography variant="caption" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.4 }}>
                  {String(order.deliveryAddress?.addressCity ?? "Not set")}
                </Typography>
              </DetailMetaCard>

              <DetailMetaCard>
                <Typography variant="caption" color="text.secondary">
                  Tracking State
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.4 }}>
                  {String(order.orderDeliveryStatus ?? "PREPARING")}
                </Typography>
              </DetailMetaCard>
            </DetailMetaGrid>

            <Divider sx={{ my: 2 }} />

            <FlexBox gap={0.75} flexWrap="wrap">
              <InlineMetaBadge>
                <CalendarMonthOutlined sx={{ fontSize: 15 }} />
                {formatOrderDate(order.createdAt)}
              </InlineMetaBadge>
              <InlineMetaBadge>
                <PaymentsOutlined sx={{ fontSize: 15 }} />
                {String(order.orderPaymentStatus ?? "PENDING")}
              </InlineMetaBadge>
              <InlineMetaBadge>
                <Inventory2Outlined sx={{ fontSize: 15 }} />
                {countOrderUnits(order)} item(s)
              </InlineMetaBadge>
            </FlexBox>

            {(isPending || isShipped) && (
              <DetailActionBar>
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
              </DetailActionBar>
            )}
          </DetailHeroCard>

          <OrderProgress order={order} />
          <OrderedProducts order={order} />
          <OrderSummery order={order} />
        </>
      )}
    </Box>
  );
}
