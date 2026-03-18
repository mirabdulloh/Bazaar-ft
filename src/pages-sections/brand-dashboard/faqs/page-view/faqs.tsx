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
import FaqRow from "../faq-row";
import PageWrapper from "../../page-wrapper";
import { tableHeading } from "../table-heading";

// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_ALL_FAQS_BY_ADMIN } from "../../../../../apollo/admin/query";
import {
  CREATE_FAQ_BY_ADMIN,
  UPDATE_FAQ_BY_ADMIN,
  REMOVE_FAQ_BY_ADMIN
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
const CATEGORIES = ["GENERAL", "PRODUCTS", "ORDERS", "PAYMENTS", "SHIPPING", "ACCOUNT", "OTHER"];
const STATUSES = ["ACTIVE", "INACTIVE", "DELETED"];

const emptyForm = {
  faqQuestion: "",
  faqAnswer: "",
  faqCategory: "GENERAL",
  faqStatus: "ACTIVE"
};

// =============================================================================

export default function FaqsPageView() {
  const downSM = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  // ─── Dialog state ───────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [faqRows, setFaqRows] = useState<any[]>([]);
  const [faqTotal, setFaqTotal] = useState(0);

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const searchObj: any = {};
  if (statusFilter) searchObj.faqStatus = statusFilter;
  if (categoryFilter) searchObj.faqCategory = categoryFilter;

  const { loading, error, refetch } = useQuery(GET_ALL_FAQS_BY_ADMIN, {
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
    },
    onCompleted: (result: T) => {
      setFaqRows(result?.getAllFaqsByAdmin?.list ?? []);
      setFaqTotal(result?.getAllFaqsByAdmin?.metaCounter?.[0]?.total ?? 0);
    },
  });

  const [createFaq, { loading: creating }] = useMutation(CREATE_FAQ_BY_ADMIN);
  const [updateFaq, { loading: updating }] = useMutation(UPDATE_FAQ_BY_ADMIN);
  const [removeFaq] = useMutation(REMOVE_FAQ_BY_ADMIN);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const {
    order,
    orderBy,
    rowsPerPage,
    filteredList,
    handleChangePage,
    handleRequestSort
  } = useMuiTable({ listData: faqRows, defaultSort: "createdAt", defaultOrder: "desc" });

  const syncFaqState = useCallback((result: T | undefined) => {
    const rows = result?.getAllFaqsByAdmin?.list ?? [];
    const total = result?.getAllFaqsByAdmin?.metaCounter?.[0]?.total ?? 0;
    setFaqRows(rows);
    setFaqTotal(total);

    if (!editingFaq?._id) return;
    const refreshedEditingFaq = rows.find((item: any) => item._id === editingFaq._id) ?? null;
    setEditingFaq(refreshedEditingFaq);
  }, [editingFaq]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const openCreateDialog = () => {
    setEditingFaq(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = useCallback((faq: any) => {
    setEditingFaq(faq);
    setForm({
      faqQuestion: faq.faqQuestion || "",
      faqAnswer: faq.faqAnswer || "",
      faqCategory: faq.faqCategory || "GENERAL",
      faqStatus: faq.faqStatus || "ACTIVE"
    });
    setDialogOpen(true);
  }, []);

  const handleClose = () => {
    setDialogOpen(false);
    setEditingFaq(null);
  };

  const handleSubmit = async () => {
    if (!form.faqQuestion.trim() || !form.faqAnswer.trim()) {
      await sweetMixinErrorAlert("Question and answer are required.");
      return;
    }

    try {
      if (editingFaq) {
        await updateFaq({
          variables: {
            input: {
              _id: editingFaq._id,
              faqQuestion: form.faqQuestion,
              faqAnswer: form.faqAnswer,
              faqCategory: form.faqCategory,
              faqStatus: form.faqStatus
            }
          }
        });
        await sweetTopSmallSuccessAlert("FAQ updated successfully");
      } else {
        await createFaq({
          variables: {
            input: {
              faqQuestion: form.faqQuestion,
              faqAnswer: form.faqAnswer,
              faqCategory: form.faqCategory
            }
          }
        });
        await sweetTopSmallSuccessAlert("FAQ created successfully");
      }

      handleClose();
      const refreshed = await refetch();
      syncFaqState(refreshed.data as T);
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Something went wrong");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateFaq({
        variables: { input: { _id: id, faqStatus: newStatus } }
      });
      const refreshed = await refetch();
      syncFaqState(refreshed.data as T);
      await sweetTopSmallSuccessAlert(`Status changed to ${newStatus}`);
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update status");
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    const confirmed = await sweetConfirmAlert(
      "Delete FAQ?",
      "This FAQ will be permanently removed.",
      "Delete"
    );
    if (!confirmed) return;

    try {
      await removeFaq({ variables: { faqId: id } });
      const refreshed = await refetch();
      syncFaqState(refreshed.data as T);
      await sweetTopSmallSuccessAlert("FAQ deleted");
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to delete FAQ");
    }
  }, [removeFaq, refetch, syncFaqState]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper title="FAQs">
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
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
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
          Add FAQ
        </Button>
      </FlexBox>

      {loading && faqRows.length === 0 ? (
        <Typography variant="body1">Loading FAQs...</Typography>
      ) : error && faqRows.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error.main" sx={{ mb: 1 }}>
            Failed to load FAQs
          </Typography>
          <Typography color="text.secondary">{error.message}</Typography>
        </Card>
      ) : faqRows.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No FAQs found.</Typography>
        </Card>
      ) : (
        <Card>
          <OverlayScrollbar>
            <TableContainer sx={{ minWidth: 700 }}>
              <Table>
                <TableHeader
                  order={order}
                  orderBy={orderBy}
                  heading={tableHeading}
                  onRequestSort={handleRequestSort}
                />

                <TableBody>
                  {filteredList.map((faq: any) => (
                    <FaqRow
                      key={faq._id}
                      faq={faq}
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
              count={Math.max(1, Math.ceil(faqTotal / rowsPerPage))}
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
          {editingFaq ? "Edit FAQ" : "Create FAQ"}
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="Question"
            fullWidth
            value={form.faqQuestion}
            onChange={(e) => setForm({ ...form, faqQuestion: e.target.value })}
          />

          <TextField
            label="Answer"
            fullWidth
            multiline
            rows={5}
            value={form.faqAnswer}
            onChange={(e) => setForm({ ...form, faqAnswer: e.target.value })}
          />

          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={form.faqCategory}
              label="Category"
              onChange={(e) => setForm({ ...form, faqCategory: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {editingFaq && (
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={form.faqStatus}
                label="Status"
                onChange={(e) => setForm({ ...form, faqStatus: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
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
            {editingFaq ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
}
