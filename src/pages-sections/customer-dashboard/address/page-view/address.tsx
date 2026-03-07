"use client";

import { useState, useCallback } from "react";
// MUI
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddLocationAltOutlined from "@mui/icons-material/AddLocationAltOutlined";
// CUSTOM COMPONENTS
import Location from "icons/Location";
import DashboardHeader from "../../dashboard-header";
import AddressListItem from "../address-item";
import AddressForm from "../address-form";
// APOLLO
import { useQuery } from "../../../../lib/hooks/useQuery";
import { GET_ADDRESSES } from "../../../../../apollo/user/query";
import { T } from "../../../../lib/types/common";

export function AddressPageView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<T | null>(null);

  const { data, loading, refetch } = useQuery(GET_ADDRESSES, {
    fetchPolicy: "cache-and-network",
  });

  const addresses: T[] = (data as T)?.getAddresses ?? [];

  const handleAdd = useCallback(() => {
    setEditingAddress(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((addr: T) => {
    setEditingAddress(addr);
    setDialogOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setDialogOpen(false);
    setEditingAddress(null);
  }, []);

  const handleSaved = useCallback(() => {
    handleClose();
    refetch();
  }, [handleClose, refetch]);

  return (
    <Box>
      <DashboardHeader Icon={Location} title="My Addresses" />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddLocationAltOutlined />}
          onClick={handleAdd}
        >
          Add New Address
        </Button>
      </Box>

      {loading && addresses.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      ) : addresses.length === 0 ? (
        <Stack alignItems="center" justifyContent="center" py={8} gap={1.5}>
          <AddLocationAltOutlined sx={{ fontSize: 56, color: "grey.300" }} />
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            No saved addresses
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Add an address to use at checkout.
          </Typography>
          <Button variant="outlined" size="small" onClick={handleAdd} sx={{ mt: 1 }}>
            Add Address
          </Button>
        </Stack>
      ) : (
        addresses.map((addr: T) => (
          <AddressListItem
            key={String(addr._id)}
            address={addr}
            onEdit={handleEdit}
            onDeleted={refetch}
          />
        ))
      )}

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
        <DialogContent>
          <AddressForm address={editingAddress} onSuccess={handleSaved} onCancel={handleClose} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
