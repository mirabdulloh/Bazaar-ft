import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns/format";
// MUI
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
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

type Props = { order: T };

export default function OrderedProducts({ order }: Props) {
  const items: T[] = (order.orderItems as T[]) ?? [];
  const isDelivered = order.orderDeliveryStatus === "DELIVERED";
  const itemsCount = items.reduce((sum, item) => sum + Number(item.itemQuantity ?? 0), 0);

  return (
    <Card
      elevation={0}
      sx={{
        mb: 4,
        p: 0,
        overflow: "hidden",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200"
      }}
    >
      <FlexBetween px={3} py={2} flexWrap="wrap" gap={1.5} bgcolor="grey.50">
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Ordered Products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {itemsCount} item{itemsCount === 1 ? "" : "s"} in this order
          </Typography>
        </Box>

        <FlexBox gap={1} flexWrap="wrap">
          <MetaChip label={`Order #${String(order._id).slice(-8).toUpperCase()}`} />
          <MetaChip label={`Placed ${format(new Date(order.createdAt as string), "dd MMM, yyyy")}`} />
          <MetaChip
            label={
              isDelivered && order.updatedAt
                ? `Delivered ${format(new Date(order.updatedAt as string), "dd MMM, yyyy")}`
                : "Not delivered yet"
            }
          />
        </FlexBox>
      </FlexBetween>

      <Divider />

      {items.map((item: T) => {
        const product = item.product as T | undefined;
        const imgSrc = resolveImage((product?.productImages as string[])?.[0]);
        const name = (product?.productTitle as string) ?? `Product #${String(item.productId).slice(-6)}`;
        const price = Number(item.priceAtPurchase ?? 0);
        const qty = Number(item.itemQuantity ?? 1);
        const lineTotal = price * qty;
        const selectedSize = String(item.selectedSize ?? "").trim();
        const selectedColor = String(item.selectedColor ?? "").trim();
        const hasVariantSnapshot = !!(selectedSize || selectedColor);

        return (
          <Box
            key={String(item._id)}
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2.25,
              borderBottom: "1px solid",
              borderColor: "grey.100",
              "&:last-child": { borderBottom: 0 }
            }}
          >
            <FlexBetween gap={2} flexWrap="wrap" alignItems="stretch">
              <FlexBox gap={2} alignItems="flex-start" flex="1 1 460px">
                <Avatar
                  variant="rounded"
                  sx={{
                    height: 92,
                    width: 92,
                    borderRadius: 2,
                    backgroundColor: "grey.50",
                    position: "relative",
                    flexShrink: 0
                  }}
                >
                  {imgSrc ? (
                    <Image fill alt={name} src={imgSrc} sizes="92px" style={{ objectFit: "cover" }} />
                  ) : null}
                </Avatar>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.35 }}>
                    {name}
                  </Typography>

                  <FlexBox gap={0.75} flexWrap="wrap" sx={{ mt: 1 }}>
                    <Chip label={`Qty ${qty}`} size="small" sx={{ fontWeight: 600 }} />
                    <Chip label={`Unit ${currency(price)}`} size="small" variant="outlined" />
                    <Chip label={`Line total ${currency(lineTotal)}`} size="small" variant="outlined" />
                    {selectedSize && <Chip label={`Size ${selectedSize}`} size="small" variant="outlined" />}
                    {selectedColor && <Chip label={`Color ${selectedColor}`} size="small" variant="outlined" />}
                  </FlexBox>

                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.25 }}>
                    Purchased on {format(new Date(item.createdAt as string), "dd MMM yyyy")}
                  </Typography>
                  {!hasVariantSnapshot && (
                    <Typography variant="caption" color="warning.main" sx={{ display: "block", mt: 0.5 }}>
                      Exact chosen size and color were not saved with this order.
                    </Typography>
                  )}
                </Box>
              </FlexBox>

              <FlexBox
                gap={1}
                flexWrap="wrap"
                sx={{
                  alignItems: "center",
                  justifyContent: { xs: "flex-start", sm: "flex-end" },
                  minWidth: { xs: "100%", sm: 180 }
                }}
              >
                {product?._id && (
                  <Link href={`/products/${product._id}`} style={{ textDecoration: "none" }}>
                    <Button size="small" variant="outlined">
                      View Product
                    </Button>
                  </Link>
                )}
              </FlexBox>
            </FlexBetween>
          </Box>
        );
      })}
    </Card>
  );
}

function MetaChip({ label }: { label: string }) {
  return (
    <Chip
      label={label}
      size="small"
      variant="outlined"
      sx={{
        fontWeight: 600,
        bgcolor: "background.paper"
      }}
    />
  );
}
