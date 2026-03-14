"use client";

import { Fragment } from "react";
import { format } from "date-fns/format";
// MUI
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Done from "@mui/icons-material/Done";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import ReplayOutlined from "@mui/icons-material/ReplayOutlined";
// GLOBAL CUSTOM COMPONENTS
import { T } from "../../../lib/types/common";
import {
  DetailSectionCard,
  OrderStepsScroller,
  OrderStepsRow,
  OrderStepItem,
  OrderStepAvatar,
  OrderStepCheckBadge,
} from "./styles";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    key: "PENDING",
    label: "Order Placed",
    desc: "Your order has been placed and is waiting for the brand to confirm it.",
    Icon: Inventory2Outlined,
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    desc: "The brand has confirmed your order and is preparing it for shipment.",
    Icon: VerifiedOutlined,
  },
  {
    key: "SHIPPED",
    label: "Shipped",
    desc: "The brand has shipped your package. Mark it as received once it arrives.",
    Icon: LocalShippingOutlined,
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    desc: "You confirmed that the order was received and the order is now complete.",
    Icon: HomeOutlined,
  },
];

const STATUS_INDEX: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  SHIPPED: 2,
  DELIVERED: 3,
};

const TERMINAL: Record<string, { label: string; severity: "error" | "warning"; Icon: React.ElementType }> = {
  CANCELLED: { label: "Order Cancelled", severity: "error", Icon: CancelOutlined },
  REFUNDED: { label: "Order Refunded", severity: "warning", Icon: ReplayOutlined },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

type Props = { order: T };

export default function OrderProgress({ order }: Props) {
  const status = (order.orderStatus as string) ?? "PENDING";
  const terminal = TERMINAL[status] ?? null;
  const currentIndex = STATUS_INDEX[status] ?? 0;

  const fmtDate = (d: unknown, withTime = false): string | null => {
    if (!d) return null;
    try {
      return format(new Date(d as string), withTime ? "dd MMM yyyy, HH:mm" : "dd MMM yyyy");
    } catch {
      return null;
    }
  };

  const getStepDate = (idx: number): string | null => {
    if (idx === 0) return fmtDate(order.createdAt);
    if (!terminal && idx === currentIndex) return fmtDate(order.updatedAt);
    return null;
  };

  return (
    <DetailSectionCard>
      {/* ── Terminal state banner ── */}
      {terminal && (
        <Alert
          severity={terminal.severity}
          icon={<terminal.Icon fontSize="small" />}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="body2" fontWeight={700}>
            {terminal.label}
          </Typography>
          {order.updatedAt && (
            <Typography variant="caption" display="block" sx={{ mt: 0.25 }}>
              {fmtDate(order.updatedAt, true)}
            </Typography>
          )}
        </Alert>
      )}

      {/* ── Step icons ── */}
      <OrderStepsScroller>
      <OrderStepsRow>
        {STEPS.map((step, idx) => {
          const { label, Icon } = step;
          const isDone = !terminal && idx < currentIndex;
          const isActive = !terminal && idx === currentIndex;
          const avatarClass = isDone ? "done" : isActive ? "active" : "idle";
          const stepDate = getStepDate(idx);

          return (
            <Fragment key={step.key}>
              <OrderStepItem>
                <Box position="relative">
                  <OrderStepAvatar className={avatarClass}>
                    <Icon color="inherit" fontSize="large" />
                  </OrderStepAvatar>

                  {isDone && (
                    <OrderStepCheckBadge>
                      <Done color="inherit" />
                    </OrderStepCheckBadge>
                  )}
                </Box>

                <Typography
                  variant="caption"
                  fontWeight={isActive ? 700 : 500}
                  color={isActive ? "primary.main" : "text.secondary"}
                  textAlign="center"
                  sx={{ lineHeight: 1.3, maxWidth: 76 }}
                >
                  {label}
                </Typography>

                {stepDate && (
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    textAlign="center"
                    sx={{ fontSize: "0.65rem", lineHeight: 1.2 }}
                  >
                    {stepDate}
                  </Typography>
                )}
              </OrderStepItem>

              {idx < STEPS.length - 1 && (
                <Box className="line" bgcolor={isDone ? "primary.main" : "grey.100"} />
              )}
            </Fragment>
          );
        })}
      </OrderStepsRow>
      </OrderStepsScroller>

      {/* ── Current status description ── */}
      {!terminal && (
        <Box
          sx={{
            mt: 2.5,
            px: 2,
            py: 1.5,
            bgcolor: "primary.50",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "primary.light",
          }}
        >
          <Typography variant="body2" fontWeight={700} color="primary.main">
            {STEPS[currentIndex]?.label ?? status}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {STEPS[currentIndex]?.desc ?? ""}
          </Typography>
        </Box>
      )}
    </DetailSectionCard>
  );
}
