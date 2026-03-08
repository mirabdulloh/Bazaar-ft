"use client";

import Image from "next/image";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import FlexBox from "components/flex-box/flex-box";
import { currency } from "lib";
import { format } from "date-fns/format";
import { StyledTableRow, StatusWrapper, StyledTableCell, StyledIconButton } from "../styles";

// ========================================================================
type Props = {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (product: any) => void;
};
// ========================================================================

export default function BrandProductRow({ product, onEdit, onDelete }: Props) {
  const {
    _id,
    productTitle,
    productStatus,
    productPrice,
    productDiscountPrice,
    productStockQuantity,
    productViews,
    productImages,
    createdAt
  } = product;

  const image = productImages?.[0] || "";

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left">
        <FlexBox alignItems="center" gap={1.5}>
          {image ? (
            <Avatar variant="rounded">
              <Image fill src={image} alt={productTitle} sizes="(100%, 100%)" />
            </Avatar>
          ) : (
            <Avatar variant="rounded">{productTitle?.[0] || "P"}</Avatar>
          )}

          <div>
            <Typography variant="h6">{productTitle}</Typography>
            <Typography variant="body1" sx={{ fontSize: 12, color: "grey.600" }}>
              #{_id?.slice(0, 8)}
            </Typography>
          </div>
        </FlexBox>
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={productStatus}>{productStatus}</StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {currency(productPrice ?? 0)}
        {productDiscountPrice ? (
          <Typography variant="body2" color="error.main" fontSize={11}>
            Sale: {currency(productDiscountPrice)}
          </Typography>
        ) : null}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {productStockQuantity ?? 0}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {productViews ?? 0}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {createdAt ? format(new Date(createdAt), "dd MMM yyyy") : "-"}
      </StyledTableCell>

      <StyledTableCell align="center">
        <StyledIconButton onClick={() => onEdit(product)}>
          <Edit />
        </StyledIconButton>
        <StyledIconButton onClick={() => onDelete(product)}>
          <Delete />
        </StyledIconButton>
      </StyledTableCell>
    </StyledTableRow>
  );
}
