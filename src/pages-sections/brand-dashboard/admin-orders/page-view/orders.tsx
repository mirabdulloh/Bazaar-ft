"use client";

import { useMemo, useState } from "react";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OverlayScrollbar from "components/overlay-scrollbar";
import { TablePagination } from "components/data-table";
import FlexBox from "components/flex-box/flex-box";
import { StatusWrapper } from "../../styles";
import PageWrapper from "../../page-wrapper";
import { useQuery } from "lib/hooks/useQuery";
import { GET_ALL_ORDERS_BY_ADMIN } from "../../../../../apollo/admin/query";
import { T } from "lib/types/common";
import { currency } from "lib";

const PAGE_SIZE = 20;
const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

export default function AdminOrdersPageView() {
  const [page, setPage] = useState(1);
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const queryVariables = useMemo(
    () => ({
      input: {
        page,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        search: {
          ...(orderStatus ? { orderStatus } : {}),
          ...(paymentStatus ? { orderPaymentStatus: paymentStatus } : {}),
        },
      },
    }),
    [orderStatus, page, paymentStatus]
  );

  const { data, loading, error } = useQuery(GET_ALL_ORDERS_BY_ADMIN, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: queryVariables,
  });

  const list = (data as T)?.getAllOrdersByAdmin?.orders ?? [];
  const total = (data as T)?.getAllOrdersByAdmin?.metaData?.total ?? 0;

  return (
    <PageWrapper title="Orders">
      <FlexBox mb={2} gap={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel>Order Status</InputLabel>
          <Select
            value={orderStatus}
            label="Order Status"
            onChange={(e) => {
              setOrderStatus(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All</MenuItem>
            {ORDER_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 190 }}>
          <InputLabel>Payment Status</InputLabel>
          <Select
            value={paymentStatus}
            label="Payment Status"
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All</MenuItem>
            {PAYMENT_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </FlexBox>

      {loading ? (
        <Typography variant="body1">Loading orders...</Typography>
      ) : error ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error.main" sx={{ mb: 1 }}>
            Failed to load orders
          </Typography>
          <Typography color="text.secondary">{error.message}</Typography>
        </Card>
      ) : list.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No orders found.</Typography>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 4, boxShadow: "none", border: "1px solid", borderColor: "divider" }}>
          <OverlayScrollbar>
            <TableContainer sx={{ minWidth: 1100 }}>
              <Table>
                <TableHead sx={{ backgroundColor: "grey.50" }}>
                  <TableRow>
                    <TableCell>Order</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Delivery</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {list.map((order: any) => (
                    <TableRow key={order._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        #{String(order._id).slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell>{order.brand?.memberNick ?? "-"}</TableCell>
                      <TableCell>{order.member?.memberNick ?? "-"}</TableCell>
                      <TableCell>
                        <StatusWrapper status={order.orderStatus}>{order.orderStatus}</StatusWrapper>
                      </TableCell>
                      <TableCell>
                        <StatusWrapper status={order.orderPaymentStatus}>{order.orderPaymentStatus}</StatusWrapper>
                      </TableCell>
                      <TableCell>
                        <StatusWrapper status={order.orderDeliveryStatus}>{order.orderDeliveryStatus}</StatusWrapper>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{currency(order.orderFinalPrice ?? 0)}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </OverlayScrollbar>

          <Stack alignItems="center" my={4}>
            <TablePagination
              page={page}
              onChange={(_, value) => setPage(value)}
              count={Math.max(1, Math.ceil(total / PAGE_SIZE))}
            />
          </Stack>
        </Card>
      )}
    </PageWrapper>
  );
}
