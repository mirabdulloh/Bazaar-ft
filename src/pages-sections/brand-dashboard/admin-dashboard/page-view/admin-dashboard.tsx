"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Theme } from "@mui/material/styles";
import Launch from "@mui/icons-material/Launch";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import LocalOfferOutlined from "@mui/icons-material/LocalOfferOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import StorefrontOutlined from "@mui/icons-material/StorefrontOutlined";
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { T } from "lib/types/common";
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from "lib/sweetAlert";
import { UPDATE_BRAND_BY_ADMIN } from "../../../../../apollo/admin/mutation";
import { GET_ADMIN_DASHBOARD_STATS } from "../../../../../apollo/admin/query";
import PageWrapper from "../../page-wrapper";
import { HeroCard, OrderRow, QuickLinkStack, QueueRow, SectionCard, StatCard } from "./styles";

const resolveBrandLogo = (logo?: string | null) => {
  if (!logo) return "";
  if (/^https?:\/\//i.test(logo)) return logo;
  const normalized = logo.startsWith("/") ? logo : `/${logo}`;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
  return apiUrl ? `${apiUrl}${normalized}` : normalized;
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
};

const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value ?? 0);

const statusColorMap: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
  PENDING: "warning",
  ACTIVE: "success",
  INACTIVE: "default",
  SUSPENDED: "error",
  BLOCK: "error",
  DELETE: "default",
  CONFIRMED: "info",
  SHIPPED: "warning",
  DELIVERED: "success",
  CANCELLED: "error",
  REFUNDED: "default",
  PAID: "success",
  FAILED: "error",
  PREPARING: "info",
  SHIPPING: "warning"
};

export default function AdminDashboardPageView() {
  const downSm = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const { loading, refetch } = useQuery(GET_ADMIN_DASHBOARD_STATS, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    onCompleted: (result: T) => {
      setDashboardStats(result?.getAdminDashboardStats ?? null);
    }
  });
  const [updateBrand, { loading: updatingBrand }] = useMutation(UPDATE_BRAND_BY_ADMIN);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  const stats = dashboardStats;

  const metricCards = useMemo(
    () => [
      { title: "Total Brands", value: stats?.totalBrands ?? 0, helper: "All marketplace brands", icon: StorefrontOutlined },
      { title: "Pending Brands", value: stats?.pendingBrands ?? 0, helper: "Waiting for approval", icon: StorefrontOutlined },
      { title: "Total Members", value: stats?.totalMembers ?? 0, helper: "All registered accounts", icon: PeopleAltOutlined },
      { title: "Blocked Members", value: stats?.blockedMembers ?? 0, helper: "Users currently restricted", icon: PeopleAltOutlined },
      { title: "Users", value: stats?.userMembers ?? 0, helper: "Simple user accounts", icon: PeopleAltOutlined },
      { title: "Brand Accounts", value: stats?.brandMembers ?? 0, helper: "Brand member logins", icon: StorefrontOutlined },
      { title: "Inactive Articles", value: stats?.inactiveArticles ?? 0, helper: "Hidden community posts", icon: Inventory2Outlined },
      { title: "Inactive Reviews", value: stats?.inactiveReviews ?? 0, helper: "Moderated product reviews", icon: Inventory2Outlined }
    ],
    [stats]
  );

  const handleBrandStatus = useCallback(
    async (brandId: string, brandName: string, brandStatus: "ACTIVE" | "SUSPENDED") => {
      const confirmed = await sweetConfirmAlert(
        brandStatus === "ACTIVE" ? "Approve Brand?" : "Suspend Brand?",
        brandStatus === "ACTIVE"
          ? `Approve "${brandName}" and move it to ACTIVE?`
          : `Suspend "${brandName}" from the marketplace?`,
        brandStatus === "ACTIVE" ? "Approve" : "Suspend"
      );

      if (!confirmed) return;

      try {
        await updateBrand({ variables: { input: { _id: brandId, brandStatus } } });
        await refetch();
        await sweetTopSmallSuccessAlert(brandStatus === "ACTIVE" ? "Brand approved" : "Brand suspended");
      } catch (error: any) {
        await sweetMixinErrorAlert(error?.message || "Failed to update brand");
      }
    },
    [refetch, updateBrand]
  );

  if (loading && !stats) {
    return (
      <PageWrapper title="Admin Dashboard">
        <Stack minHeight={360} alignItems="center" justifyContent="center" spacing={2}>
          <CircularProgress color="info" />
          <Typography color="text.secondary">Loading admin overview...</Typography>
        </Stack>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Admin Dashboard">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <HeroCard>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="overline" color="info.main" sx={{ letterSpacing: 1.2 }}>
                  Platform Control Center
                </Typography>
                <Typography
                  variant="h3"
                  sx={{ mt: 1, mb: 1, fontSize: { xs: "1.85rem", sm: "2.3rem" }, lineHeight: 1.15 }}
                >
                  Admin-owned platform data only
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
                  This home view summarizes the real backend areas admin controls: brand approvals,
                  member restrictions, community moderation, and platform content.
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} flexWrap="wrap" alignItems="flex-start">
                <Chip color="warning" label={`${stats?.pendingBrands ?? 0} brands pending approval`} />
                <Chip color="error" label={`${stats?.blockedMembers ?? 0} blocked members`} />
                <Chip color="info" label={`${stats?.openOrders ?? 0} open orders`} />
              </Stack>
            </Stack>
          </HeroCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard>
            <Typography variant="h5" sx={{ mb: 1.5 }}>
              Quick Access
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2.5 }}>
              Open the dedicated admin pages. The dashboard stays summary-first.
            </Typography>

            <QuickLinkStack>
              <Button fullWidth={downSm} component={Link} href="/admin/brands" variant="outlined" color="info">Review Brands</Button>
              <Button fullWidth={downSm} component={Link} href="/admin/customers" variant="outlined" color="info">Moderate Members</Button>
              <Button fullWidth={downSm} component={Link} href="/admin/articles" variant="outlined" color="info">Moderate Articles</Button>
              <Button fullWidth={downSm} component={Link} href="/admin/products/reviews" variant="outlined" color="info">Moderate Reviews</Button>
              <Button fullWidth={downSm} component={Link} href="/admin/notices" variant="outlined" color="info">Platform Notices</Button>
            </QuickLinkStack>
          </SectionCard>
        </Grid>

        {metricCards.map((item) => (
          <Grid size={{ xs: 12, sm: 6, xl: 3 }} key={item.title}>
            <StatCard>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Box minWidth={0}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="h3" sx={{ mb: 0.5, fontSize: { xs: "1.75rem", sm: "2.4rem" } }}>
                    {item.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.helper}
                  </Typography>
                </Box>

                <Avatar sx={{ bgcolor: "info.50", color: "info.main", width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 } }}>
                  <item.icon fontSize="small" />
                </Avatar>
              </Stack>
            </StatCard>
          </Grid>
        ))}

        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h5">Pending Brand Approvals</Typography>
                <Typography color="text.secondary">
                  Brands still in backend `PENDING` state and waiting for an admin action.
                </Typography>
              </Box>

              <Button fullWidth={downSm} component={Link} href="/admin/brands" color="info" endIcon={<Launch />}>
                Open Brand List
              </Button>
            </Stack>

            <Stack spacing={0.5}>
              {(stats?.pendingBrandQueue ?? []).length === 0 ? (
                <Typography color="text.secondary">No pending brands right now.</Typography>
              ) : (
                (stats?.pendingBrandQueue ?? []).map((brand: any) => (
                  <QueueRow key={brand._id}>
                    <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
                      <Avatar src={resolveBrandLogo(brand.memberImage || brand.brandLogo)} alt={brand.brandName} sx={{ width: 44, height: 44 }} />
                      <Box minWidth={0}>
                        <Typography variant="h6" noWrap>{brand.brandName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Submitted {formatDate(brand.createdAt)}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip size="small" color={statusColorMap[brand.brandStatus]} label={brand.brandStatus} />
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="flex-end" sx={{ width: { xs: "100%", sm: "auto" }, "& .MuiButton-root": { width: { xs: "100%", sm: "auto" } } }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        disabled={updatingBrand}
                        onClick={() => handleBrandStatus(brand._id, brand.brandName, "ACTIVE")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={updatingBrand}
                        onClick={() => handleBrandStatus(brand._id, brand.brandName, "SUSPENDED")}
                      >
                        Suspend
                      </Button>
                    </Stack>
                  </QueueRow>
                ))
              )}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Status Snapshot
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Brand states
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  alignItems="flex-start"
                  useFlexGap
                  sx={{ rowGap: 1, columnGap: 0.75 }}
                >
                  <Chip size="small" color="warning" label={`Pending ${stats?.pendingBrands ?? 0}`} />
                  <Chip size="small" color="success" label={`Active ${stats?.activeBrands ?? 0}`} />
                  <Chip size="small" color="default" label={`Inactive ${stats?.inactiveBrands ?? 0}`} />
                  <Chip size="small" color="error" label={`Suspended ${stats?.suspendedBrands ?? 0}`} />
                </Stack>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Member composition
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  alignItems="flex-start"
                  useFlexGap
                  sx={{ rowGap: 1, columnGap: 0.75 }}
                >
                  <Chip size="small" color="info" label={`Users ${stats?.userMembers ?? 0}`} />
                  <Chip size="small" color="info" label={`Brands ${stats?.brandMembers ?? 0}`} />
                  <Chip size="small" color="default" label={`Admins ${stats?.adminMembers ?? 0}`} />
                  <Chip size="small" color="error" label={`Blocked ${stats?.blockedMembers ?? 0}`} />
                </Stack>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Community moderation
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  alignItems="flex-start"
                  useFlexGap
                  sx={{ rowGap: 1, columnGap: 0.75 }}
                >
                  <Chip size="small" color="default" label={`Articles ${stats?.inactiveArticles ?? 0} inactive`} />
                  <Chip size="small" color="default" label={`Reviews ${stats?.inactiveReviews ?? 0} inactive`} />
                </Stack>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={12}>
          <SectionCard>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h5">Latest Orders</Typography>
                <Typography color="text.secondary">
                  Overview only. Normal fulfillment remains outside admin day-to-day flow.
                </Typography>
              </Box>

              <Button fullWidth={downSm} component={Link} href="/admin/orders" color="info" endIcon={<Launch />}>
                Open Orders
              </Button>
            </Stack>

            <Stack spacing={0.5}>
              {(stats?.latestOrders ?? []).length === 0 ? (
                <Typography color="text.secondary">No orders available yet.</Typography>
              ) : (
                (stats?.latestOrders ?? []).map((order: any) => (
                  <OrderRow key={order._id}>
                    <Box minWidth={0}>
                      <Typography variant="h6" noWrap={!downSm}>#{String(order._id).slice(-8).toUpperCase()}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap={!downSm}>{order.brandName || "Unknown Brand"}</Typography>
                    </Box>

                    <Box minWidth={0}>
                      <Typography variant="body1" noWrap={!downSm}>{order.customerName || "Unknown Member"}</Typography>
                      <Typography variant="body2" color="text.secondary">{formatDate(order.createdAt)}</Typography>
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      alignItems="flex-start"
                      useFlexGap
                      sx={{
                        maxWidth: { md: 360, lg: 420 },
                        rowGap: 1,
                        columnGap: 0.75
                      }}
                    >
                      <Chip size="small" color={statusColorMap[order.orderStatus]} label={order.orderStatus} />
                      <Chip size="small" color={statusColorMap[order.orderPaymentStatus]} label={order.orderPaymentStatus} />
                      <Chip size="small" color={statusColorMap[order.orderDeliveryStatus]} label={order.orderDeliveryStatus} />
                    </Stack>

                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                        textAlign: { md: "right" },
                        whiteSpace: { md: "nowrap" }
                      }}
                    >
                      {formatCurrency(order.orderFinalPrice)}
                    </Typography>

                    <Button
                      component={Link}
                      href="/admin/orders"
                      size="small"
                      color="info"
                      sx={{
                        width: { xs: "100%", md: "auto" },
                        justifySelf: { md: "end" }
                      }}
                    >
                      Open
                    </Button>
                  </OrderRow>
                ))
              )}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </PageWrapper>
  );
}
