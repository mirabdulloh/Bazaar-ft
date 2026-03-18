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
import Button from "@mui/material/Button";
import Add from "@mui/icons-material/Add";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Theme } from "@mui/material/styles";
// GLOBAL CUSTOM COMPONENTS
import OverlayScrollbar from "components/overlay-scrollbar";
import { TableHeader, TablePagination } from "components/data-table";
import FlexBox from "components/flex-box/flex-box";
// GLOBAL CUSTOM HOOK
import useMuiTable from "hooks/useMuiTable";
// LOCAL CUSTOM COMPONENT
import CategoryRow from "../category-row";
import CategoryForm from "../category-form";
import PageWrapper from "../../page-wrapper";
// TABLE HEAD COLUMN DATA
import { tableHeading } from "../table-heading";
// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_ALL_CATEGORIES_BY_ADMIN } from "../../../../../apollo/admin/query";
import { DELETE_CATEGORY } from "../../../../../apollo/admin/mutation";
import { T } from "lib/types/common";
// ALERTS
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert,
  sweetConfirmAlert
} from "lib/sweetAlert";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;
const CATEGORY_STATUSES = ["ACTIVE", "INACTIVE"];

// =============================================================================

export default function CategoriesPageView() {
  const downSM = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [categoryRows, setCategoryRows] = useState<any[]>([]);
  const [categoryTotal, setCategoryTotal] = useState(0);

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const { loading, error, refetch } = useQuery(GET_ALL_CATEGORIES_BY_ADMIN, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        page: 1,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        ...(statusFilter ? { search: { categoryStatus: statusFilter } } : {})
      }
    },
    onCompleted: (result: T) => {
      setCategoryRows(result?.getAllCategoriesByAdmin?.list ?? []);
      setCategoryTotal(result?.getAllCategoriesByAdmin?.metaData?.total ?? 0);
    },
  });

  const [deleteCategory] = useMutation(DELETE_CATEGORY);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const { order, orderBy, rowsPerPage, filteredList, handleChangePage, handleRequestSort } =
    useMuiTable({ listData: categoryRows, defaultSort: "createdAt", defaultOrder: "desc" });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (category: any) => {
    const confirmed = await sweetConfirmAlert(
      "Delete Category?",
      `Delete "${category.categoryName}"? This action cannot be undone.`,
      "Delete"
    );
    if (!confirmed) return;
    try {
      await deleteCategory({
        variables: { input: category._id }
      });
      const refreshed = await refetch();
      setCategoryRows(refreshed?.data?.getAllCategoriesByAdmin?.list ?? []);
      setCategoryTotal(refreshed?.data?.getAllCategoriesByAdmin?.metaData?.total ?? 0);
      await sweetTopSmallSuccessAlert("Category deleted");
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to delete category");
    }
  }, [deleteCategory, refetch]);

  const handleEditSuccess = useCallback(async () => {
    setEditingCategory(null);
    const refreshed = await refetch();
    setCategoryRows(refreshed?.data?.getAllCategoriesByAdmin?.list ?? []);
    setCategoryTotal(refreshed?.data?.getAllCategoriesByAdmin?.metaData?.total ?? 0);
  }, [refetch]);

  const handleCreateSuccess = useCallback(async () => {
    setCreateDialogOpen(false);
    const refreshed = await refetch();
    setCategoryRows(refreshed?.data?.getAllCategoriesByAdmin?.list ?? []);
    setCategoryTotal(refreshed?.data?.getAllCategoriesByAdmin?.metaData?.total ?? 0);
  }, [refetch]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper title="Product Categories">
      <FlexBox mb={2} gap={2} justifyContent="space-between" flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {CATEGORY_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          color="info"
          fullWidth={downSM}
          variant="contained"
          startIcon={<Add />}
          sx={{ minHeight: 44 }}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Category
        </Button>
      </FlexBox>

      {loading && categoryRows.length === 0 ? (
        <Typography variant="body1">Loading categories...</Typography>
      ) : error && categoryRows.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error.main" sx={{ mb: 1 }}>
            Failed to load categories
          </Typography>
          <Typography color="text.secondary">{error.message}</Typography>
        </Card>
      ) : categoryRows.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No categories found.</Typography>
        </Card>
      ) : (
        <Card>
          <OverlayScrollbar>
            <TableContainer sx={{ minWidth: 600 }}>
              <Table>
                <TableHeader
                  order={order}
                  orderBy={orderBy}
                  heading={tableHeading}
                  onRequestSort={handleRequestSort}
                />

                <TableBody>
                  {filteredList.map((category: any) => (
                    <CategoryRow
                      key={category._id}
                      category={category}
                      onEdit={setEditingCategory}
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
              count={Math.max(1, Math.ceil(categoryTotal / rowsPerPage))}
            />
          </Stack>
        </Card>
      )}

      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent dividers>
          <CategoryForm
            embedded
            onSuccess={handleCreateSuccess}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent dividers>
          {editingCategory ? (
            <CategoryForm
              embedded
              categoryId={editingCategory._id}
              onSuccess={handleEditSuccess}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
