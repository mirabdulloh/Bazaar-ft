import { format } from "date-fns/format";
import Delete from "@mui/icons-material/Delete";
import {
  StyledIconButton,
  StyledTableCell,
  StyledTableRow
} from "../styles";

type Props = {
  message: any;
  onDelete: (id: string) => void;
};

export default function MessageRow({ message, onDelete }: Props) {
  const { _id, message: content, senderId, conversationId, createdAt } = message;

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left" sx={{ fontWeight: 400, maxWidth: 400 }}>
        {content || "-"}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400, fontSize: 12 }}>
        {senderId ? `#${senderId.slice(0, 8)}` : "-"}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400, fontSize: 12 }}>
        {conversationId ? `#${conversationId.slice(0, 8)}` : "-"}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {createdAt ? format(new Date(createdAt), "dd MMM yyyy HH:mm") : "-"}
      </StyledTableCell>

      <StyledTableCell align="center">
        <StyledIconButton onClick={() => onDelete(_id)}>
          <Delete />
        </StyledIconButton>
      </StyledTableCell>
    </StyledTableRow>
  );
}
