"use client";

import { useState, useCallback } from "react";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import FlexBox from "components/flex-box/flex-box";

// GLOBAL CUSTOM COMPONENTS
import OverlayScrollbar from "components/overlay-scrollbar";
import { TableHeader, TablePagination } from "components/data-table";

// GLOBAL CUSTOM HOOK
import useMuiTable from "hooks/useMuiTable";

// LOCAL CUSTOM COMPONENT
import ChatRow from "../chat-row";
import PageWrapper from "../../page-wrapper";
import { tableHeading } from "../table-heading";

// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_ALL_CHATS_BY_ADMIN } from "../../../../../apollo/admin/query";
import { UPDATE_CHAT_BY_ADMIN } from "../../../../../apollo/admin/mutation";
import { T } from "lib/types/common";

// ALERTS
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert } from "lib/sweetAlert";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;
const CHAT_STATUSES = ["OPEN", "CLOSED", "PENDING"];

// =============================================================================

export default function ChatsPageView() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [editingChat, setEditingChat] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const { data, loading, refetch } = useQuery(GET_ALL_CHATS_BY_ADMIN, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        page: 1,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        ...(statusFilter ? { search: { chatStatus: statusFilter } } : {})
      }
    }
  });

  const [updateChat, { loading: updating }] = useMutation(UPDATE_CHAT_BY_ADMIN);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const list = (data as T)?.getAllChatsByAdmin?.list ?? [];
  const total = (data as T)?.getAllChatsByAdmin?.metaCounter?.total ?? 0;

  const {
    order,
    orderBy,
    rowsPerPage,
    filteredList,
    handleChangePage,
    handleRequestSort
  } = useMuiTable({ listData: list, defaultSort: "createdAt", defaultOrder: "desc" });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const openStatusDialog = useCallback((chat: any) => {
    setEditingChat(chat);
    setNewStatus(chat.chatStatus);
    setDialogOpen(true);
  }, []);

  const handleClose = () => {
    setDialogOpen(false);
    setEditingChat(null);
  };

  const handleStatusUpdate = async () => {
    if (!editingChat) return;

    try {
      await updateChat({
        variables: { input: { _id: editingChat._id, chatStatus: newStatus } }
      });
      await sweetTopSmallSuccessAlert(`Chat status changed to ${newStatus}`);
      handleClose();
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update chat");
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper title="Chats">
      {/* Filters */}
      <FlexBox mb={2} gap={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {CHAT_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </FlexBox>

      {loading ? (
        <Typography variant="body1">Loading chats...</Typography>
      ) : list.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No chats found.</Typography>
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
                  {filteredList.map((chat: any) => (
                    <ChatRow
                      key={chat._id}
                      chat={chat}
                      onStatusChange={openStatusDialog}
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

      {/* ─── Status Change Dialog ────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Update Chat Status</DialogTitle>

        <DialogContent sx={{ pt: "16px !important" }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Subject: <strong>{editingChat?.chatSubject || "No subject"}</strong>
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {CHAT_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            color="info"
            disabled={updating}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
}
