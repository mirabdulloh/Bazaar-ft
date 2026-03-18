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
import NoticeRow from "../notice-row";
import PageWrapper from "../../page-wrapper";
import { tableHeading } from "../table-heading";

// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_ALL_NOTICES_BY_ADMIN } from "../../../../../apollo/admin/query";
import {
  CREATE_NOTICE_BY_ADMIN,
  UPDATE_NOTICE_BY_ADMIN,
  REMOVE_NOTICE_BY_ADMIN
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
const CATEGORIES = ["GENERAL", "PROMOTION", "SYSTEM", "UPDATE", "OTHER"];
const STATUSES = ["ACTIVE", "INACTIVE", "DELETED"];

const emptyForm = {
  noticeTitle: "",
  noticeContent: "",
  noticeCategory: "GENERAL",
  noticeStatus: "ACTIVE"
};

// =============================================================================

export default function NoticesPageView() {
  const downSM = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  // ─── Dialog state ───────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [noticeRows, setNoticeRows] = useState<any[]>([]);
  const [noticeTotal, setNoticeTotal] = useState(0);

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const { loading, error, refetch } = useQuery(GET_ALL_NOTICES_BY_ADMIN, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        page: 1,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        ...(statusFilter ? { search: { noticeStatus: statusFilter } } : {})
      }
    },
    onCompleted: (result: T) => {
      setNoticeRows(result?.getAllNoticesByAdmin?.list ?? []);
      setNoticeTotal(result?.getAllNoticesByAdmin?.metaCounter?.[0]?.total ?? 0);
    },
  });

  const [createNotice, { loading: creating }] = useMutation(CREATE_NOTICE_BY_ADMIN);
  const [updateNotice, { loading: updating }] = useMutation(UPDATE_NOTICE_BY_ADMIN);
  const [removeNotice] = useMutation(REMOVE_NOTICE_BY_ADMIN);

  // ─── Data mapping ──────────────────────────────────────────────────────────
  const {
    order,
    orderBy,
    rowsPerPage,
    filteredList,
    handleChangePage,
    handleRequestSort
  } = useMuiTable({ listData: noticeRows, defaultSort: "createdAt", defaultOrder: "desc" });

  const syncNoticeState = useCallback((result: T | undefined) => {
    const rows = result?.getAllNoticesByAdmin?.list ?? [];
    const total = result?.getAllNoticesByAdmin?.metaCounter?.[0]?.total ?? 0;
    setNoticeRows(rows);
    setNoticeTotal(total);

    if (!editingNotice?._id) return;
    const refreshedEditingNotice = rows.find((item: any) => item._id === editingNotice._id) ?? null;
    setEditingNotice(refreshedEditingNotice);
  }, [editingNotice]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const openCreateDialog = () => {
    setEditingNotice(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = useCallback((notice: any) => {
    setEditingNotice(notice);
    setForm({
      noticeTitle: notice.noticeTitle || "",
      noticeContent: notice.noticeContent || "",
      noticeCategory: notice.noticeCategory || "GENERAL",
      noticeStatus: notice.noticeStatus || "ACTIVE"
    });
    setDialogOpen(true);
  }, []);

  const handleClose = () => {
    setDialogOpen(false);
    setEditingNotice(null);
  };

  const handleSubmit = async () => {
    if (!form.noticeTitle.trim() || !form.noticeContent.trim()) {
      await sweetMixinErrorAlert("Title and content are required.");
      return;
    }

    try {
      if (editingNotice) {
        await updateNotice({
          variables: {
            input: {
              _id: editingNotice._id,
              noticeTitle: form.noticeTitle,
              noticeContent: form.noticeContent,
              noticeCategory: form.noticeCategory,
              noticeStatus: form.noticeStatus
            }
          }
        });
        await sweetTopSmallSuccessAlert("Notice updated successfully");
      } else {
        await createNotice({
          variables: {
            input: {
              noticeTitle: form.noticeTitle,
              noticeContent: form.noticeContent,
              noticeCategory: form.noticeCategory
            }
          }
        });
        await sweetTopSmallSuccessAlert("Notice created successfully");
      }

      handleClose();
      const refreshed = await refetch();
      syncNoticeState(refreshed.data as T);
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Something went wrong");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateNotice({
        variables: { input: { _id: id, noticeStatus: newStatus } }
      });
      const refreshed = await refetch();
      syncNoticeState(refreshed.data as T);
      await sweetTopSmallSuccessAlert(`Status changed to ${newStatus}`);
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update status");
    }
  };

  const handleDelete = useCallback(async (notice: any) => {
    const confirmed = await sweetConfirmAlert(
      "Delete Notice?",
      "This notice will be permanently removed.",
      "Delete"
    );
    if (!confirmed) return;

    try {
      await removeNotice({ variables: { noticeId: notice._id } });
      const refreshed = await refetch();
      syncNoticeState(refreshed.data as T);
      await sweetTopSmallSuccessAlert("Notice deleted");
    } catch (err: any) {
      if (notice.noticeStatus !== "DELETED") {
        await sweetMixinErrorAlert(
          "This notice cannot be permanently deleted yet. Change its status to DELETED first, then delete it."
        );
        return;
      }
      await sweetMixinErrorAlert(err.message || "Failed to delete notice");
    }
  }, [removeNotice, refetch, syncNoticeState]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper title="Notices">
      {/* Search + Filter + Add Button */}
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
        </FlexBox>

        <Button
          color="info"
          fullWidth={downSM}
          variant="contained"
          startIcon={<Add />}
          onClick={openCreateDialog}
          sx={{ minHeight: 44 }}
        >
          Add Notice
        </Button>
      </FlexBox>

      {loading && noticeRows.length === 0 ? (
        <Typography variant="body1">Loading notices...</Typography>
      ) : error && noticeRows.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error.main" sx={{ mb: 1 }}>
            Failed to load notices
          </Typography>
          <Typography color="text.secondary">{error.message}</Typography>
        </Card>
      ) : noticeRows.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No notices found.</Typography>
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
                  {filteredList.map((notice: any) => (
                    <NoticeRow
                      key={notice._id}
                      notice={notice}
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
              count={Math.max(1, Math.ceil(noticeTotal / rowsPerPage))}
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
          {editingNotice ? "Edit Notice" : "Create Notice"}
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="Title"
            fullWidth
            value={form.noticeTitle}
            onChange={(e) => setForm({ ...form, noticeTitle: e.target.value })}
          />

          <TextField
            label="Content"
            fullWidth
            multiline
            rows={5}
            value={form.noticeContent}
            onChange={(e) => setForm({ ...form, noticeContent: e.target.value })}
          />

          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={form.noticeCategory}
              label="Category"
              onChange={(e) => setForm({ ...form, noticeCategory: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {editingNotice && (
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={form.noticeStatus}
                label="Status"
                onChange={(e) => setForm({ ...form, noticeStatus: e.target.value })}
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
            {editingNotice ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
}
