"use client";

import { Fragment } from "react";
import { format } from "date-fns/format";
// MUI
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import Done from "@mui/icons-material/Done";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import ReplayOutlined from "@mui/icons-material/ReplayOutlined";
// GLOBAL CUSTOM COMPONENTS
import { FlexBetween } from "components/flex-box";
import { T } from "../../../lib/types/common";
import { DetailSectionCard } from "./styles";

// ─── STYLED ──────────────────────────────────────────────────────────────────

const StepRow = styled(FlexBetween)(({ theme }) => ({
  alignItems: "flex-start",
  flexWrap: "wrap",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "center",
  },
  "& .line": {
    height: 2,
    minWidth: 40,
    flex: "1 1 0",
    alignSelf: "flex-start",
    marginTop: 31,
    [theme.breakpoints.down("sm")]: {
      flex: "unset",
      width: 2,
      height: 28,
      minWidth: "unset",
      marginTop: 0,
      alignSelf: "unset",
    },
  },
}));

const StatusAvatar = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  transition: "all 0.3s ease",
  "&.done": {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
  },
  "&.active": {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
    boxShadow: `0 0 0 4px ${theme.palette.primary.light}`,
  },
  "&.idle": {
    color: theme.palette.text.disabled,
    backgroundColor: theme.palette.grey[100],
  },
}));

const CheckBadge = styled(Avatar)(({ theme }) => ({
  top: -4,
  right: -4,
  width: 20,
  height: 20,
  position: "absolute",
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.primary.light,
  boxShadow: theme.shadows[1],
  "& svg": { fontSize: 14 },
}));

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
      <StepRow>
        {STEPS.map((step, idx) => {
          const { label, Icon } = step;
          const isDone = !terminal && idx < currentIndex;
          const isActive = !terminal && idx === currentIndex;
          const avatarClass = isDone ? "done" : isActive ? "active" : "idle";
          const stepDate = getStepDate(idx);

          return (
            <Fragment key={step.key}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, minWidth: 76 }}>
                <Box position="relative">
                  <StatusAvatar className={avatarClass}>
                    <Icon color="inherit" fontSize="large" />
                  </StatusAvatar>

                  {isDone && (
                    <CheckBadge>
                      <Done color="inherit" />
                    </CheckBadge>
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
              </Box>

              {idx < STEPS.length - 1 && (
                <Box className="line" bgcolor={isDone ? "primary.main" : "grey.100"} />
              )}
            </Fragment>
          );
        })}
      </StepRow>

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
