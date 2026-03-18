"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
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
import BrandProductForm from "../product-form";
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
  const [productRows, setProductRows] = useState<any[]>([]);
  const [productTotal, setProductTotal] = useState(0);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const syncProductState = useCallback((result?: T) => {
    setProductRows(result?.getBrandProducts?.products ?? []);
    setProductTotal(result?.getBrandProducts?.metaData?.total ?? 0);
  }, []);

  const { loading, error, refetch } = useQuery(GET_BRAND_PRODUCTS, {
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
    },
    onCompleted: (result: T) => {
      syncProductState(result);
    },
  });

  const [updateProduct] = useMutation(UPDATE_PRODUCT);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const { order, orderBy, handleRequestSort } =
    useMuiTable({ listData: productRows, defaultSort: "createdAt", defaultOrder: "desc" });

  const handlePageChange = (_: unknown, page: number) => setCurrentPage(page);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleEdit = useCallback((product: any) => {
    setEditingProductId(product._id);
  }, []);

  const handleStatusChange = useCallback(async (product: any, nextStatus: string) => {
    if (product.productStatus === nextStatus) return;
    try {
      setStatusUpdatingId(product._id);
      await updateProduct({
        variables: { input: { _id: product._id, productStatus: nextStatus } }
      });
      await sweetTopSmallSuccessAlert(`Product status changed to ${nextStatus}`);
      const result = await refetch();
      syncProductState(result.data as T);
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update product status");
    } finally {
      setStatusUpdatingId(null);
    }
  }, [updateProduct, refetch, syncProductState]);

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
      const result = await refetch();
      syncProductState(result.data as T);
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to delete product");
    }
  }, [updateProduct, refetch, syncProductState]);

  const handleEditSaved = useCallback(async () => {
    setEditingProductId(null);
    const result = await refetch();
    syncProductState(result.data as T);
  }, [refetch, syncProductState]);

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

      {loading && productRows.length === 0 ? (
        <Typography variant="body1">Loading products...</Typography>
      ) : error ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error.main">Failed to load products.</Typography>
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
                  {productRows.map((product: any) => (
                    <BrandProductRow
                      key={product._id}
                      product={product}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                      updating={statusUpdatingId === product._id}
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
              count={Math.max(1, Math.ceil(productTotal / PAGE_SIZE))}
            />
          </Stack>
        </Card>
      )}

      <Dialog
        open={!!editingProductId}
        onClose={() => setEditingProductId(null)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {editingProductId ? (
            <BrandProductForm
              productId={editingProductId}
              embedded
              onCancel={() => setEditingProductId(null)}
              onSaved={handleEditSaved}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
