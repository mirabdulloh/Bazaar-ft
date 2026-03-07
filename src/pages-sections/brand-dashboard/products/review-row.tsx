import { format } from "date-fns/format";
import Rating from "@mui/material/Rating";
// MUI ICON COMPONENT
import Delete from "@mui/icons-material/Delete";
// GLOBAL CUSTOM COMPONENTS
import BazaarSwitch from "components/BazaarSwitch";
// STYLED COMPONENTS
import { StatusWrapper, StyledIconButton, StyledTableCell, StyledTableRow } from "../styles";

// ========================================================================
type Props = {
  review: any;
  onToggle: (review: any) => void;
  onDelete: (id: string) => void;
};
// ========================================================================

export default function ReviewRow({ review, onToggle, onDelete }: Props) {
  const { _id, reviewComment, reviewRating, reviewStatus, createdAt } = review;

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left" sx={{ fontWeight: 400, maxWidth: 400 }}>
        {reviewComment || "-"}
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
        <BazaarSwitch
          color="info"
          checked={reviewStatus === "ACTIVE"}
          onChange={() => onToggle(review)}
        />
        <StyledIconButton onClick={() => onDelete(_id)}>
          <Delete />
        </StyledIconButton>
      </StyledTableCell>
    </StyledTableRow>
  );
}
