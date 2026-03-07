import Link from "next/link";
import { format } from "date-fns/format";
// MUI
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import East from "@mui/icons-material/East";
// LOCAL CUSTOM COMPONENT
import TableRow from "../table-row";
// CUSTOM UTILS LIBRARY FUNCTION
import { currency } from "lib";

// =================================================
type OrderRowData = {
  _id: string;
  orderStatus: string;
  orderFinalPrice: number;
  createdAt: string;
};
type Props = { order: OrderRowData };
// =================================================

const STATUS_COLOR: Record<string, "secondary" | "info" | "success" | "error" | "warning" | "default"> = {
  PENDING: "secondary",
  CONFIRMED: "info",
  SHIPPED: "warning",
  DELIVERED: "success",
  CANCELLED: "error",
  REFUNDED: "default",
};

export default function OrderRow({ order }: Props) {
  const color = STATUS_COLOR[order.orderStatus] ?? "default";
  const label = order.orderStatus.charAt(0) + order.orderStatus.slice(1).toLowerCase();

  return (
    <Link href={`/profile?tab=orders&orderId=${order._id}`}>
      <TableRow elevation={0} sx={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr" }}>
        <Typography noWrap variant="h5">
          #{order._id.substring(0, 18)}
        </Typography>

        <Box textAlign={{ sm: "center", xs: "right" }}>
          <Chip size="small" label={label} color={color} />
        </Box>

        <Typography noWrap variant="body1" sx={{ textAlign: { sm: "center", xs: "left" } }}>
          {format(new Date(order.createdAt), "MMM dd, yyyy")}
        </Typography>

        <Typography variant="body1" fontWeight={500} sx={{ textAlign: { sm: "center", xs: "right" } }}>
          {currency(order.orderFinalPrice)}
        </Typography>

        <Box justifyContent="end" display={{ sm: "inline-flex", xs: "none" }}>
          <IconButton>
            <East className="east" fontSize="small" />
          </IconButton>
        </Box>
      </TableRow>
    </Link>
  );
}
