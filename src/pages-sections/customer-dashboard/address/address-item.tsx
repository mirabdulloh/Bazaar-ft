"use client";

// MUI
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import EditOutlined from "@mui/icons-material/EditOutlined";
// CUSTOM COMPONENTS
import TableRow from "../table-row";
import DeleteAddressBtn from "./delete-btn";
import { T } from "../../../lib/types/common";

// ==============================================================
type Props = { address: T; onEdit: (addr: T) => void; onDeleted: () => void };
// ==============================================================

export default function AddressListItem({ address, onEdit, onDeleted }: Props) {
  const line =
    [address.addressLine1, address.addressCity, address.addressZipCode, address.addressCountry]
      .filter(Boolean)
      .join(", ");

  return (
    <TableRow elevation={0} sx={{ gridTemplateColumns: "2fr 2fr 1fr auto" }}>
      <Box>
        <Typography fontWeight={600} variant="body1" noWrap>
          {address.addressName as string}
        </Typography>
        {address.isDefault && (
          <Chip label="Default" size="small" color="primary" variant="outlined" sx={{ mt: 0.5 }} />
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" noWrap>
        {line}
      </Typography>

      <Typography variant="body2" color="text.secondary" noWrap>
        {address.addressPhone as string}
      </Typography>

      <Box display="flex" alignItems="center">
        <IconButton size="small" onClick={() => onEdit(address)}>
          <EditOutlined fontSize="small" />
        </IconButton>
        <DeleteAddressBtn id={String(address._id)} onDeleted={onDeleted} />
      </Box>
    </TableRow>
  );
}
