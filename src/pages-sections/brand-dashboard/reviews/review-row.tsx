"use client";

import { format } from "date-fns/format";
import Avatar from "@mui/material/Avatar";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import RemoveRedEye from "@mui/icons-material/RemoveRedEye";
import FlexBox from "components/flex-box/flex-box";
import { StyledIconButton, StyledTableCell, StyledTableRow } from "../styles";

export interface BrandReviewRowData {
  _id: string;
  reviewRating: number;
  reviewComment: string;
  reviewImages?: string[];
  createdAt?: string;
  memberData?: {
    _id?: string;
    memberNick?: string;
    memberImage?: string;
  };
  productTitle: string;
  productImage?: string;
}

type Props = {
  review: BrandReviewRowData;
  onView: (review: BrandReviewRowData) => void;
};

export default function ReviewRow({ review, onView }: Props) {
  const previewComment =
    review.reviewComment && review.reviewComment.length > 80
      ? `${review.reviewComment.slice(0, 80)}...`
      : review.reviewComment || "-";

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left">
        <FlexBox alignItems="center" gap={1.5}>
          <Avatar
            variant="rounded"
            src={review.productImage || undefined}
            alt={review.productTitle}
            sx={{ width: 52, height: 52 }}
          >
            {review.productTitle?.slice(0, 1)?.toUpperCase() || "P"}
          </Avatar>

          <Typography variant="h6">{review.productTitle}</Typography>
        </FlexBox>
      </StyledTableCell>

      <StyledTableCell align="left">
        {review.memberData?.memberNick || "-"}
      </StyledTableCell>

      <StyledTableCell align="left">{previewComment}</StyledTableCell>

      <StyledTableCell align="left">
        <FlexBox alignItems="center" gap={1}>
          <Rating value={review.reviewRating ?? 0} size="small" readOnly />
          <Typography variant="body2">{review.reviewRating ?? 0}</Typography>
        </FlexBox>
      </StyledTableCell>

      <StyledTableCell align="left">
        {review.createdAt ? format(new Date(review.createdAt), "dd MMM yyyy") : "-"}
      </StyledTableCell>

      <StyledTableCell align="center">
        <StyledIconButton onClick={() => onView(review)}>
          <RemoveRedEye />
        </StyledIconButton>
      </StyledTableCell>
    </StyledTableRow>
  );
}
