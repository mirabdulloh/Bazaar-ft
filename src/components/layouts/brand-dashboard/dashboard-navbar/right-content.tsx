import { usePathname } from "next/navigation";
import { useReactiveVar } from "@apollo/client/react";
import Search from "@mui/icons-material/Search";
import Avatar from "@mui/material/Avatar";
import FlexBox from "components/flex-box/flex-box";
import { userVar } from "../../../../../apollo/store";
// LOCAL CUSTOM COMPONENTS
import AccountPopover from "./account-popover";
import NotificationsPopover from "./notification-popover";
// STYLED COMPONENTS
import { StyledInputBase } from "./styles";

export default function RightContent() {
  const pathname = usePathname();
  const user = useReactiveVar(userVar);
  const isAdminDashboard = pathname.startsWith("/admin");
  const isBrandDashboard = pathname.startsWith("/brand");

  return (
    <FlexBox alignItems="center" gap={2}>
      <StyledInputBase
        placeholder="Search anything..."
        startAdornment={<Search sx={{ color: "grey.500" }} />}
      />

      {isAdminDashboard ? (
        <Avatar
          src={user?.memberImage || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.memberNick || "A")}&backgroundColor=6366f1&textColor=ffffff`}
          alt={user?.memberNick || "Admin"}
          sx={{ width: 36, height: 36 }}
        >
          {(user?.memberNick || "A")[0]}
        </Avatar>
      ) : isBrandDashboard ? (
        <>
          <NotificationsPopover />
          <AccountPopover interactive={false} />
        </>
      ) : (
        <>
          <NotificationsPopover />
          <AccountPopover />
        </>
      )}
    </FlexBox>
  );
}
