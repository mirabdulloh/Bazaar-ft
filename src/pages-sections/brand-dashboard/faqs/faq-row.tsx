import { format } from "date-fns/format";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import {
  CategoryWrapper,
  StatusWrapper,
  StyledIconButton,
  StyledTableCell,
  StyledTableRow
} from "../styles";

type Props = {
  faq: any;
  onEdit: (faq: any) => void;
  onDelete: (faq: any) => void;
};

export default function FaqRow({ faq, onEdit, onDelete }: Props) {
  const { faqQuestion, faqCategory, faqStatus, createdAt } = faq;

  const truncated =
    faqQuestion && faqQuestion.length > 70
      ? faqQuestion.slice(0, 70) + "..."
      : faqQuestion;

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left" sx={{ fontWeight: 600, maxWidth: 350 }}>
        <Tooltip title={faqQuestion} placement="top-start" arrow>
          <span>{truncated}</span>
        </Tooltip>
      </StyledTableCell>

      <StyledTableCell align="left">
        <CategoryWrapper>{faqCategory}</CategoryWrapper>
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={faqStatus}>{faqStatus}</StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {createdAt ? format(new Date(createdAt), "dd MMM yyyy") : "-"}
      </StyledTableCell>

      <StyledTableCell align="center">
        <StyledIconButton onClick={() => onEdit(faq)}>
          <Edit />
        </StyledIconButton>
        <StyledIconButton onClick={() => onDelete(faq)}>
          <Delete />
        </StyledIconButton>
      </StyledTableCell>
    </StyledTableRow>
  );
}
