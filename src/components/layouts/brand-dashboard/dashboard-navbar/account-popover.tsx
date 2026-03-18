import { useState } from "react";
import { useReactiveVar } from "@apollo/client/react";
// MUI
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { GET_MY_BRAND } from "../../../../../apollo/brand/query";
import { useQuery } from "lib/hooks/useQuery";
import { userVar } from "../../../../../apollo/store";
import { T } from "lib/types/common";

// STYLED COMPONENT
const Divider = styled("div")(({ theme }) => ({
  margin: "0.5rem 0",
  border: `1px dashed ${theme.palette.grey[200]}`
}));

function resolveImage(img?: string | null): string {
  if (!img || img === "null" || img === "undefined") return "";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
  const normalized = img.startsWith("/") ? img : `/${img}`;
  return apiBase ? `${apiBase}${normalized}` : normalized;
}

type Props = {
  interactive?: boolean;
};

export default function AccountPopover({ interactive = true }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const user = useReactiveVar(userVar);
  const { data, loading } = useQuery(GET_MY_BRAND, {
    fetchPolicy: "cache-and-network",
    skip: user?.memberType !== "BRAND",
  });

  const brand = (data as T)?.getMyBrand;
  const avatarSrc = resolveImage(brand?.brandLogo || user?.memberImage || "");
  const displayName = brand?.brandName || user?.memberNick || "Brand";
  const displayRole = brand?.brandStatus || user?.memberType || "BRAND";

  const handleClose = () => setAnchorEl(null);

  if (!interactive) {
    return (
      <Avatar alt={displayName} src={avatarSrc}>
        {displayName?.[0] || "B"}
      </Avatar>
    );
  }

  return (
    <div>
      <IconButton
        sx={{ padding: 0 }}
        aria-haspopup="true"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-expanded={open ? "true" : undefined}
        aria-controls={open ? "account-menu" : undefined}
      >
        <Avatar alt={displayName} src={avatarSrc}>
          {displayName?.[0] || "B"}
        </Avatar>
      </IconButton>

      <Menu
        open={open}
        id="account-menu"
        anchorEl={anchorEl}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1,
              boxShadow: 2,
              minWidth: 200,
              borderRadius: "8px",
              overflow: "visible",
              border: "1px solid",
              borderColor: "grey.200",
              "& .MuiMenuItem-root:hover": {
                backgroundColor: "grey.200"
              },
              "&:before": {
                top: 0,
                right: 14,
                zIndex: 0,
                width: 10,
                height: 10,
                content: '""',
                display: "block",
                position: "absolute",
                borderTop: "1px solid",
                borderLeft: "1px solid",
                borderColor: "grey.200",
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)"
              }
            }
          }
        }}
      >
        <Box px={2} pt={1}>
          <Typography variant="h6">
            {displayName}
          </Typography>
          <Typography variant="body1" sx={{ fontSize: 12, color: "grey.500" }}>
            {loading ? <CircularProgress size={10} /> : String(displayRole)}
          </Typography>
        </Box>

        <Divider />
        <MenuItem>Profile</MenuItem>
        <MenuItem>My Orders</MenuItem>
        <MenuItem>Settings</MenuItem>
        <Divider />
        <MenuItem>Logout</MenuItem>
      </Menu>
    </div>
  );
}
