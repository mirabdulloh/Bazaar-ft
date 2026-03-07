import Image from "next/image";
import { format } from "date-fns/format";
// MUI
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
// GLOBAL CUSTOM COMPONENTS
import { FlexBetween, FlexBox } from "components/flex-box";
// CUSTOM UTILS LIBRARY FUNCTION
import { currency } from "lib";
import { T } from "../../../lib/types/common";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function resolveImage(img?: string | null): string {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  return `${API_URL}/${img}`;
}

// ==============================================================
type Props = { order: T };
// ==============================================================

export default function OrderedProducts({ order }: Props) {
  const items: T[] = (order.orderItems as T[]) ?? [];
  const isDelivered = order.orderDeliveryStatus === "DELIVERED";

  return (
    <Card elevation={0} sx={{ p: 0, mb: 4, border: "1px solid", borderColor: "grey.100" }}>
      <FlexBetween px={3} py={2} flexWrap="wrap" gap={1} bgcolor="grey.50">
        <Item title="Order ID:" value={String(order._id).substring(0, 20)} />
        <Item title="Placed on:" value={format(new Date(order.createdAt as string), "dd MMM, yyyy")} />
        <Item
          title="Delivered on:"
          value={isDelivered && order.updatedAt ? format(new Date(order.updatedAt as string), "dd MMM, yyyy") : "None"}
        />
      </FlexBetween>

      {items.map((item: T, ind: number) => {
        const product = item.product as T | undefined;
        const imgSrc = resolveImage((product?.productImages as string[])?.[0]);
        const name = (product?.productTitle as string) ?? `Product #${String(item.productId).slice(-6)}`;
        const price = item.priceAtPurchase as number;
        const qty = item.itemQuantity as number;

        return (
          <FlexBetween px={2} py={1} flexWrap="wrap" key={ind} gap={1}>
            <FlexBox gap={2} alignItems="center">
              <Avatar variant="rounded" sx={{ height: 60, width: 60, backgroundColor: "grey.50", position: "relative" }}>
                {imgSrc ? (
                  <Image fill alt={name} src={imgSrc} sizes="60px" style={{ objectFit: "cover" }} />
                ) : null}
              </Avatar>

              <div>
                <Typography noWrap variant="h6">{name}</Typography>
                <Typography lineHeight={2} variant="body1" color="text.secondary">
                  {currency(price)} × {qty}
                </Typography>
              </div>
            </FlexBox>

            <Typography variant="body1" fontWeight={600}>
              {currency(price * qty)}
            </Typography>
          </FlexBetween>
        );
      })}
    </Card>
  );
}

function Item({ title, value }: { title: string; value: string }) {
  return (
    <FlexBox gap={1} alignItems="center">
      <Typography variant="body1" color="text.secondary">{title}</Typography>
      <Typography variant="body1">{value}</Typography>
    </FlexBox>
  );
}
