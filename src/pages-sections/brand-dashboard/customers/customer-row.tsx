import Image from "next/image";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
// MUI ICON COMPONENTS
import Edit from "@mui/icons-material/Edit";
import Block from "@mui/icons-material/Block";
import CheckCircle from "@mui/icons-material/CheckCircle";
// GLOBAL CUSTOM COMPONENTS
import FlexBox from "components/flex-box/flex-box";
// STYLED COMPONENTS
import { StatusWrapper, CategoryWrapper, StyledIconButton, StyledTableCell, StyledTableRow } from "../styles";

// ========================================================================
type Props = {
  customer: any;
  onEdit: (member: any) => void;
  onBlock: (member: any) => void;
};
// ========================================================================

export default function CustomerRow({ customer, onEdit, onBlock }: Props) {
  const {
    memberNick,
    memberPhone,
    memberEmail,
    memberImage,
    memberType,
    memberStatus,
    memberPoints
  } = customer;

  const avatar =
    memberImage && String(memberImage).trim().length > 0
      ? memberImage
      : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(memberNick ?? "U")}&backgroundColor=6366f1&textColor=ffffff`;

  const isBlocked = memberStatus === "BLOCK";

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left">
        <FlexBox alignItems="center" gap={1.5}>
          <Avatar variant="rounded">
            <Image fill src={avatar} alt={memberNick ?? "User"} sizes="(60px, 60px)" />
          </Avatar>

          <Typography variant="h6">{memberNick ?? "Unknown"}</Typography>
        </FlexBox>
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {memberPhone ?? "-"}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {memberEmail ?? "-"}
      </StyledTableCell>

      <StyledTableCell align="left">
        <CategoryWrapper>{memberType}</CategoryWrapper>
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={memberStatus}>{memberStatus}</StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {memberPoints ?? 0}
      </StyledTableCell>

      <StyledTableCell align="center">
        <StyledIconButton onClick={() => onEdit(customer)}>
          <Edit />
        </StyledIconButton>

        <StyledIconButton onClick={() => onBlock(customer)}>
          {isBlocked ? <CheckCircle /> : <Block />}
        </StyledIconButton>
      </StyledTableCell>
    </StyledTableRow>
  );
}
