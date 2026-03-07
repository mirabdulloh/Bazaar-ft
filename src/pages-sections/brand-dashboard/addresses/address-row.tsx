import Edit from "@mui/icons-material/Edit";
import Chip from "@mui/material/Chip";
import {
  StatusWrapper,
  StyledIconButton,
  StyledTableCell,
  StyledTableRow
} from "../styles";

type Props = {
  address: any;
  onEdit: (address: any) => void;
};

export default function AddressRow({ address, onEdit }: Props) {
  const {
    addressName,
    addressPhone,
    addressCity,
    addressLine1,
    addressLine2,
    addressStatus,
    isDefault
  } = address;

  const fullAddress = [addressLine1, addressLine2].filter(Boolean).join(", ");

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left" sx={{ fontWeight: 600 }}>
        {addressName || "-"}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {addressPhone || "-"}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {addressCity || "-"}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400, maxWidth: 250 }}>
        {fullAddress || "-"}
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={addressStatus}>{addressStatus}</StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="center">
        {isDefault ? (
          <Chip label="Default" color="info" size="small" />
        ) : (
          "-"
        )}
      </StyledTableCell>

      <StyledTableCell align="center">
        <StyledIconButton onClick={() => onEdit(address)}>
          <Edit />
        </StyledIconButton>
      </StyledTableCell>
    </StyledTableRow>
  );
}
