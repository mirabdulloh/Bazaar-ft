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
import TextField from "@mui/material/TextField";
// GLOBAL CUSTOM COMPONENTS
import OverlayScrollbar from "components/overlay-scrollbar";
import { TableHeader, TablePagination } from "components/data-table";
import FlexBox from "components/flex-box/flex-box";
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
type Order = "asc" | "desc";

// =============================================================================

export default function BrandsPageView() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [textFilter, setTextFilter] = useState("");
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState<Order>("desc");
  const [brandRows, setBrandRows] = useState<any[]>([]);
  const [brandTotal, setBrandTotal] = useState(0);

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const { loading, error, refetch } = useQuery(GET_ALL_BRANDS_BY_ADMIN, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        page: page + 1,
        limit: PAGE_SIZE,
        sort: orderBy,
        direction: order.toUpperCase(),
        ...(statusFilter || textFilter.trim()
          ? {
              search: {
                ...(statusFilter ? { brandStatus: statusFilter } : {}),
                ...(textFilter.trim() ? { text: textFilter.trim() } : {})
              }
            }
          : {})
      }
    },
    onCompleted: (result: T) => {
      setBrandRows(result?.getAllBrandsByAdmin?.brands ?? []);
      setBrandTotal(result?.getAllBrandsByAdmin?.metaData?.total ?? 0);
    }
  });

  const [updateBrand] = useMutation(UPDATE_BRAND_BY_ADMIN);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const updateBrandStatus = useCallback(async (brand: any, brandStatus: string, successMessage: string) => {
    try {
      await updateBrand({
        variables: { input: { _id: brand._id, brandStatus } }
      });
      await refetch();
      await sweetTopSmallSuccessAlert(successMessage);
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update brand");
    }
  }, [refetch, updateBrand]);

  const handleApprove = useCallback(async (brand: any) => {
    const confirmed = await sweetConfirmAlert(
      "Approve Brand?",
      `Approve "${brand.brandName}" and move it to ACTIVE?`,
      "Approve"
    );
    if (!confirmed) return;
    await updateBrandStatus(brand, "ACTIVE", "Brand approved");
  }, [updateBrandStatus]);

  const handleActivate = useCallback(async (brand: any) => {
    const confirmed = await sweetConfirmAlert(
      "Activate Brand?",
      `Activate "${brand.brandName}" and return it to ACTIVE?`,
      "Activate"
    );
    if (!confirmed) return;
    await updateBrandStatus(brand, "ACTIVE", "Brand activated");
  }, [updateBrandStatus]);

  const handleInactivate = useCallback(async (brand: any) => {
    const confirmed = await sweetConfirmAlert(
      "Inactivate Brand?",
      `Move "${brand.brandName}" to INACTIVE?`,
      "Inactivate"
    );
    if (!confirmed) return;
    await updateBrandStatus(brand, "INACTIVE", "Brand inactivated");
  }, [updateBrandStatus]);

  const handleSuspend = useCallback(async (brand: any) => {
    const confirmed = await sweetConfirmAlert(
      "Suspend Brand?",
      `Suspend "${brand.brandName}" from the marketplace?`,
      "Suspend"
    );
    if (!confirmed) return;
    await updateBrandStatus(brand, "SUSPENDED", "Brand suspended");
  }, [updateBrandStatus]);

  const handleChangePage = useCallback((_: unknown, newPage: number) => {
    setPage(newPage - 1);
  }, []);

  const handleRequestSort = useCallback((property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(0);
  }, [order, orderBy]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper title="Brand List">
      <FlexBox mb={2} gap={2} justifyContent="space-between" flexWrap="wrap">
        <FlexBox gap={2} flexWrap="wrap">
          <TextField
            size="small"
            label="Search brand"
            value={textFilter}
            onChange={(e) => {
              setTextFilter(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: { sm: 260, xs: "100%" } }}
          />

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All</MenuItem>
              {BRAND_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </FlexBox>
      </FlexBox>

      {loading && brandRows.length === 0 ? (
        <Typography variant="body1">Loading brands...</Typography>
      ) : error && brandRows.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error.main" sx={{ mb: 1 }}>
            Failed to load brands
          </Typography>
          <Typography color="text.secondary">
            {error.message}
          </Typography>
        </Card>
      ) : brandRows.length === 0 ? (
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
                  {brandRows.map((brand: any) => (
                    <BrandRow
                      key={brand._id}
                      brand={brand}
                      onApprove={handleApprove}
                      onActivate={handleActivate}
                      onInactivate={handleInactivate}
                      onSuspend={handleSuspend}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </OverlayScrollbar>

          <Stack alignItems="center" my={4}>
            <TablePagination
              onChange={handleChangePage}
              count={Math.max(1, Math.ceil(brandTotal / PAGE_SIZE))}
            />
          </Stack>
        </Card>
      )}
    </PageWrapper>
  );
}
