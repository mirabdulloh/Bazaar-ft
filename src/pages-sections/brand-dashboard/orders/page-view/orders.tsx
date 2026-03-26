"use client";

import { useCallback, useMemo, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button, { type ButtonProps } from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import CloseRounded from "@mui/icons-material/CloseRounded";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
import OverlayScrollbar from "components/overlay-scrollbar";
import { TablePagination } from "components/data-table";
import FlexBox from "components/flex-box/flex-box";
import PageWrapper from "../../page-wrapper";
import OrderRow, { OrderData } from "../order-row";
import { tableHeading } from "../table-heading";
import { StatusWrapper } from "../../styles";
import {
  ActionButtonRow,
  DetailDrawerContent,
  DetailHeaderCard,
  DetailSectionCard,
  FilterPillButton,
  FilterToolbarCard,
  ProductLine,
  ProductThumb,
  SummaryGrid,
  SummaryMetricCard,
} from "../styles";
import { useQuery } from "lib/hooks/useQuery";
import { useMutation } from "@apollo/client/react";
import { GET_BRAND_ORDERS } from "../../../../../apollo/brand/query";
import { UPDATE_ORDER_BY_BRAND, UPDATE_ORDERS_BY_BRAND } from "../../../../../apollo/brand/mutation";
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from "lib/sweetAlert";
import { currency } from "lib";
import { T } from "lib/types/common";
import { getComparator, stableSort } from "hooks/useMuiTable";
import UpDown from "icons/UpDown";

const PAGE_SIZE = 20;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "New", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Completed", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Refunded", value: "REFUNDED" },
];

type StatusAction = {
  label: string;
  nextStatus: string;
  color: ButtonProps["color"];
  variant?: ButtonProps["variant"];
};

function resolveImage(img?: string | null): string {
  if (!img) return "";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const normalized = img.startsWith("/") ? img : `/${img}`;
  return API_URL ? `${API_URL}${normalized}` : normalized;
}

function formatAddress(address?: OrderData["deliveryAddress"]): string {
  if (!address) return "No delivery address saved for this order.";
  return [
    address.addressLine1,
    address.addressLine2,
    [address.addressCity, address.addressZipCode].filter(Boolean).join(", "),
    address.addressCountry,
  ]
    .filter(Boolean)
    .join("\n");
}

function getStatusAction(orderStatus: string): StatusAction[] {
  if (orderStatus === "PENDING") {
    return [
      { label: "Confirm Order", nextStatus: "CONFIRMED", color: "primary" as const },
      { label: "Cancel Order", nextStatus: "CANCELLED", color: "error" as const, variant: "outlined" as const },
    ];
  }

  if (orderStatus === "CONFIRMED") {
    return [
      { label: "Mark as Shipped", nextStatus: "SHIPPED", color: "warning" as const },
    ];
  }

  return [];
}

function getConfirmCopy(nextStatus: string) {
  switch (nextStatus) {
    case "CONFIRMED":
      return {
        title: "Confirm this order?",
        text: "This will accept the order, mark payment as paid, and move it into preparation.",
        confirm: "Yes, Confirm",
        success: "Order confirmed",
      };
    case "CANCELLED":
      return {
        title: "Cancel this order?",
        text: "This will cancel the order and restore stock for the ordered products.",
        confirm: "Yes, Cancel",
        success: "Order cancelled",
      };
    case "SHIPPED":
      return {
        title: "Mark this order as shipped?",
        text: "This will notify the customer that the order is on the way.",
        confirm: "Yes, Mark Shipped",
        success: "Order marked as shipped",
      };
    default:
      return {
        title: "Update order?",
        text: "This action will update the order status.",
        confirm: "Continue",
        success: "Order updated",
      };
  }
}

export default function OrdersPageView() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [orderBy, setOrderBy] = useState("createdAt");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");
  const [orderRows, setOrderRows] = useState<OrderData[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [actingStatus, setActingStatus] = useState<string>("");

  const queryVariables = useMemo(
    () => ({
      input: {
        page: currentPage,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        ...(statusFilter ? { search: { orderStatus: statusFilter } } : {}),
      },
    }),
    [currentPage, statusFilter]
  );

  const { loading, error, refetch } = useQuery(GET_BRAND_ORDERS, {
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    variables: queryVariables,
    onCompleted: (result: T) => {
      setOrderRows(result?.getBrandOrders?.orders ?? []);
      setOrderTotal(result?.getBrandOrders?.metaData?.total ?? 0);
    },
  });

  const [updateOrderByBrand] = useMutation(UPDATE_ORDER_BY_BRAND);
  const [updateOrdersByBrand] = useMutation(UPDATE_ORDERS_BY_BRAND);

  const rawList = orderRows;
  const total = orderTotal;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const sortedList = useMemo(
    () => stableSort(rawList, getComparator(orderDirection, orderBy)),
    [orderBy, orderDirection, rawList]
  );

  const selectedOrder = useMemo(
    () => rawList.find((item) => item._id === selectedOrderId) ?? null,
    [rawList, selectedOrderId]
  );
  const bulkEligibleOrders = useMemo(
    () => sortedList.filter((item) => item.orderStatus === "PENDING" || item.orderStatus === "CONFIRMED"),
    [sortedList]
  );
  const selectedOrders = useMemo(
    () => sortedList.filter((item) => selectedOrderIds.includes(item._id)),
    [selectedOrderIds, sortedList]
  );
  const allSelectedStatuses = useMemo(
    () => Array.from(new Set(selectedOrders.map((item) => item.orderStatus))),
    [selectedOrders]
  );
  const bulkAction =
    allSelectedStatuses.length === 1 && allSelectedStatuses[0] === "PENDING"
      ? { nextStatus: "CONFIRMED", label: "Confirm Selected", confirm: "Confirm selected orders?", success: "Selected orders confirmed" }
      : allSelectedStatuses.length === 1 && allSelectedStatuses[0] === "CONFIRMED"
        ? { nextStatus: "SHIPPED", label: "Mark Selected as Shipped", confirm: "Mark selected orders as shipped?", success: "Selected orders marked as shipped" }
        : null;
  const allEligibleSelected = bulkEligibleOrders.length > 0 && bulkEligibleOrders.every((item) => selectedOrderIds.includes(item._id));

  const handleRequestSort = useCallback((property: string) => {
    if (property === "action" || property === "member") return;
    const isAsc = orderBy === property && orderDirection === "asc";
    setOrderDirection(isAsc ? "desc" : "asc");
    setOrderBy(property);
  }, [orderBy, orderDirection]);

  const handleView = useCallback((order: OrderData) => {
    setSelectedOrderId(order._id);
  }, []);

  const handleSelectOrder = useCallback((order: OrderData, checked: boolean) => {
    setSelectedOrderIds((prev) =>
      checked ? Array.from(new Set([...prev, order._id])) : prev.filter((id) => id !== order._id)
    );
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedOrderIds(checked ? bulkEligibleOrders.map((item) => item._id) : []);
  }, [bulkEligibleOrders]);

  const handleStatusUpdate = useCallback(async (order: OrderData, nextStatus: string) => {
    const copy = getConfirmCopy(nextStatus);
    const confirmed = await sweetConfirmAlert(copy.title, copy.text, copy.confirm);
    if (!confirmed) return;

    const lockId = `${order._id}:${nextStatus}`;
    setActingStatus(lockId);

    try {
      const { data: result } = await updateOrderByBrand({
        variables: {
          input: {
            _id: order._id,
            orderStatus: nextStatus,
          },
        },
      });

      const updated = (result as T)?.updateOrderByBrand as T | undefined;
      if (updated) {
        setOrderRows((prev) =>
          prev
            .map((item) => (item._id === order._id ? ({ ...item, ...updated } as OrderData) : item))
            .filter((item) => !statusFilter || item.orderStatus === statusFilter)
        );
      }

      const refetchResult = await refetch();
      const nextRows = (refetchResult.data as T)?.getBrandOrders?.orders ?? [];
      const nextTotal = (refetchResult.data as T)?.getBrandOrders?.metaData?.total ?? 0;
      setOrderRows(nextRows);
      setOrderTotal(nextTotal);
      setSelectedOrderIds((prev) => prev.filter((id) => nextRows.some((item: OrderData) => item._id === id)));

      if (!nextRows.some((item: OrderData) => item._id === order._id)) {
        setSelectedOrderId(null);
      }

      await sweetTopSmallSuccessAlert(copy.success);
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update order");
    } finally {
      setActingStatus("");
    }
  }, [refetch, statusFilter, updateOrderByBrand]);

  const handleBulkStatusUpdate = useCallback(async () => {
    if (!bulkAction || selectedOrders.length === 0) return;

    const confirmed = await sweetConfirmAlert(
      bulkAction.confirm,
      `This will update ${selectedOrders.length} orders.`,
      bulkAction.label
    );
    if (!confirmed) return;

    setActingStatus(`bulk:${bulkAction.nextStatus}`);

    try {
      await updateOrdersByBrand({
        variables: {
          input: {
            _ids: selectedOrders.map((item) => item._id),
            orderStatus: bulkAction.nextStatus,
          },
        },
      });

      const refetchResult = await refetch();
      const nextRows = (refetchResult.data as T)?.getBrandOrders?.orders ?? [];
      const nextTotal = (refetchResult.data as T)?.getBrandOrders?.metaData?.total ?? 0;
      setOrderRows(nextRows);
      setOrderTotal(nextTotal);
      setSelectedOrderIds([]);
      if (selectedOrderId && !nextRows.some((item: OrderData) => item._id === selectedOrderId)) {
        setSelectedOrderId(null);
      }

      await sweetTopSmallSuccessAlert(bulkAction.success);
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update selected orders");
    } finally {
      setActingStatus("");
    }
  }, [bulkAction, refetch, selectedOrderId, selectedOrders, updateOrdersByBrand]);

  const activeActions = selectedOrder ? getStatusAction(selectedOrder.orderStatus) : [];

  return (
    <PageWrapper title="Orders">
      <FilterToolbarCard>
        {STATUS_FILTERS.map((item) => (
          <FilterPillButton
            key={item.label}
            active={statusFilter === item.value}
            onClick={() => {
              setStatusFilter(item.value);
              setCurrentPage(1);
              setSelectedOrderIds([]);
            }}
          >
            {item.label}
          </FilterPillButton>
        ))}
      </FilterToolbarCard>

      {selectedOrders.length > 0 && (
        <Card sx={{ p: 2, mb: 2, borderRadius: 3, boxShadow: "none", border: "1px solid", borderColor: "divider" }}>
          <FlexBox justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
            <Typography fontWeight={700}>
              {selectedOrders.length} order{selectedOrders.length > 1 ? "s" : ""} selected
            </Typography>

            <FlexBox gap={1} flexWrap="wrap">
              {bulkAction ? (
                <Button
                  variant="contained"
                  color={bulkAction.nextStatus === "CONFIRMED" ? "primary" : "warning"}
                  onClick={handleBulkStatusUpdate}
                  disabled={actingStatus === `bulk:${bulkAction.nextStatus}`}
                >
                  {bulkAction.label}
                </Button>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Select orders with the same status to confirm or ship them together.
                </Typography>
              )}

              <Button variant="text" color="inherit" onClick={() => setSelectedOrderIds([])}>
                Clear Selection
              </Button>
            </FlexBox>
          </FlexBox>
        </Card>
      )}

      {loading && rawList.length === 0 ? (
        <Stack gap={1.5}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={72} sx={{ borderRadius: 3 }} />
          ))}
        </Stack>
      ) : error ? (
        <Card sx={{ p: 5, textAlign: "center", borderRadius: 4, boxShadow: "none", border: "1px solid", borderColor: "divider" }}>
          <Typography color="error.main" sx={{ mb: 1 }}>
            Failed to load orders
          </Typography>
          <Typography color="text.secondary">{error.message}</Typography>
        </Card>
      ) : rawList.length === 0 ? (
        <Card sx={{ p: 5, textAlign: "center", borderRadius: 4, boxShadow: "none", border: "1px solid", borderColor: "divider" }}>
          <ShoppingBagOutlined sx={{ fontSize: 48, color: "grey.400", mb: 1.5 }} />
          <Typography variant="h6" sx={{ mb: 0.75 }}>
            No orders found
          </Typography>
          <Typography color="text.secondary">
            Orders for this brand will appear here once customers start buying your products.
          </Typography>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 4, boxShadow: "none", border: "1px solid", borderColor: "divider" }}>
          <OverlayScrollbar>
            <TableContainer sx={{ minWidth: 900 }}>
              <Table>
                <TableHead sx={{ backgroundColor: "grey.50" }}>
                  <TableRow>
                    <TableCell padding="checkbox" align="center">
                      <Checkbox
                        size="small"
                        checked={allEligibleSelected}
                        indeterminate={selectedOrderIds.length > 0 && !allEligibleSelected}
                        disabled={bulkEligibleOrders.length === 0}
                        onChange={(event) => handleSelectAll(event.target.checked)}
                      />
                    </TableCell>
                    {tableHeading.map((headCell) => (
                      <TableCell
                        key={headCell.id}
                        align={headCell.align as "left" | "center" | "right"}
                        sortDirection={orderBy === headCell.id ? orderDirection : false}
                        sx={{ fontWeight: 500, padding: "16px 20px" }}
                      >
                        <TableSortLabel
                          active={orderBy === headCell.id}
                          onClick={() => handleRequestSort(headCell.id)}
                          direction={orderBy === headCell.id ? orderDirection : "asc"}
                          IconComponent={() => <UpDown sx={{ fontSize: 12, ml: 1, color: "grey.400" }} />}
                        >
                          {headCell.label}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedList.map((item) => (
                    <OrderRow
                      key={item._id}
                      order={item}
                      onView={handleView}
                      selectable={item.orderStatus === "PENDING" || item.orderStatus === "CONFIRMED"}
                      selected={selectedOrderIds.includes(item._id)}
                      onSelect={handleSelectOrder}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </OverlayScrollbar>

          <Stack alignItems="center" my={4}>
            <TablePagination
              onChange={(_, page) => {
                setCurrentPage(page);
                setSelectedOrderIds([]);
              }}
              count={totalPages}
              page={currentPage}
            />
          </Stack>
        </Card>
      )}

      <Drawer
        anchor="right"
        open={!!selectedOrder}
        onClose={() => setSelectedOrderId(null)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 620 }, maxWidth: "100%" } }}
      >
        {selectedOrder && (
          <DetailDrawerContent>
            <FlexBox alignItems="flex-start" justifyContent="space-between" gap={2}>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Order #{selectedOrder._id.slice(-8).toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Created {new Date(selectedOrder.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Typography>
              </Box>
              <Button
                variant="text"
                color="inherit"
                onClick={() => setSelectedOrderId(null)}
                startIcon={<CloseRounded />}
                sx={{ textTransform: "none" }}
              >
                Close
              </Button>
            </FlexBox>

            <DetailHeaderCard>
              <FlexBox justifyContent="space-between" alignItems="flex-start" gap={2} flexWrap="wrap">
                <FlexBox alignItems="center" gap={1.5}>
                  <Avatar
                    src={resolveImage(selectedOrder.member?.memberImage)}
                    alt={selectedOrder.member?.memberNick ?? "Customer"}
                    sx={{ width: 56, height: 56 }}
                  />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Customer
                    </Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                      {selectedOrder.member?.memberNick ?? "Customer"}
                    </Typography>
                    {!!selectedOrder.member?.memberEmail && (
                      <Typography variant="body2" color="text.secondary">
                        {selectedOrder.member.memberEmail}
                      </Typography>
                    )}
                    {!!selectedOrder.member?.memberPhone && (
                      <Typography variant="body2" color="text.secondary">
                        {selectedOrder.member.memberPhone}
                      </Typography>
                    )}
                  </Box>
                </FlexBox>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <StatusWrapper status={selectedOrder.orderStatus}>{selectedOrder.orderStatus}</StatusWrapper>
                  <StatusWrapper status={selectedOrder.orderPaymentStatus === "PAID" ? "Accepted" : selectedOrder.orderPaymentStatus === "FAILED" ? "Rejected" : "Pending"}>
                    {selectedOrder.orderPaymentStatus}
                  </StatusWrapper>
                  <StatusWrapper status={selectedOrder.orderDeliveryStatus === "DELIVERED" ? "Delivered" : selectedOrder.orderDeliveryStatus === "SHIPPING" ? "Processing" : "Pending"}>
                    {selectedOrder.orderDeliveryStatus}
                  </StatusWrapper>
                </Stack>
              </FlexBox>

              <SummaryGrid sx={{ mt: 2 }}>
                <SummaryMetricCard>
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                    {currency(selectedOrder.orderFinalPrice ?? 0)}
                  </Typography>
                </SummaryMetricCard>

                <SummaryMetricCard>
                  <Typography variant="caption" color="text.secondary">
                    Items
                  </Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                    {selectedOrder.orderItems?.reduce((sum, item) => sum + Number(item.itemQuantity ?? 0), 0) ?? 0}
                  </Typography>
                </SummaryMetricCard>

                <SummaryMetricCard>
                  <Typography variant="caption" color="text.secondary">
                    Payment Method
                  </Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                    {selectedOrder.orderPaymentMethod.replaceAll("_", " ")}
                  </Typography>
                </SummaryMetricCard>
              </SummaryGrid>

              {activeActions.length > 0 && (
                <ActionButtonRow>
                  {activeActions.map((action) => {
                    const lockId = `${selectedOrder._id}:${action.nextStatus}`;
                    return (
                      <Button
                        key={action.nextStatus}
                        variant={action.variant ?? "contained"}
                        color={action.color}
                        onClick={() => handleStatusUpdate(selectedOrder, action.nextStatus)}
                        disabled={actingStatus === lockId}
                        loading={actingStatus === lockId}
                        startIcon={
                          action.nextStatus === "CONFIRMED" ? <Inventory2Outlined /> :
                          action.nextStatus === "SHIPPED" ? <LocalShippingOutlined /> :
                          <CancelOutlined />
                        }
                      >
                        {action.label}
                      </Button>
                    );
                  })}
                </ActionButtonRow>
              )}
            </DetailHeaderCard>

            <DetailSectionCard>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1.25 }}>
                Ordered Items
              </Typography>

              {selectedOrder.orderItems?.map((item) => {
                const image = resolveImage(item.product?.productImages?.[0]);
                return (
                  <ProductLine key={item._id}>
                    <ProductThumb>
                      {image ? <img src={image} alt={item.product?.productTitle ?? "Product"} /> : null}
                    </ProductThumb>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body1" fontWeight={700}>
                        {item.product?.productTitle ?? `Product #${item.productId.slice(-6)}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {currency(item.priceAtPurchase)} x {item.itemQuantity}
                      </Typography>

                      <FlexBox gap={0.75} flexWrap="wrap" sx={{ mt: 1 }}>
                        {item.selectedSize && <Chip size="small" label={`Size ${item.selectedSize}`} variant="outlined" />}
                        {item.selectedColor && <Chip size="small" label={`Color ${item.selectedColor}`} variant="outlined" />}
                      </FlexBox>
                    </Box>

                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ justifySelf: "end", textAlign: "right", display: { xs: "none", sm: "block" } }}
                    >
                      {currency(item.subtotal)}
                    </Typography>
                  </ProductLine>
                );
              })}
            </DetailSectionCard>

            <DetailSectionCard>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1.25 }}>
                Delivery Address
              </Typography>
              <Typography variant="body1" whiteSpace="pre-line">
                {formatAddress(selectedOrder.deliveryAddress)}
              </Typography>
              {!!selectedOrder.deliveryAddress?.addressPhone && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Phone: {selectedOrder.deliveryAddress.addressPhone}
                </Typography>
              )}
            </DetailSectionCard>

            <DetailSectionCard>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1.25 }}>
                Order Summary
              </Typography>

              <Stack spacing={1.25}>
                <FlexBox justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography fontWeight={700}>{currency(selectedOrder.orderTotalPrice ?? 0)}</Typography>
                </FlexBox>
                <FlexBox justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary">Discount</Typography>
                  <Typography fontWeight={700}>
                    -{currency(selectedOrder.orderTotalDiscountPrice ?? 0)}
                  </Typography>
                </FlexBox>
                <Divider />
                <FlexBox justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight={700}>Final Total</Typography>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {currency(selectedOrder.orderFinalPrice ?? 0)}
                  </Typography>
                </FlexBox>
              </Stack>
            </DetailSectionCard>
          </DetailDrawerContent>
        )}
      </Drawer>
    </PageWrapper>
  );
}
