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
import BrandRow from "../brand-row";
import PageWrapper from "../../page-wrapper";
// TABLE HEAD COLUMN DATA
import { tableHeading } from "../table-heading";
// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_ALL_BRANDS_BY_ADMIN } from "../../../../../apollo/admin/query";
import { UPDATE_BRAND_BY_ADMIN } from "../../../../../apollo/admin/mutation";
import { T } from "lib/types/common";
// ALERTS
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert,
  sweetConfirmAlert
} from "lib/sweetAlert";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;
const BRAND_STATUSES = ["PENDING", "ACTIVE", "INACTIVE", "SUSPENDED"];

// =============================================================================

export default function BrandsPageView() {
  const downSM = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const [statusFilter, setStatusFilter] = useState<string>("");

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const { data, loading, refetch } = useQuery(GET_ALL_BRANDS_BY_ADMIN, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        page: 1,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        ...(statusFilter ? { search: { brandStatus: statusFilter } } : {})
      }
    }
  });

  const [updateBrand] = useMutation(UPDATE_BRAND_BY_ADMIN);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const list = (data as T)?.getAllBrandsByAdmin?.brands ?? [];
  const total = (data as T)?.getAllBrandsByAdmin?.metaData?.total ?? 0;

  const { order, orderBy, rowsPerPage, filteredList, handleChangePage, handleRequestSort } =
    useMuiTable({ listData: list, defaultSort: "createdAt", defaultOrder: "desc" });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleStatusToggle = useCallback(async (brand: any) => {
    const newStatus = brand.brandStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateBrand({
        variables: { input: { _id: brand._id, brandStatus: newStatus } }
      });
      await sweetTopSmallSuccessAlert(`Brand ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`);
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update brand");
    }
  }, [updateBrand, refetch]);

  const handleDelete = useCallback(async (brand: any) => {
    const confirmed = await sweetConfirmAlert(
      "Suspend Brand?",
      `Suspend "${brand.brandName}"? The brand will be deactivated.`,
      "Suspend"
    );
    if (!confirmed) return;
    try {
      await updateBrand({
        variables: { input: { _id: brand._id, brandStatus: "SUSPENDED" } }
      });
      await sweetTopSmallSuccessAlert("Brand suspended");
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to suspend brand");
    }
  }, [updateBrand, refetch]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper title="Product Brands">
      <FlexBox mb={2} gap={2} justifyContent="space-between" flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {BRAND_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Link href="/admin/brands/create">
          <Button
            color="info"
            fullWidth={downSM}
            variant="contained"
            startIcon={<Add />}
            sx={{ minHeight: 44 }}
          >
            Add Brand
          </Button>
        </Link>
      </FlexBox>

      {loading ? (
        <Typography variant="body1">Loading brands...</Typography>
      ) : list.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No brands found.</Typography>
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
                  {filteredList.map((brand: any) => (
                    <BrandRow
                      key={brand._id}
                      brand={brand}
                      onToggle={handleStatusToggle}
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
