// MUI ICON COMPONENTS
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
// STYLED COMPONENTS
import { StyledTableRow, CategoryWrapper, StyledTableCell, StyledIconButton, StatusWrapper } from "../styles";

// ========================================================================
type Props = {
  category: any;
  onEdit: (category: any) => void;
  onDelete: (category: any) => void;
};
// ========================================================================

export default function CategoryRow({ category, onEdit, onDelete }: Props) {
  const { _id, categoryName, categoryStatus, parentCategoryId, createdAt } = category;

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left">
        <CategoryWrapper>{categoryName}</CategoryWrapper>
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={categoryStatus}>
          {categoryStatus}
        </StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="left">
        {parentCategoryId || "—"}
      </StyledTableCell>

      <StyledTableCell align="left">
        {createdAt ? new Date(Number(createdAt)).toLocaleDateString() : "—"}
      </StyledTableCell>

      <StyledTableCell align="center">
        <StyledIconButton onClick={() => onEdit(category)}>
          <Edit />
        </StyledIconButton>

        <StyledIconButton onClick={() => onDelete(category)}>
          <Delete />
        </StyledIconButton>
      </StyledTableCell>
    </StyledTableRow>
  );
}
