import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
// GLOBAL CUSTOM COMPONENTS
import FlexBetween from "components/flex-box/flex-between";
// CUSTOM UTILS LIBRARY FUNCTION
import { currency } from "lib";
import { T } from "../../../lib/types/common";

// ==============================================================
type Props = { order: T };
// ==============================================================

const PAYMENT_LABEL: Record<string, string> = {
  CASH: "Cash on Delivery",
  CARD: "Card",
};

export default function OrderSummery({ order }: Props) {
  const addr = order.deliveryAddress as T | undefined;
  const payLabel = PAYMENT_LABEL[(order.orderPaymentMethod as string) ?? ""] ?? (order.orderPaymentMethod as string) ?? "—";

  const addressText = addr
    ? [addr.addressLine1, addr.addressLine2, addr.addressCity, addr.addressZipCode, addr.addressCountry]
        .filter(Boolean)
        .join(", ")
    : "—";

  return (
    <Grid container spacing={3}>
      <Grid size={{ md: 6, xs: 12 }}>
        <Card elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "grey.100" }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Shipping Address
          </Typography>
          {addr?.addressName && (
            <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
              {addr.addressName as string}
            </Typography>
          )}
          <Typography variant="body1" color="text.secondary">
            {addressText}
          </Typography>
          {addr?.addressPhone && (
            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
              {addr.addressPhone as string}
            </Typography>
          )}
        </Card>
      </Grid>

      <Grid size={{ md: 6, xs: 12 }}>
        <Card elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "grey.100" }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Total Summary
          </Typography>

          <ListItem title="Subtotal:" value={currency(order.orderTotalPrice as number ?? 0)} />
          {(order.orderTotalDiscountPrice as number) > 0 && (
            <ListItem title="Discount:" value={`-${currency(order.orderTotalDiscountPrice as number)}`} />
          )}
          <ListItem title="Shipping:" value={currency(0)} />

          <Divider sx={{ mb: 1 }} />

          <FlexBetween mb={2}>
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6">{currency(order.orderFinalPrice as number ?? 0)}</Typography>
          </FlexBetween>

          <Chip
            size="small"
            label={payLabel}
            variant="outlined"
            color="primary"
            sx={{ fontWeight: 600 }}
          />
        </Card>
      </Grid>
    </Grid>
  );
}

function ListItem({ title, value }: { title: string; value: string }) {
  return (
    <FlexBetween mb={1}>
      <Typography color="text.secondary" variant="body1">{title}</Typography>
      <Typography variant="h6">{value}</Typography>
    </FlexBetween>
  );
}
