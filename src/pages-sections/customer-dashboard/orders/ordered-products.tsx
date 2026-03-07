import Image from "next/image";
import { format } from "date-fns/format";
// MUI
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
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

        const parseVariants = (val: string[] | string | undefined | null): string[] => {
          if (!val) return [];
          const arr = Array.isArray(val) ? val : val.split(/[,/|]/);
          return [...new Set(arr.map((v) => v.trim()).filter(Boolean))];
        };
        const sizes = parseVariants(product?.productSize as string[] | string | undefined);
        const colors = parseVariants(product?.productColor as string[] | string | undefined);

        return (
          <FlexBetween px={2} py={1.5} flexWrap="wrap" key={ind} gap={1} sx={{ borderBottom: "1px solid", borderColor: "grey.100", "&:last-child": { borderBottom: 0 } }}>
            <FlexBox gap={2} alignItems="flex-start">
              <Avatar variant="rounded" sx={{ height: 64, width: 64, backgroundColor: "grey.50", position: "relative", flexShrink: 0 }}>
                {imgSrc ? (
                  <Image fill alt={name} src={imgSrc} sizes="64px" style={{ objectFit: "cover" }} />
                ) : null}
              </Avatar>

              <Box>
                <Typography noWrap variant="h6">{name}</Typography>
                {(sizes.length > 0 || colors.length > 0) && (
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5, mb: 0.5 }}>
                    {sizes.map((s) => (
                      <Chip key={s} label={`Size: ${s}`} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                    ))}
                    {colors.map((c) => (
                      <Chip key={c} label={`Color: ${c}`} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                    ))}
                  </Box>
                )}
                <Typography lineHeight={2} variant="body1" color="text.secondary">
                  {currency(price)} × {qty}
                </Typography>
              </Box>
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
