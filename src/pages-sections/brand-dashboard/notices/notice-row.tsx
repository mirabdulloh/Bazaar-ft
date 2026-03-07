import { format } from "date-fns/format";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import {
  CategoryWrapper,
  StatusWrapper,
  StyledIconButton,
  StyledTableCell,
  StyledTableRow
} from "../styles";

type Props = {
  notice: any;
  onEdit: (notice: any) => void;
  onDelete: (id: string) => void;
};

export default function NoticeRow({ notice, onEdit, onDelete }: Props) {
  const { _id, noticeTitle, noticeCategory, noticeStatus, createdAt } = notice;

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left" sx={{ fontWeight: 600, maxWidth: 300 }}>
        {noticeTitle}
      </StyledTableCell>

      <StyledTableCell align="left">
        <CategoryWrapper>{noticeCategory}</CategoryWrapper>
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={noticeStatus}>{noticeStatus}</StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {createdAt ? format(new Date(createdAt), "dd MMM yyyy") : "-"}
      </StyledTableCell>

      <StyledTableCell align="center">
        <StyledIconButton onClick={() => onEdit(notice)}>
          <Edit />
        </StyledIconButton>
        <StyledIconButton onClick={() => onDelete(_id)}>
          <Delete />
        </StyledIconButton>
      </StyledTableCell>
    </StyledTableRow>
  );
}
