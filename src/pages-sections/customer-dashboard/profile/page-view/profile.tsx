"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
// MUI
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
// MUI ICONS
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
// APOLLO
import { useReactiveVar } from "@apollo/client/react";
import { userVar } from "../../../../../apollo/store";
import { useQuery } from "../../../../lib/hooks/useQuery";
import {
  GET_MY_ORDERS,
  GET_ADDRESSES,
  GET_MEMBER_FOLLOWINGS,
  GET_BRANDS,
  GET_VISITED_PRODUCTS,
} from "../../../../../apollo/user/query";
// GLOBAL CUSTOM COMPONENTS
import { FlexBetween, FlexBox } from "components/flex-box";
import DashboardHeader from "../../dashboard-header";
import User3 from "icons/User3";
// CUSTOM TYPES
import { T } from "../../../../lib/types/common";
// UTILS
import { currency } from "lib";

// ─── Static payment methods (no backend) ──────────────────────────────────────
const STATIC_PAYMENT_METHODS = [
  { id: "1", type: "Visa", last4: "4242", expiry: "08/26" },
  { id: "2", type: "Mastercard", last4: "8910", expiry: "11/27" },
];

function orderStatusColor(status: string): "warning" | "success" | "error" | "default" {
  if (["PENDING", "PROCESSING"].includes(status)) return "warning";
  if (["PAID", "DELIVERED", "COMPLETED"].includes(status)) return "success";
  if (["CANCELLED", "REFUNDED"].includes(status)) return "error";
  return "default";
}

function Section({
  title,
  linkHref,
  linkLabel = "See all →",
  children,
}: {
  title: string;
  linkHref: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ mt: 4 }}>
      <FlexBetween mb={2}>
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
        <Link href={linkHref}>
          <Typography variant="body2" color="primary.main" sx={{ cursor: "pointer" }}>
            {linkLabel}
          </Typography>
        </Link>
      </FlexBetween>
      <Card
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          border: "1px solid",
          borderColor: "grey.100",
          borderRadius: 3,
          bgcolor: "background.paper",
        }}
      >
        {children}
      </Card>
    </Box>
  );
}

export function ProfilePageView() {
  const user = useReactiveVar(userVar);

  /** APOLLO REQUESTS **/
  const { loading: ordersLoading, data: ordersData } = useQuery(GET_MY_ORDERS, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 3 } },
    notifyOnNetworkStatusChange: true,
  });

  const { loading: addressesLoading, data: addressesData } = useQuery(GET_ADDRESSES, {
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const { loading: followingsLoading, data: followingsData } = useQuery(GET_MEMBER_FOLLOWINGS, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 50 } },
    notifyOnNetworkStatusChange: true,
  });

  const { loading: brandsLoading, data: brandsData } = useQuery(GET_BRANDS, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 100 } },
    notifyOnNetworkStatusChange: true,
  });

  const { loading: visitedLoading, data: visitedData } = useQuery(GET_VISITED_PRODUCTS, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 6 } },
    notifyOnNetworkStatusChange: true,
  });

  const followedBrands = useMemo(() => {
    const followingIds = new Set<string>(
      ((followingsData as T)?.getMemberFollowings?.list ?? []).map(
        (f: T) => (f.followingId as string)?.toString()
      )
    );
    const allBrands: T[] = (brandsData as T)?.getBrands?.brands ?? [];
    return allBrands.filter((b: T) => followingIds.has((b._id as string)?.toString())).slice(0, 6);
  }, [followingsData, brandsData]);

  const orders: T[] = (ordersData as T)?.getMyOrders?.orders ?? [];
  const addresses: T[] = (addressesData as T)?.getAddresses ?? [];
  const visitedProducts: T[] = (visitedData as T)?.getVisitedProducts?.products ?? [];

  return (
    <Box>
      <DashboardHeader title="My Profile" Icon={User3} />

      {/* ── Profile Hero ─────────────────────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          border: "1px solid",
          borderColor: "grey.100",
          borderRadius: 3,
          background: "linear-gradient(135deg, #f6f7fb 0%, #ffffff 60%)",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" spacing={3}>
          <Avatar
            src={
              user.memberImage ||
              `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.memberNick || "U")}&backgroundColor=6366f1&textColor=ffffff`
            }
            alt={user.memberNick}
            sx={{ width: 86, height: 86 }}
          />
          <Box flex={1} minWidth={0}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography variant="h5" fontWeight={800} noWrap>
                {user.memberNick}
              </Typography>
              <Chip label={user.memberType} size="small" sx={{ fontSize: 11 }} />
            </Stack>
            {user.memberFullName && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {user.memberFullName}
              </Typography>
            )}
            {user.memberPhone && (
              <Typography variant="body2" color="text.secondary">
                {user.memberPhone}
              </Typography>
            )}
          </Box>
          <Link href="/profile/edit">
            <Typography variant="body2" color="primary.main" sx={{ cursor: "pointer", fontWeight: 600 }}>
              Edit Profile →
            </Typography>
          </Link>
        </Stack>
      </Card>

      {/* ── Quick Stats ─────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {[
          { label: "Orders", value: orders.length },
          { label: "Addresses", value: addresses.length },
          { label: "Following", value: followedBrands.length },
          { label: "Visited", value: visitedProducts.length },
        ].map((item) => (
          <Grid key={item.label} size={{ xs: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "grey.100",
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="h5" fontWeight={800}>
                {item.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Recent Orders ────────────────────────────────────────── */}
      <Section title="Recent Orders" linkHref="/orders">
        {ordersLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} height={56} sx={{ mb: 1 }} />)
        ) : orders.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No orders yet.</Typography>
        ) : (
          <Box sx={{ border: "1px solid", borderColor: "grey.100", borderRadius: 2, overflow: "hidden" }}>
            {orders.map((order: T, idx: number) => (
              <Box key={order._id as string}>
                <Link href={`/orders/${order._id}`} style={{ textDecoration: "none" }}>
                  <FlexBetween
                    sx={{ px: 2, py: 1.5, cursor: "pointer", "&:hover": { bgcolor: "grey.50" } }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Order #{(order._id as string).slice(-8).toUpperCase()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(order.createdAt as string).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </Typography>
                    </Box>
                    <FlexBox alignItems="center" gap={2}>
                      <Chip
                        label={order.orderStatus as string}
                        size="small"
                        color={orderStatusColor(order.orderStatus as string)}
                        sx={{ fontWeight: 600, fontSize: 11 }}
                      />
                      <Typography variant="body2" fontWeight={700}>
                        {currency((order.orderFinalPrice ?? order.orderTotalPrice) as number)}
                      </Typography>
                    </FlexBox>
                  </FlexBetween>
                </Link>
                {idx < orders.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        )}
      </Section>

      {/* ── My Addresses ─────────────────────────────────────────── */}
      <Section title="My Addresses" linkHref="/address" linkLabel="Manage →">
        {addressesLoading ? (
          <Grid container spacing={2}>
            {[1, 2].map((i) => <Grid size={{ sm: 6, xs: 12 }} key={i}><Skeleton height={90} /></Grid>)}
          </Grid>
        ) : addresses.length === 0 ? (
          <FlexBox alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">No addresses saved.</Typography>
            <Link href="/address/add">
              <Typography variant="body2" color="primary.main" sx={{ cursor: "pointer" }}>Add Address →</Typography>
            </Link>
          </FlexBox>
        ) : (
          <Grid container spacing={2}>
            {addresses.map((addr: T) => (
              <Grid size={{ sm: 6, xs: 12 }} key={addr._id as string}>
                <Card elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "grey.100", borderRadius: 2, height: "100%" }}>
                  <FlexBox alignItems="flex-start" gap={1}>
                    <LocationOnOutlined sx={{ fontSize: 18, color: "primary.main", mt: 0.3 }} />
                    <Box>
                      <FlexBox alignItems="center" gap={1} mb={0.25}>
                        <Typography variant="body2" fontWeight={700}>{addr.addressName as string}</Typography>
                        {addr.isDefault && (
                          <Chip label="Default" size="small" color="primary" sx={{ fontSize: 10, height: 18 }} />
                        )}
                      </FlexBox>
                      <Typography variant="caption" color="text.secondary">
                        {[addr.addressLine1, addr.addressCity, addr.addressCountry].filter(Boolean).join(", ")}
                      </Typography>
                    </Box>
                  </FlexBox>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Section>

      {/* ── Payment Methods (static) ─────────────────────────────── */}
      <Section title="Payment Methods" linkHref="/payment-methods" linkLabel="Manage →">
        <Grid container spacing={2}>
          {STATIC_PAYMENT_METHODS.map((pm) => (
            <Grid size={{ sm: 6, xs: 12 }} key={pm.id}>
              <Card elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "grey.100", borderRadius: 2 }}>
                <FlexBox alignItems="center" gap={1.5}>
                  <CreditCardIcon sx={{ fontSize: 28, color: "primary.main" }} />
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {pm.type} •••• {pm.last4}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Expires {pm.expiry}</Typography>
                  </Box>
                </FlexBox>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* ── Following Brands ─────────────────────────────────────── */}
      <Section title="Following Brands" linkHref="/following">
        {followingsLoading || brandsLoading ? (
          <FlexBox gap={2} sx={{ overflowX: "auto", pb: 1 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" width={120} height={80} sx={{ flexShrink: 0 }} />
            ))}
          </FlexBox>
        ) : followedBrands.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            You haven&apos;t followed any brands yet.
          </Typography>
        ) : (
          <FlexBox gap={2} sx={{ overflowX: "auto", pb: 1 }}>
            {followedBrands.map((brand: T) => (
              <Link key={brand._id as string} href={`/brands/${brand._id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
                <Card
                  elevation={0}
                  sx={{
                    p: 1.5, border: "1px solid", borderColor: "grey.100", borderRadius: 2,
                    width: 120, textAlign: "center",
                    "&:hover": { borderColor: "primary.main" }, transition: "border-color 0.15s",
                  }}
                >
                  {brand.brandLogo ? (
                    <Box sx={{ position: "relative", width: 60, height: 60, mx: "auto", mb: 0.75, borderRadius: 1, overflow: "hidden" }}>
                      <Image src={brand.brandLogo as string} alt={brand.brandName as string} fill style={{ objectFit: "cover" }} sizes="60px" />
                    </Box>
                  ) : (
                    <Avatar sx={{ width: 60, height: 60, mx: "auto", mb: 0.75, bgcolor: "primary.main" }}>
                      {(brand.brandName as string)?.[0]}
                    </Avatar>
                  )}
                  <Typography variant="caption" fontWeight={600} sx={{ display: "block" }}>
                    {brand.brandName as string}
                  </Typography>
                </Card>
              </Link>
            ))}
          </FlexBox>
        )}
      </Section>

      {/* ── Recently Visited Products ─────────────────────────────── */}
      <Section title="Recently Visited" linkHref="/products/search" linkLabel="Browse all →">
        {visitedLoading ? (
          <FlexBox gap={2} sx={{ overflowX: "auto", pb: 1 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rounded" width={130} height={170} sx={{ flexShrink: 0 }} />
            ))}
          </FlexBox>
        ) : visitedProducts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No recently visited products.</Typography>
        ) : (
          <FlexBox gap={2} sx={{ overflowX: "auto", pb: 1 }}>
            {visitedProducts.map((p: T) => (
              <Link key={p._id as string} href={`/products/${p._id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
                <Card
                  elevation={0}
                  sx={{
                    width: 130, border: "1px solid", borderColor: "grey.100", borderRadius: 2, overflow: "hidden",
                    "&:hover": { borderColor: "primary.main" }, transition: "border-color 0.15s",
                  }}
                >
                  <Box sx={{ position: "relative", width: "100%", height: 110 }}>
                    <Image
                      src={(p.productImages as string[])?.[0] ?? "/assets/images/products/product-1.png"}
                      alt={p.productTitle as string}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="130px"
                    />
                  </Box>
                  <Box sx={{ p: 1 }}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={{ display: "block", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}
                    >
                      {p.productTitle as string}
                    </Typography>
                    <Typography variant="caption" color="primary.main" fontWeight={700}>
                      {currency(p.productPrice as number)}
                    </Typography>
                  </Box>
                </Card>
              </Link>
            ))}
          </FlexBox>
        )}
      </Section>
    </Box>
  );
}
