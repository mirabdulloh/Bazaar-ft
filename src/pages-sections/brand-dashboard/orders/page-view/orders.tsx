"use client";

import { useState, useCallback } from "react";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
// GLOBAL CUSTOM COMPONENTS
import OverlayScrollbar from "components/overlay-scrollbar";
import { TableHeader, TablePagination } from "components/data-table";
import FlexBox from "components/flex-box/flex-box";
// GLOBAL CUSTOM HOOK
import useMuiTable from "hooks/useMuiTable";
// LOCAL CUSTOM COMPONENT
import OrderRow from "../order-row";
import PageWrapper from "../../page-wrapper";
// TABLE HEAD COLUMN DATA
import { tableHeading } from "../table-heading";
// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_ALL_ORDERS_BY_ADMIN } from "../../../../../apollo/admin/query";
import { UPDATE_ORDER_BY_ADMIN } from "../../../../../apollo/admin/mutation";
import { T } from "lib/types/common";
// ALERTS
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert
} from "lib/sweetAlert";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;
const ORDER_STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];
const DELIVERY_STATUSES = ["PENDING", "SHIPPED", "DELIVERED", "RETURNED"];

// =============================================================================

export default function OrdersPageView() {
  // ─── Filters ────────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<string>("");

  // ─── Dialog state ───────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editOrderStatus, setEditOrderStatus] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState("");
  const [editDeliveryStatus, setEditDeliveryStatus] = useState("");

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const { data, loading, refetch } = useQuery(GET_ALL_ORDERS_BY_ADMIN, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        page: 1,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        ...(statusFilter ? { search: { orderStatus: statusFilter } } : {})
      }
    }
  });

  const [updateOrder, { loading: updating }] = useMutation(UPDATE_ORDER_BY_ADMIN);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const list = (data as T)?.getAllOrdersByAdmin?.orders ?? [];
  const total = (data as T)?.getAllOrdersByAdmin?.metaData?.total ?? 0;

  const { order, orderBy, rowsPerPage, filteredList, handleChangePage, handleRequestSort } =
    useMuiTable({ listData: list, defaultSort: "createdAt", defaultOrder: "desc" });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const openEditDialog = useCallback((orderItem: any) => {
    setSelectedOrder(orderItem);
    setEditOrderStatus(orderItem.orderStatus || "PENDING");
    setEditPaymentStatus(orderItem.orderPaymentStatus || "PENDING");
    setEditDeliveryStatus(orderItem.orderDeliveryStatus || "PENDING");
    setDialogOpen(true);
  }, []);

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdate = async () => {
    if (!selectedOrder) return;
    try {
      await updateOrder({
        variables: {
          input: {
            _id: selectedOrder._id,
            orderStatus: editOrderStatus,
            orderPaymentStatus: editPaymentStatus,
            orderDeliveryStatus: editDeliveryStatus
          }
        }
      });
      await sweetTopSmallSuccessAlert("Order updated successfully");
      handleClose();
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update order");
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper title="Orders">
      {/* Filters */}
      <FlexBox mb={2} gap={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Order Status</InputLabel>
          <Select
            value={statusFilter}
            label="Order Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {ORDER_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </FlexBox>

      {loading ? (
        <Typography variant="body1">Loading orders...</Typography>
      ) : list.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No orders found.</Typography>
        </Card>
      ) : (
        <Card>
          <OverlayScrollbar>
            <TableContainer sx={{ minWidth: 900 }}>
              <Table>
                <TableHeader
                  order={order}
                  orderBy={orderBy}
                  heading={tableHeading}
                  onRequestSort={handleRequestSort}
                />

                <TableBody>
                  {filteredList.map((orderItem: any) => (
                    <OrderRow
                      key={orderItem._id}
                      order={orderItem}
                      onEdit={openEditDialog}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </OverlayScrollbar>

          <Stack alignItems="center" my={4}>
            <TablePagination
              onChange={handleChangePage}
              count={Math.ceil(total / rowsPerPage)}
            />
          </Stack>
        </Card>
      )}

      {/* ─── Edit Order Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Update Order — #{selectedOrder?._id?.slice(0, 8)}
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <FormControl fullWidth>
            <InputLabel>Order Status</InputLabel>
            <Select value={editOrderStatus} label="Order Status" onChange={(e) => setEditOrderStatus(e.target.value)}>
              {ORDER_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Payment Status</InputLabel>
            <Select value={editPaymentStatus} label="Payment Status" onChange={(e) => setEditPaymentStatus(e.target.value)}>
              {PAYMENT_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Delivery Status</InputLabel>
            <Select value={editDeliveryStatus} label="Delivery Status" onChange={(e) => setEditDeliveryStatus(e.target.value)}>
              {DELIVERY_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" color="info" disabled={updating}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
}
