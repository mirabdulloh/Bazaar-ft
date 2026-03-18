"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FlexBox from "components/flex-box/flex-box";
import { currency } from "lib";
import { format } from "date-fns/format";
import { StyledTableRow, StatusWrapper, StyledTableCell, StyledIconButton } from "../styles";

const QUICK_PRODUCT_STATUSES = ["DRAFT", "PENDING", "ACTIVE", "SOLD_OUT", "HIDDEN", "DELETED"];

function resolveProductImage(productImage?: string | null): string {
  if (!productImage || productImage === "null" || productImage === "undefined") return "";
  if (productImage.startsWith("http://") || productImage.startsWith("https://")) return productImage;

  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const normalized = productImage.startsWith("/") ? productImage : `/${productImage}`;

  if (normalized.startsWith("/assets/") || normalized.startsWith("/img/") || normalized.startsWith("/placeholder/")) {
    return normalized;
  }

  return apiBase ? `${apiBase}${normalized}` : normalized;
}

// ========================================================================
type Props = {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (product: any) => void;
  onStatusChange: (product: any, nextStatus: string) => void;
  updating?: boolean;
};
// ========================================================================

export default function BrandProductRow({ product, onEdit, onDelete, onStatusChange, updating = false }: Props) {
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

  const rawImage = productImages?.[0] || "";
  const image = resolveProductImage(rawImage);

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left">
        <FlexBox alignItems="center" gap={1.5}>
          {image ? (
            <Box
              component="img"
              src={image}
              alt={productTitle}
              sx={{ width: 40, height: 40, borderRadius: 1, objectFit: "cover", flexShrink: 0, bgcolor: "grey.100" }}
            />
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
        <FlexBox flexDirection="column" alignItems="flex-start" gap={1}>
          <StatusWrapper status={productStatus}>{productStatus}</StatusWrapper>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={productStatus}
              disabled={updating}
              onChange={(e) => onStatusChange(product, String(e.target.value))}
            >
              {QUICK_PRODUCT_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </FlexBox>
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
        {productStatus === "DELETED" ? null : (
          <StyledIconButton onClick={() => onDelete(product)}>
            <Delete />
          </StyledIconButton>
        )}
      </StyledTableCell>
    </StyledTableRow>
  );
}
