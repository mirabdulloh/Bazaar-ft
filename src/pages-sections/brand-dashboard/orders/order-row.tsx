import { format } from "date-fns/format";
// MUI ICON COMPONENTS
import Edit from "@mui/icons-material/Edit";
// CUSTOM UTILS LIBRARY FUNCTION
import { currency } from "lib";
// STYLED COMPONENTS
import { StatusWrapper, StyledIconButton, StyledTableCell, StyledTableRow } from "../styles";

// ========================================================================
type Props = {
  order: any;
  onEdit: (order: any) => void;
};
// ========================================================================

export default function OrderRow({ order, onEdit }: Props) {
  const {
    _id,
    orderStatus,
    orderPaymentStatus,
    orderDeliveryStatus,
    orderFinalPrice,
    createdAt
  } = order;

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left" sx={{ fontWeight: 600 }}>
        #{_id?.slice(0, 8)}
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={orderStatus}>{orderStatus}</StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={orderPaymentStatus === "PAID" ? "Accepted" : orderPaymentStatus === "FAILED" ? "Rejected" : "Pending"}>
          {orderPaymentStatus}
        </StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={orderDeliveryStatus === "DELIVERED" ? "Delivered" : orderDeliveryStatus === "SHIPPED" ? "Processing" : orderDeliveryStatus === "RETURNED" ? "Rejected" : "Pending"}>
          {orderDeliveryStatus}
        </StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {currency(orderFinalPrice ?? 0)}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {createdAt ? format(new Date(createdAt), "dd MMM yyyy") : "-"}
      </StyledTableCell>

      <StyledTableCell align="center">
        <StyledIconButton onClick={() => onEdit(order)}>
          <Edit />
        </StyledIconButton>
      </StyledTableCell>
    </StyledTableRow>
  );
}
