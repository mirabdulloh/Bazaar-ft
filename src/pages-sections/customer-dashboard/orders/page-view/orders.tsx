"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Packages from "icons/Packages";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
import OrderRow from "../order-row";
import DashboardHeader from "../../dashboard-header";
import { StyledPagination } from "../../pagination";
import { useQuery } from "../../../../lib/hooks/useQuery";
import { GET_MY_ORDERS } from "../../../../../apollo/user/query";
import { T } from "../../../../lib/types/common";

const PAGE_SIZE = 8;

export function OrdersPageView() {
  const [page, setPage] = useState(1);

  const { data, loading } = useQuery(GET_MY_ORDERS, {
    variables: { input: { page, limit: PAGE_SIZE } },
    fetchPolicy: "cache-and-network",
  });

  const orders: T[] = (data as T)?.getMyOrders?.orders ?? [];
  const total: number = (data as T)?.getMyOrders?.metaData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Box>
      <DashboardHeader Icon={Packages} title="My Orders" />

      {loading && orders.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      ) : orders.length === 0 ? (
        <Stack alignItems="center" justifyContent="center" py={8} gap={1.5}>
          <ShoppingBagOutlined sx={{ fontSize: 56, color: "grey.300" }} />
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            No orders yet
          </Typography>
          <Typography variant="body2" color="text.disabled">
            When you place an order, it will appear here.
          </Typography>
        </Stack>
      ) : (
        <>
          {orders.map((order: T) => (
            <OrderRow order={order} key={String(order._id)} />
          ))}

          <StyledPagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
          />
        </>
      )}
    </Box>
  );
}
