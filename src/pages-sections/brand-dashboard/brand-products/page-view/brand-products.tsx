"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Add from "@mui/icons-material/Add";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Theme } from "@mui/material/styles";
import FlexBox from "components/flex-box/flex-box";
// GLOBAL CUSTOM COMPONENTS
import OverlayScrollbar from "components/overlay-scrollbar";
import { TableHeader, TablePagination } from "components/data-table";
// GLOBAL CUSTOM HOOK
import useMuiTable from "hooks/useMuiTable";
// LOCAL CUSTOM COMPONENT
import BrandProductRow from "../product-row";
import PageWrapper from "../../page-wrapper";
// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_BRAND_PRODUCTS } from "../../../../../apollo/brand/query";
import { UPDATE_PRODUCT } from "../../../../../apollo/brand/mutation";
import { T } from "lib/types/common";
// ALERTS
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert,
  sweetConfirmAlert
} from "lib/sweetAlert";

// TABLE HEADING
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
const PRODUCT_STATUSES = ["DRAFT", "PENDING", "ACTIVE", "SOLD_OUT", "HIDDEN"];

// =============================================================================

export default function BrandProductsPageView() {
  const router = useRouter();
  const downSM = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const { data, loading, refetch } = useQuery(GET_BRAND_PRODUCTS, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        page: currentPage,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        search: {
          ...(statusFilter ? { productStatus: statusFilter } : {})
        }
      }
    }
  });

  const [updateProduct] = useMutation(UPDATE_PRODUCT);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const list = (data as T)?.getBrandProducts?.products ?? [];
  const total = (data as T)?.getBrandProducts?.metaData?.total ?? 0;

  const { order, orderBy, handleRequestSort } =
    useMuiTable({ listData: list, defaultSort: "createdAt", defaultOrder: "desc" });

  const handlePageChange = (_: unknown, page: number) => setCurrentPage(page);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleEdit = useCallback((product: any) => {
    router.push(`/brand/products/${product._id}`);
  }, [router]);

  const handleDelete = useCallback(async (product: any) => {
    const confirmed = await sweetConfirmAlert(
      "Delete Product?",
      `Delete "${product.productTitle}"? This will hide the product.`,
      "Delete"
    );
    if (!confirmed) return;
    try {
      await updateProduct({
        variables: { input: { _id: product._id, productStatus: "DELETED" } }
      });
      await sweetTopSmallSuccessAlert("Product deleted");
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to delete product");
    }
  }, [updateProduct, refetch]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper title="My Products">
      <FlexBox mb={2} gap={2} justifyContent="space-between" flexWrap="wrap">
        {/* Filters */}
        <FlexBox gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <MenuItem value="">All</MenuItem>
              {PRODUCT_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </FlexBox>

        <Button
          color="info"
          fullWidth={downSM}
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push("/brand/products/create")}
          sx={{ minHeight: 44 }}
        >
          Add Product
        </Button>
      </FlexBox>

      {loading ? (
        <Typography variant="body1">Loading products...</Typography>
      ) : list.length === 0 ? (
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
                  {list.map((product: any) => (
                    <BrandProductRow
                      key={product._id}
                      product={product}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </OverlayScrollbar>

          <Stack alignItems="center" my={4}>
            <TablePagination
              page={currentPage}
              onChange={handlePageChange}
              count={Math.ceil(total / PAGE_SIZE)}
            />
          </Stack>
        </Card>
      )}
    </PageWrapper>
  );
}
