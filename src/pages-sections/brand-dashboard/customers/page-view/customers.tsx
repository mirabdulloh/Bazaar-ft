"use client";

import { useState, useCallback } from "react";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
// GLOBAL CUSTOM COMPONENTS
import OverlayScrollbar from "components/overlay-scrollbar";
import { TableHeader, TablePagination } from "components/data-table";
import FlexBox from "components/flex-box/flex-box";
// GLOBAL CUSTOM HOOK
import useMuiTable from "hooks/useMuiTable";
// LOCAL CUSTOM COMPONENT
import CustomerRow from "../customer-row";
import PageWrapper from "../../page-wrapper";
// TABLE HEAD COLUMN DATA
import { tableHeading } from "../table-heading";
// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_ALL_MEMBERS_BY_ADMIN } from "../../../../../apollo/admin/query";
import { UPDATE_MEMBER_BY_ADMIN } from "../../../../../apollo/admin/mutation";
import { T } from "lib/types/common";
// ALERTS
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert,
  sweetConfirmAlert
} from "lib/sweetAlert";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;
const MEMBER_STATUSES = ["ACTIVE", "BLOCK", "DELETE"];
const MEMBER_TYPES = ["USER", "BRAND", "ADMIN"];

// =============================================================================

export default function CustomersPageView() {
  // ─── Filters ────────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  // ─── Dialog state ───────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editType, setEditType] = useState("");

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const { data, loading, refetch } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        page: 1,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        search: {
          ...(statusFilter ? { memberStatus: statusFilter } : {}),
          ...(typeFilter ? { memberType: typeFilter } : {})
        }
      }
    }
  });

  const [updateMember, { loading: updating }] = useMutation(UPDATE_MEMBER_BY_ADMIN);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const list = (data as T)?.getAllMembersByAdmin?.members ?? [];
  const total = (data as T)?.getAllMembersByAdmin?.metaData?.total ?? 0;

  const { order, orderBy, rowsPerPage, filteredList, handleChangePage, handleRequestSort } =
    useMuiTable({ listData: list, defaultSort: "createdAt", defaultOrder: "desc" });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const openEditDialog = useCallback((member: any) => {
    setSelectedMember(member);
    setEditStatus(member.memberStatus || "ACTIVE");
    setEditType(member.memberType || "USER");
    setDialogOpen(true);
  }, []);

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedMember(null);
  };

  const handleUpdate = async () => {
    if (!selectedMember) return;
    try {
      await updateMember({
        variables: {
          input: {
            _id: selectedMember._id,
            memberStatus: editStatus,
            memberType: editType
          }
        }
      });
      await sweetTopSmallSuccessAlert("Member updated successfully");
      handleClose();
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update member");
    }
  };

  const handleBlock = useCallback(async (member: any) => {
    const isBlocked = member.memberStatus === "BLOCK";
    const confirmed = await sweetConfirmAlert(
      isBlocked ? "Unblock Member?" : "Block Member?",
      isBlocked
        ? `Unblock "${member.memberNick}"?`
        : `Block "${member.memberNick}"? They will lose access.`,
      isBlocked ? "Unblock" : "Block"
    );
    if (!confirmed) return;

    try {
      await updateMember({
        variables: {
          input: {
            _id: member._id,
            memberStatus: isBlocked ? "ACTIVE" : "BLOCK"
          }
        }
      });
      await sweetTopSmallSuccessAlert(isBlocked ? "Member unblocked" : "Member blocked");
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update member");
    }
  }, [updateMember, refetch]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper title="Customers">
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
            {MEMBER_STATUSES.map((s) => (
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
            {MEMBER_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </FlexBox>

      {loading ? (
        <Typography variant="body1">Loading customers...</Typography>
      ) : list.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No members found.</Typography>
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
                  {filteredList.map((member: any) => (
                    <CustomerRow
                      key={member._id}
                      customer={member}
                      onEdit={openEditDialog}
                      onBlock={handleBlock}
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

      {/* ─── Edit Member Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Edit Member — {selectedMember?.memberNick}
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={editStatus} label="Status" onChange={(e) => setEditStatus(e.target.value)}>
              {MEMBER_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={editType} label="Type" onChange={(e) => setEditType(e.target.value)}>
              {MEMBER_TYPES.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" color="info" disabled={updating}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
}
