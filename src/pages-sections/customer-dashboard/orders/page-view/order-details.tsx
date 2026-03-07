"use client";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ErrorOutlineOutlined from "@mui/icons-material/ErrorOutlineOutlined";
import OrderSummery from "../order-summery";
import OrderProgress from "../order-progress";
import OrderedProducts from "../ordered-products";
import DashboardHeader from "../../dashboard-header";
import { useQuery } from "../../../../lib/hooks/useQuery";
import { GET_ORDER } from "../../../../../apollo/user/query";
import { T } from "../../../../lib/types/common";

// =============================================================
type Props = { orderId: string };
// =============================================================

export function OrderDetailsPageView({ orderId }: Props) {
  const { data, loading } = useQuery(GET_ORDER, {
    variables: { input: orderId },
    fetchPolicy: "cache-and-network",
    skip: !orderId,
  });

  const order: T | null = (data as T)?.getOrder ?? null;

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
        </>
      )}
    </Box>
  );
}
