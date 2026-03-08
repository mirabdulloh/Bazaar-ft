"use client";

import Image from "next/image";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Edit from "@mui/icons-material/Edit";
import FlexBox from "components/flex-box/flex-box";
import { currency } from "lib";
import { format } from "date-fns/format";
import { StyledTableRow, StatusWrapper, StyledTableCell, StyledIconButton } from "../styles";

// ========================================================================
type Props = {
  coupon: any;
  onEdit: (coupon: any) => void;
};
// ========================================================================

export default function BrandCouponRow({ coupon, onEdit }: Props) {
  const {
    couponCode,
    discountType,
    discountValue,
    couponMaxUsage,
    couponUsageCount,
    couponStatus,
    couponStartDate,
    couponEndDate,
    createdAt
  } = coupon;

  const discountLabel =
    discountType === "PERCENTAGE" ? `${discountValue}%` : currency(discountValue ?? 0);

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left">
        <Typography variant="h6" fontWeight={600}>{couponCode}</Typography>
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={couponStatus}>{couponStatus}</StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {discountLabel}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {couponUsageCount ?? 0} / {couponMaxUsage ?? "∞"}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {couponStartDate ? format(new Date(couponStartDate), "dd MMM yyyy") : "-"}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {couponEndDate ? format(new Date(couponEndDate), "dd MMM yyyy") : "-"}
      </StyledTableCell>

      <StyledTableCell align="center">
        <StyledIconButton onClick={() => onEdit(coupon)}>
          <Edit />
        </StyledIconButton>
      </StyledTableCell>
    </StyledTableRow>
  );
}
