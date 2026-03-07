"use client";

import { useCallback } from "react";
import IconButton from "@mui/material/IconButton";
import Trash from "icons/Trash";
// APOLLO
import { useMutation } from "@apollo/client/react";
import { DELETE_ADDRESS } from "../../../../apollo/user/mutation";
// UTILS
import { sweetConfirmAlert, sweetMixinErrorAlert } from "lib/sweetAlert";

export default function DeleteAddressBtn({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [deleteAddress, { loading }] = useMutation(DELETE_ADDRESS);

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const confirmed = await sweetConfirmAlert(
        "Delete address?",
        "This address will be permanently removed.",
        "Yes, delete"
      );
      if (!confirmed) return;

      try {
        await deleteAddress({ variables: { input: id } });
        onDeleted();
      } catch (err: any) {
        sweetMixinErrorAlert(err.message ?? "Failed to delete address.");
      }
    },
    [id, deleteAddress, onDeleted]
  );

  return (
    <IconButton size="small" onClick={handleDelete} disabled={loading}>
      <Trash fontSize="small" color="error" />
    </IconButton>
  );
}
