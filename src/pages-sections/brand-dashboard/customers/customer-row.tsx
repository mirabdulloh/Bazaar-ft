import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
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

  const resolveMemberImage = (img?: string | null): string => {
    if (!img || img === "null" || img === "undefined" || img.trim() === "") {
      return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(memberNick ?? "U")}&backgroundColor=6366f1&textColor=ffffff`;
    }
    if (img.startsWith("http://") || img.startsWith("https://")) return img;

    const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
    const normalized = img.startsWith("/") ? img : `/${img}`;
    return apiBase ? `${apiBase}${normalized}` : normalized;
  };

  const avatar = resolveMemberImage(memberImage);

  const isBlocked = memberStatus === "BLOCK";

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left">
        <FlexBox alignItems="center" gap={1.5}>
          <Avatar
            variant="rounded"
            src={avatar}
            alt={memberNick ?? "User"}
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              bgcolor: "grey.100",
              "& .MuiAvatar-img": {
                objectFit: "cover"
              }
            }}
          >
            <Box component="span" sx={{ fontSize: 14, fontWeight: 700 }}>
              {(memberNick ?? "U").slice(0, 2).toUpperCase()}
            </Box>
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
