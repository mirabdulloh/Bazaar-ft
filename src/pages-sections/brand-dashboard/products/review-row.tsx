import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { format } from "date-fns/format";
import Rating from "@mui/material/Rating";
// MUI ICON COMPONENT
import Delete from "@mui/icons-material/Delete";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
// GLOBAL CUSTOM COMPONENTS
import BazaarSwitch from "components/BazaarSwitch";
import FlexBox from "components/flex-box/flex-box";
// STYLED COMPONENTS
import { StatusWrapper, StyledIconButton, StyledTableCell, StyledTableRow } from "../styles";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

function resolveImg(img?: string | null): string {
  if (!img || img === "null" || img === "undefined") return "";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const normalized = img.startsWith("/") ? img : `/${img}`;
  return API_URL ? `${API_URL}${normalized}` : normalized;
}

// ========================================================================
type Props = {
  review: any;
  onView: (review: any) => void;
  onToggle: (review: any) => void;
  onDelete: (review: any) => void;
};
// ========================================================================

export default function ReviewRow({ review, onView, onToggle, onDelete }: Props) {
  const { _id, reviewRating, reviewStatus, createdAt } = review;
  const productData = review?.productData ?? review?.productDataSnapshot;
  const memberData = review?.memberData ?? review?.memberDataSnapshot;

  const productTitle = productData?.productTitle || "Unknown Product";
  const productImage = resolveImg(productData?.productImages?.[0]);
  const reviewerName = memberData?.memberNick || memberData?.memberFullName || "Unknown User";
  const reviewerEmail = memberData?.memberEmail || "";
  const reviewerImage = resolveImg(memberData?.memberImage);
  const reviewerInitials = reviewerName.slice(0, 2).toUpperCase() || "U";

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left">
        <FlexBox alignItems="center" gap={1.5}>
          {productImage ? (
            <Avatar
              variant="rounded"
              src={productImage}
              alt={productTitle}
              sx={{ width: 40, height: 40, flexShrink: 0, bgcolor: "grey.100" }}
            />
          ) : (
            <Avatar variant="rounded" sx={{ width: 40, height: 40 }}>
              <Box component="span" sx={{ fontSize: 14, fontWeight: 700 }}>
                {productTitle?.[0] || "P"}
              </Box>
            </Avatar>
          )}

          <div>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              {productTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
              #{productData?._id?.slice(0, 8) || _id?.slice(0, 8)}
            </Typography>
          </div>
        </FlexBox>
      </StyledTableCell>

      <StyledTableCell align="left">
        <FlexBox alignItems="center" gap={1.25}>
          {reviewerImage ? (
            <Avatar src={reviewerImage} alt={reviewerName} sx={{ width: 36, height: 36 }} />
          ) : (
            <Avatar sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 700 }}>
              {reviewerInitials}
            </Avatar>
          )}

          <div>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              {reviewerName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
              {reviewerEmail || "-"}
            </Typography>
          </div>
        </FlexBox>
      </StyledTableCell>

      <StyledTableCell align="left">
        <Rating value={reviewRating ?? 0} size="small" color="warning" readOnly />
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={reviewStatus}>{reviewStatus}</StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {createdAt ? format(new Date(createdAt), "dd MMM yyyy") : "-"}
      </StyledTableCell>

      <StyledTableCell align="center">
        <StyledIconButton onClick={() => onView(review)}>
          <VisibilityOutlined />
        </StyledIconButton>

        {reviewStatus === "DELETED" ? null : (
          <BazaarSwitch
            color="info"
            checked={reviewStatus === "ACTIVE"}
            onChange={() => onToggle(review)}
          />
        )}

        <StyledIconButton onClick={() => onDelete(review)}>
          <Delete />
        </StyledIconButton>
      </StyledTableCell>
    </StyledTableRow>
  );
}
