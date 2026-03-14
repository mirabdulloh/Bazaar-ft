import { format } from "date-fns/format";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Typography from "@mui/material/Typography";
import {
  CategoryWrapper,
  StatusWrapper,
  StyledIconButton,
  StyledTableCell,
  StyledTableRow
} from "../styles";

type Props = {
  coupon: any;
  onEdit: (coupon: any) => void;
  onDelete: (id: string) => void;
};

export default function CouponRow({ coupon, onEdit, onDelete }: Props) {
  const {
    _id,
    couponCode,
    couponType,
    discountType,
    discountValue,
    couponMaxUsage,
    couponUsageCount,
    couponStartDate,
    couponEndDate,
    couponStatus
  } = coupon;

  const discountLabel =
    discountType === "PERCENTAGE"
      ? `${discountValue}%`
      : `$${Number(discountValue).toLocaleString()}`;

  const formatDate = (d: string) => {
    try {
      return format(new Date(d), "MM/dd/yy");
    } catch {
      return "-";
    }
  };

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left" sx={{ fontWeight: 600, fontFamily: "monospace", letterSpacing: 0.5 }}>
        {couponCode}
      </StyledTableCell>

      <StyledTableCell align="left">
        <CategoryWrapper>{couponType}</CategoryWrapper>
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 500 }}>
        <Typography component="span" variant="body2" fontWeight={600}>
          {discountLabel}
        </Typography>
        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
          ({discountType})
        </Typography>
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {couponUsageCount ?? 0} / {couponMaxUsage ?? "∞"}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400, whiteSpace: "nowrap" }}>
        {formatDate(couponStartDate)} — {formatDate(couponEndDate)}
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={couponStatus}>{couponStatus}</StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="center">
        <StyledIconButton onClick={() => onEdit(coupon)}>
          <Edit />
        </StyledIconButton>
        <StyledIconButton onClick={() => onDelete(_id)}>
          <Delete />
        </StyledIconButton>
      </StyledTableCell>
    </StyledTableRow>
  );
}
