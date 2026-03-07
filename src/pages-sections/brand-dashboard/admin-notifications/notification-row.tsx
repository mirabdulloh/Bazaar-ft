import { format } from "date-fns/format";
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
  notification: any;
  onDelete: (id: string) => void;
};

export default function NotificationRow({ notification, onDelete }: Props) {
  const {
    _id,
    notificationTitle,
    notificationType,
    notificationStatus,
    receiverId,
    createdAt
  } = notification;

  const truncated =
    notificationTitle && notificationTitle.length > 50
      ? notificationTitle.slice(0, 50) + "..."
      : notificationTitle || "—";

  const statusMap: Record<string, string> = {
    UNREAD: "PENDING",
    READ: "ACTIVE",
    ARCHIVED: "INACTIVE"
  };

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left" sx={{ fontWeight: 600, maxWidth: 300 }}>
        <Tooltip title={notificationTitle || ""} placement="top-start" arrow>
          <span>{truncated}</span>
        </Tooltip>
      </StyledTableCell>

      <StyledTableCell align="left">
        <CategoryWrapper>{notificationType}</CategoryWrapper>
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={statusMap[notificationStatus] || notificationStatus}>
          {notificationStatus}
        </StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400, fontFamily: "monospace", fontSize: 12 }}>
        {receiverId ? receiverId.slice(-8) : "-"}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {createdAt ? format(new Date(createdAt), "dd MMM yyyy") : "-"}
      </StyledTableCell>

      <StyledTableCell align="center">
        <StyledIconButton onClick={() => onDelete(_id)}>
          <Delete />
        </StyledIconButton>
      </StyledTableCell>
    </StyledTableRow>
  );
}
