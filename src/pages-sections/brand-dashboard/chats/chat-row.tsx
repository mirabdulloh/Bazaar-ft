import { format } from "date-fns/format";
import Edit from "@mui/icons-material/Edit";
import {
  StatusWrapper,
  StyledIconButton,
  StyledTableCell,
  StyledTableRow
} from "../styles";

type Props = {
  chat: any;
  onStatusChange: (chat: any) => void;
};

export default function ChatRow({ chat, onStatusChange }: Props) {
  const { chatSubject, memberId, brandId, chatStatus, createdAt } = chat;

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left" sx={{ fontWeight: 600, maxWidth: 250 }}>
        {chatSubject || "No subject"}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400, fontFamily: "monospace", fontSize: 12 }}>
        {memberId ? memberId.slice(-8) : "-"}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400, fontFamily: "monospace", fontSize: 12 }}>
        {brandId ? brandId.slice(-8) : "-"}
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={chatStatus === "OPEN" ? "ACTIVE" : chatStatus === "CLOSED" ? "INACTIVE" : "PENDING"}>
          {chatStatus}
        </StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {createdAt ? format(new Date(createdAt), "dd MMM yyyy") : "-"}
      </StyledTableCell>

      <StyledTableCell align="center">
        <StyledIconButton onClick={() => onStatusChange(chat)}>
          <Edit />
        </StyledIconButton>
      </StyledTableCell>
    </StyledTableRow>
  );
}
