import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
function resolveImg(img?: string | null): string {
  if (!img || img === "null" || img === "undefined") return "";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const normalized = img.startsWith("/") ? img : `/${img}`;
  return API_URL ? `${API_URL}${normalized}` : normalized;
}
import Typography from "@mui/material/Typography";
// MUI ICON COMPONENTS
import Delete from "@mui/icons-material/Delete";
// GLOBAL CUSTOM COMPONENTS
import FlexBox from "components/flex-box/flex-box";
// CUSTOM UTILS LIBRARY FUNCTION
import { currency } from "lib";
import { format } from "date-fns/format";
// STYLED COMPONENTS
import { StyledTableRow, StatusWrapper, StyledTableCell, StyledIconButton } from "../styles";

// ========================================================================
type Props = {
  product: any;
  onDelete: (product: any) => void;
};
// ========================================================================

export default function ProductRow({ product, onDelete }: Props) {
  const {
    _id,
    productTitle,
    productStatus,
    productPrice,
    productStockQuantity,
    productViews,
    productImages,
    createdAt
  } = product;

  const image = resolveImg(productImages?.[0]);

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left">
        <FlexBox alignItems="center" gap={1.5}>
          {image ? (
            <Avatar
              variant="rounded"
              src={image}
              alt={productTitle}
              sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                bgcolor: "grey.100",
                "& .MuiAvatar-img": {
                  objectFit: "cover"
                }
              }}
            />
          ) : (
            <Avatar variant="rounded">
              <Box component="span" sx={{ fontSize: 14, fontWeight: 700 }}>
                {productTitle?.[0] || "P"}
              </Box>
            </Avatar>
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
        {productStatus === "DELETED" ? (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        ) : (
          <StyledIconButton onClick={() => onDelete(product)}>
            <Delete />
          </StyledIconButton>
        )}
      </StyledTableCell>
    </StyledTableRow>
  );
}
