"use client";

import { useState, useCallback } from "react";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Add from "@mui/icons-material/Add";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Theme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import FlexBox from "components/flex-box/flex-box";
// GLOBAL CUSTOM COMPONENTS
import OverlayScrollbar from "components/overlay-scrollbar";
import { TableHeader, TablePagination } from "components/data-table";
// GLOBAL CUSTOM HOOK
import useMuiTable from "hooks/useMuiTable";
// LOCAL CUSTOM COMPONENT
import BrandCouponRow from "../coupon-row";
import PageWrapper from "../../page-wrapper";
// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_BRAND_COUPONS } from "../../../../../apollo/brand/query";
import {
  CREATE_BRAND_COUPON,
  UPDATE_BRAND_COUPON
} from "../../../../../apollo/brand/mutation";
import { T } from "lib/types/common";
// ALERTS
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert
} from "lib/sweetAlert";

// TABLE HEADING
const tableHeading = [
  { id: "couponCode", label: "Code", align: "left" },
  { id: "couponStatus", label: "Status", align: "left" },
  { id: "discountValue", label: "Discount", align: "left" },
  { id: "couponUsageCount", label: "Usage", align: "left" },
  { id: "couponStartDate", label: "Start", align: "left" },
  { id: "couponEndDate", label: "End", align: "left" },
  { id: "action", label: "Action", align: "center" }
];

const PAGE_SIZE = 20;
const COUPON_STATUSES = ["ACTIVE", "INACTIVE", "EXPIRED"];
const DISCOUNT_TYPES = ["FIXED", "PERCENTAGE"];

const emptyForm = {
  couponCode: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  couponMaxUsage: "",
  minOrderCount: "",
  couponStartDate: "",
  couponEndDate: ""
};

// =============================================================================

export default function BrandCouponsPageView() {
  const downSM = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Dialog state ───────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const { data, loading, refetch } = useQuery(GET_BRAND_COUPONS, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        page: currentPage,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        ...(statusFilter ? { search: { couponStatus: statusFilter } } : {})
      }
    }
  });

  const [createCoupon, { loading: creating }] = useMutation(CREATE_BRAND_COUPON);
  const [updateCoupon, { loading: updating }] = useMutation(UPDATE_BRAND_COUPON);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const list = (data as T)?.getBrandCoupons?.list ?? [];
  const total = (data as T)?.getBrandCoupons?.metaCounter?.[0]?.total ?? 0;

  const { order, orderBy, handleRequestSort } =
    useMuiTable({ listData: list, defaultSort: "createdAt", defaultOrder: "desc" });

  const handlePageChange = (_: unknown, page: number) => setCurrentPage(page);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const openCreateDialog = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = useCallback((coupon: any) => {
    setEditingCoupon(coupon);
    setForm({
      couponCode: coupon.couponCode || "",
      discountType: coupon.discountType || "PERCENTAGE",
      discountValue: String(coupon.discountValue ?? ""),
      couponMaxUsage: String(coupon.couponMaxUsage ?? ""),
      minOrderCount: String(coupon.minOrderCount ?? ""),
      couponStartDate: coupon.couponStartDate
        ? new Date(coupon.couponStartDate).toISOString().slice(0, 10)
        : "",
      couponEndDate: coupon.couponEndDate
        ? new Date(coupon.couponEndDate).toISOString().slice(0, 10)
        : ""
    });
    setDialogOpen(true);
  }, []);

  const handleClose = () => {
    setDialogOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async () => {
    if (!form.couponCode.trim() || !form.discountValue || !form.couponStartDate || !form.couponEndDate) {
      await sweetMixinErrorAlert("Please fill in all required fields.");
      return;
    }

    try {
      if (editingCoupon) {
        await updateCoupon({
          variables: {
            input: {
              _id: editingCoupon._id,
              couponCode: form.couponCode.trim(),
              discountType: form.discountType,
              discountValue: Number(form.discountValue),
              ...(form.couponMaxUsage ? { couponMaxUsage: Number(form.couponMaxUsage) } : {}),
              ...(form.minOrderCount ? { minOrderCount: Number(form.minOrderCount) } : {}),
              couponStartDate: new Date(form.couponStartDate),
              couponEndDate: new Date(form.couponEndDate)
            }
          }
        });
        await sweetTopSmallSuccessAlert("Coupon updated!");
      } else {
        await createCoupon({
          variables: {
            input: {
              couponCode: form.couponCode.trim(),
              discountType: form.discountType,
              discountValue: Number(form.discountValue),
              ...(form.couponMaxUsage ? { couponMaxUsage: Number(form.couponMaxUsage) } : {}),
              ...(form.minOrderCount ? { minOrderCount: Number(form.minOrderCount) } : {}),
              couponStartDate: new Date(form.couponStartDate),
              couponEndDate: new Date(form.couponEndDate)
            }
          }
        });
        await sweetTopSmallSuccessAlert("Coupon created!");
      }
      handleClose();
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Operation failed");
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper title="My Coupons">
      <FlexBox mb={2} gap={2} justifyContent="space-between" flexWrap="wrap">
        <FlexBox gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <MenuItem value="">All</MenuItem>
              {COUPON_STATUSES.map((s) => (
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
          onClick={openCreateDialog}
          sx={{ minHeight: 44 }}
        >
          Add Coupon
        </Button>
      </FlexBox>

      {loading ? (
        <Typography variant="body1">Loading coupons...</Typography>
      ) : list.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No coupons found.</Typography>
        </Card>
      ) : (
        <Card>
          <OverlayScrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <TableHeader
                  order={order}
                  orderBy={orderBy}
                  heading={tableHeading}
                  onRequestSort={handleRequestSort}
                />

                <TableBody>
                  {list.map((coupon: any) => (
                    <BrandCouponRow
                      key={coupon._id}
                      coupon={coupon}
                      onEdit={openEditDialog}
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

      {/* ─── Create / Edit Dialog ─────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCoupon ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Coupon Code"
                value={form.couponCode}
                onChange={(e) => setForm((f) => ({ ...f, couponCode: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={form.discountType}
                  label="Discount Type"
                  onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
                >
                  {DISCOUNT_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label={form.discountType === "PERCENTAGE" ? "Discount (%)" : "Discount ($)"}
                value={form.discountValue}
                onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Max Usage (optional)"
                value={form.couponMaxUsage}
                onChange={(e) => setForm((f) => ({ ...f, couponMaxUsage: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Min Orders (optional)"
                value={form.minOrderCount}
                onChange={(e) => setForm((f) => ({ ...f, minOrderCount: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} />

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Start Date"
                value={form.couponStartDate}
                onChange={(e) => setForm((f) => ({ ...f, couponStartDate: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="End Date"
                value={form.couponEndDate}
                onChange={(e) => setForm((f) => ({ ...f, couponEndDate: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="info"
            disabled={creating || updating}
          >
            {editingCoupon ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
}
