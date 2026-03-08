"use client";

import { useState } from "react";
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
import { useQuery } from "lib/hooks/useQuery";
import { GET_BRAND_ORDERS } from "../../../../../apollo/brand/query";
import { T } from "lib/types/common";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;
const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

// =============================================================================

export default function OrdersPageView() {
  // ─── Filters ────────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const { data, loading } = useQuery(GET_BRAND_ORDERS, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        page: currentPage,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        ...(statusFilter ? { search: { orderStatus: statusFilter } } : {})
      }
    }
  });

  // ─── Data ───────────────────────────────────────────────────────────────────
  const list = (data as T)?.getBrandOrders?.orders ?? [];
  const total = (data as T)?.getBrandOrders?.metaData?.total ?? 0;

  const { order, orderBy, handleRequestSort } =
    useMuiTable({ listData: list, defaultSort: "createdAt", defaultOrder: "desc" });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handlePageChange = (_: any, page: number) => setCurrentPage(page);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
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
            onChange={(e) => handleStatusFilterChange(e.target.value)}
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
                  {list.map((orderItem: any) => (
                    <OrderRow
                      key={orderItem._id}
                      order={orderItem}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </OverlayScrollbar>

          <Stack alignItems="center" my={4}>
            <TablePagination
              onChange={handlePageChange}
              count={Math.ceil(total / PAGE_SIZE)}
              page={currentPage}
            />
          </Stack>
        </Card>
      )}
    </PageWrapper>
  );
}
