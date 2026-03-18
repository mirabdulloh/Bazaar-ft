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
// GLOBAL CUSTOM COMPONENTS
import OverlayScrollbar from "components/overlay-scrollbar";
import { TableHeader, TablePagination } from "components/data-table";
import FlexBox from "components/flex-box/flex-box";
// GLOBAL CUSTOM HOOK
import useMuiTable from "hooks/useMuiTable";
// LOCAL CUSTOM COMPONENT
import ProductRow from "../product-row";
import PageWrapper from "../../page-wrapper";
// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_ALL_PRODUCTS_BY_ADMIN } from "../../../../../apollo/admin/query";
import { REMOVE_PRODUCT_BY_ADMIN } from "../../../../../apollo/admin/mutation";
import { T } from "lib/types/common";
// ALERTS
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert,
  sweetConfirmAlert
} from "lib/sweetAlert";

// TABLE HEADING DATA LIST
const tableHeading = [
  { id: "productTitle", label: "Product", align: "left" },
  { id: "productStatus", label: "Status", align: "left" },
  { id: "productPrice", label: "Price", align: "left" },
  { id: "productStockQuantity", label: "Stock", align: "left" },
  { id: "productViews", label: "Views", align: "left" },
  { id: "createdAt", label: "Date", align: "left" },
  { id: "action", label: "Action", align: "center" }
];

const PAGE_SIZE = 20;
const PRODUCT_STATUSES = ["DRAFT", "PENDING", "ACTIVE", "SOLD_OUT", "HIDDEN", "REJECTED", "DELETED"];

// =============================================================================

export default function ProductsPageView() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [productRows, setProductRows] = useState<any[]>([]);
  const [productTotal, setProductTotal] = useState(0);

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const { loading, error, refetch } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        page: 1,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        ...(statusFilter ? { search: { productStatus: statusFilter } } : {})
      }
    },
    onCompleted: (result: T) => {
      setProductRows(result?.getAllProductsByAdmin?.products ?? []);
      setProductTotal(result?.getAllProductsByAdmin?.metaData?.total ?? 0);
    }
  });

  const [removeProduct] = useMutation(REMOVE_PRODUCT_BY_ADMIN);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const { order, orderBy, rowsPerPage, filteredList, handleChangePage, handleRequestSort } =
    useMuiTable({ listData: productRows, defaultSort: "createdAt", defaultOrder: "desc" });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (product: any) => {
    const confirmed = await sweetConfirmAlert(
      "Remove Product?",
      `Remove "${product.productTitle}"? This will mark it as DELETED.`,
      "Remove"
    );
    if (!confirmed) return;
    try {
      await removeProduct({ variables: { input: product._id } });
      await sweetTopSmallSuccessAlert("Product removed");
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to remove product");
    }
  }, [removeProduct, refetch]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper title="Product List">
      {/* Filter */}
      <FlexBox mb={2} gap={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {PRODUCT_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </FlexBox>

      {loading && productRows.length === 0 ? (
        <Typography variant="body1">Loading products...</Typography>
      ) : error && productRows.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error.main" sx={{ mb: 1 }}>
            Failed to load products
          </Typography>
          <Typography color="text.secondary">{error.message}</Typography>
        </Card>
      ) : productRows.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No products found.</Typography>
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
                  {filteredList.map((product: any) => (
                    <ProductRow
                      key={product._id}
                      product={product}
                      onDelete={handleDelete}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </OverlayScrollbar>

          <Stack alignItems="center" my={4}>
            <TablePagination
              onChange={handleChangePage}
              count={Math.max(1, Math.ceil(productTotal / rowsPerPage))}
            />
          </Stack>
        </Card>
      )}
    </PageWrapper>
  );
}
