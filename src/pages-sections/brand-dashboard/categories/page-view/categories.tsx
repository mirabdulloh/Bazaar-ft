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
import useMediaQuery from "@mui/material/useMediaQuery";
import { Theme } from "@mui/material/styles";
import Link from "next/link";
// GLOBAL CUSTOM COMPONENTS
import OverlayScrollbar from "components/overlay-scrollbar";
import { TableHeader, TablePagination } from "components/data-table";
import FlexBox from "components/flex-box/flex-box";
// GLOBAL CUSTOM HOOK
import useMuiTable from "hooks/useMuiTable";
// LOCAL CUSTOM COMPONENT
import CategoryRow from "../category-row";
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

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const { data, loading, refetch } = useQuery(GET_ALL_CATEGORIES_BY_ADMIN, {
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
    }
  });

  const [deleteCategory] = useMutation(DELETE_CATEGORY);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const list = (data as T)?.getAllCategoriesByAdmin?.list ?? [];
  const total = (data as T)?.getAllCategoriesByAdmin?.metaData?.total ?? 0;

  const { order, orderBy, rowsPerPage, filteredList, handleChangePage, handleRequestSort } =
    useMuiTable({ listData: list, defaultSort: "createdAt", defaultOrder: "desc" });

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
      await sweetTopSmallSuccessAlert("Category deleted");
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to delete category");
    }
  }, [deleteCategory, refetch]);

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

        <Link href="/admin/categories/create">
          <Button
            color="info"
            fullWidth={downSM}
            variant="contained"
            startIcon={<Add />}
            sx={{ minHeight: 44 }}
          >
            Add Category
          </Button>
        </Link>
      </FlexBox>

      {loading ? (
        <Typography variant="body1">Loading categories...</Typography>
      ) : list.length === 0 ? (
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
              count={Math.ceil(total / rowsPerPage)}
            />
          </Stack>
        </Card>
      )}
    </PageWrapper>
  );
}
