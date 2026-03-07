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
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Grid from "@mui/material/Grid";
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
import CouponRow from "../coupon-row";
import PageWrapper from "../../page-wrapper";
import { tableHeading } from "../table-heading";

// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_ALL_COUPONS_BY_ADMIN } from "../../../../../apollo/admin/query";
import {
  CREATE_COUPON_BY_ADMIN,
  UPDATE_COUPON_BY_ADMIN,
  REMOVE_COUPON_BY_ADMIN
} from "../../../../../apollo/admin/mutation";
import { T } from "lib/types/common";

// ALERTS
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert,
  sweetConfirmAlert
} from "lib/sweetAlert";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;
const COUPON_TYPES = ["PLATFORM", "BRAND"];
const DISCOUNT_TYPES = ["FIXED", "PERCENTAGE"];
const STATUSES = ["ACTIVE", "INACTIVE", "EXPIRED"];

const todayStr = new Date().toISOString().slice(0, 10);
const nextMonthStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const emptyForm = {
  couponCode: "",
  couponType: "PLATFORM",
  discountType: "PERCENTAGE",
  discountValue: "",
  couponMaxUsage: "",
  minOrderCount: "",
  couponStartDate: todayStr,
  couponEndDate: nextMonthStr
};

// =============================================================================

export default function CouponsPageView() {
  const downSM = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  // ─── Dialog state ───────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const searchObj: any = {};
  if (statusFilter) searchObj.couponStatus = statusFilter;
  if (typeFilter) searchObj.couponType = typeFilter;

  const { data, loading, refetch } = useQuery(GET_ALL_COUPONS_BY_ADMIN, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        page: 1,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        ...(Object.keys(searchObj).length > 0 ? { search: searchObj } : {})
      }
    }
  });

  const [createCoupon, { loading: creating }] = useMutation(CREATE_COUPON_BY_ADMIN);
  const [updateCoupon, { loading: updating }] = useMutation(UPDATE_COUPON_BY_ADMIN);
  const [removeCoupon] = useMutation(REMOVE_COUPON_BY_ADMIN);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const list = (data as T)?.getAllCouponsByAdmin?.list ?? [];
  const total = (data as T)?.getAllCouponsByAdmin?.metaCounter?.total ?? 0;

  const {
    order,
    orderBy,
    rowsPerPage,
    filteredList,
    handleChangePage,
    handleRequestSort
  } = useMuiTable({ listData: list, defaultSort: "createdAt", defaultOrder: "desc" });

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
      couponType: coupon.couponType || "PLATFORM",
      discountType: coupon.discountType || "PERCENTAGE",
      discountValue: coupon.discountValue?.toString() || "",
      couponMaxUsage: coupon.couponMaxUsage?.toString() || "",
      minOrderCount: coupon.minOrderCount?.toString() || "",
      couponStartDate: coupon.couponStartDate
        ? new Date(coupon.couponStartDate).toISOString().slice(0, 10)
        : todayStr,
      couponEndDate: coupon.couponEndDate
        ? new Date(coupon.couponEndDate).toISOString().slice(0, 10)
        : nextMonthStr
    });
    setDialogOpen(true);
  }, []);

  const handleClose = () => {
    setDialogOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async () => {
    if (!form.couponCode.trim()) {
      await sweetMixinErrorAlert("Coupon code is required.");
      return;
    }
    if (!form.discountValue || Number(form.discountValue) <= 0) {
      await sweetMixinErrorAlert("Discount value must be greater than 0.");
      return;
    }

    try {
      const payload: any = {
        couponCode: form.couponCode.toUpperCase(),
        couponType: form.couponType,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        couponStartDate: new Date(form.couponStartDate).toISOString(),
        couponEndDate: new Date(form.couponEndDate).toISOString()
      };

      if (form.couponMaxUsage) payload.couponMaxUsage = Number(form.couponMaxUsage);
      if (form.minOrderCount) payload.minOrderCount = Number(form.minOrderCount);

      if (editingCoupon) {
        await updateCoupon({
          variables: { input: { _id: editingCoupon._id, ...payload } }
        });
        await sweetTopSmallSuccessAlert("Coupon updated successfully");
      } else {
        await createCoupon({ variables: { input: payload } });
        await sweetTopSmallSuccessAlert("Coupon created successfully");
      }

      handleClose();
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Something went wrong");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateCoupon({
        variables: { input: { _id: id, couponStatus: newStatus } }
      });
      await sweetTopSmallSuccessAlert(`Status changed to ${newStatus}`);
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update status");
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    const confirmed = await sweetConfirmAlert(
      "Delete Coupon?",
      "This coupon will be permanently removed.",
      "Delete"
    );
    if (!confirmed) return;

    try {
      await removeCoupon({ variables: { input: id } });
      await sweetTopSmallSuccessAlert("Coupon deleted");
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to delete coupon");
    }
  }, [removeCoupon, refetch]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper title="Coupons">
      {/* Filters + Add Button */}
      <FlexBox mb={2} gap={2} justifyContent="space-between" flexWrap="wrap">
        <FlexBox gap={2} flexWrap="wrap" flex={1}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {COUPON_TYPES.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
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
            <TableContainer sx={{ minWidth: 900 }}>
              <Table>
                <TableHeader
                  order={order}
                  orderBy={orderBy}
                  heading={tableHeading}
                  onRequestSort={handleRequestSort}
                />

                <TableBody>
                  {filteredList.map((coupon: any) => (
                    <CouponRow
                      key={coupon._id}
                      coupon={coupon}
                      onEdit={openEditDialog}
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

      {/* ─── Create / Edit Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingCoupon ? "Edit Coupon" : "Create Coupon"}
        </DialogTitle>

        <DialogContent sx={{ pt: "16px !important" }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Coupon Code"
                fullWidth
                value={form.couponCode}
                onChange={(e) =>
                  setForm({ ...form, couponCode: e.target.value.toUpperCase() })
                }
                inputProps={{ style: { fontFamily: "monospace", letterSpacing: 1 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Coupon Type</InputLabel>
                <Select
                  value={form.couponType}
                  label="Coupon Type"
                  onChange={(e) => setForm({ ...form, couponType: e.target.value })}
                >
                  {COUPON_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={form.discountType}
                  label="Discount Type"
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                >
                  {DISCOUNT_TYPES.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={form.discountType === "PERCENTAGE" ? "Discount (%)" : "Discount (₩)"}
                fullWidth
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Max Usage (optional)"
                fullWidth
                type="number"
                value={form.couponMaxUsage}
                onChange={(e) => setForm({ ...form, couponMaxUsage: e.target.value })}
                helperText="Leave empty for unlimited"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Min Order Count (optional)"
                fullWidth
                type="number"
                value={form.minOrderCount}
                onChange={(e) => setForm({ ...form, minOrderCount: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                value={form.couponStartDate}
                onChange={(e) => setForm({ ...form, couponStartDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="End Date"
                type="date"
                fullWidth
                value={form.couponEndDate}
                onChange={(e) => setForm({ ...form, couponEndDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            {editingCoupon && (
              <Grid size={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editingCoupon.couponStatus}
                    label="Status"
                    onChange={(e) =>
                      handleStatusChange(editingCoupon._id, e.target.value)
                    }
                  >
                    {STATUSES.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
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
