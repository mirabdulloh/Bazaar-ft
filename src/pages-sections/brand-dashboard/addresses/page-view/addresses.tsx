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
import AddressRow from "../address-row";
import PageWrapper from "../../page-wrapper";
import { tableHeading } from "../table-heading";
// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_ALL_ADDRESSES_BY_ADMIN } from "../../../../../apollo/admin/query";
import { UPDATE_ADDRESS_BY_ADMIN } from "../../../../../apollo/admin/mutation";
import { T } from "lib/types/common";
// ALERTS
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert
} from "lib/sweetAlert";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;
const ADDRESS_STATUSES = ["ACTIVE", "INACTIVE", "DELETED"];

// =============================================================================

export default function AddressesPageView() {
  // ─── Filters ────────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<string>("");

  // ─── Dialog state ───────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [editStatus, setEditStatus] = useState("");

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const { data, loading, refetch } = useQuery(GET_ALL_ADDRESSES_BY_ADMIN, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        page: 1,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        ...(statusFilter ? { search: { addressStatus: statusFilter } } : {})
      }
    }
  });

  const [updateAddress, { loading: updating }] = useMutation(UPDATE_ADDRESS_BY_ADMIN);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const list = (data as T)?.getAllAddressesByAdmin?.list ?? [];
  const total = (data as T)?.getAllAddressesByAdmin?.metaData?.total ?? 0;

  const { order, orderBy, rowsPerPage, filteredList, handleChangePage, handleRequestSort } =
    useMuiTable({ listData: list, defaultSort: "createdAt", defaultOrder: "desc" });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const openEditDialog = useCallback((address: any) => {
    setSelectedAddress(address);
    setEditStatus(address.addressStatus || "ACTIVE");
    setDialogOpen(true);
  }, []);

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedAddress(null);
  };

  const handleUpdate = async () => {
    if (!selectedAddress) return;
    try {
      await updateAddress({
        variables: {
          input: {
            _id: selectedAddress._id,
            addressStatus: editStatus
          }
        }
      });
      await sweetTopSmallSuccessAlert("Address status updated");
      handleClose();
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update address");
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper title="Addresses">
      {/* Filter */}
      <FlexBox mb={2} gap={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {ADDRESS_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </FlexBox>

      {loading ? (
        <Typography variant="body1">Loading addresses...</Typography>
      ) : list.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No addresses found.</Typography>
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
                  {filteredList.map((address: any) => (
                    <AddressRow
                      key={address._id}
                      address={address}
                      onEdit={openEditDialog}
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

      {/* ─── Edit Status Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Update Address — {selectedAddress?.addressName}
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={editStatus} label="Status" onChange={(e) => setEditStatus(e.target.value)}>
              {ADDRESS_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
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
