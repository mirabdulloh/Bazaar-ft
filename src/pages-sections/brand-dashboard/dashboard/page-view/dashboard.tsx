"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import PaidOutlined from "@mui/icons-material/PaidOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import StarOutline from "@mui/icons-material/StarOutline";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import { useQuery } from "lib/hooks/useQuery";
import { GET_MY_BRAND, GET_BRAND_PRODUCTS, GET_BRAND_ORDERS } from "../../../../../apollo/brand/query";
import { T } from "lib/types/common";

const DASHBOARD_LIMIT = 500;

const ORDER_STATUS_COLORS: Record<string, "default" | "warning" | "info" | "success" | "error"> = {
  PENDING: "warning",
  CONFIRMED: "info",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "error",
  REFUNDED: "default",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0);

const formatShortDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "-";

const resolveImage = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  return apiBase ? `${apiBase}${normalized}` : normalized;
};

function StatCard({
  title,
  value,
  caption,
  icon,
}: {
  title: string;
  value: string;
  caption: string;
  icon: ReactNode;
}) {
  return (
    <Card sx={{ p: 2.25, borderRadius: 3, height: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            {caption}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: "grey.100",
            color: "text.secondary",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Card>
  );
}

export default function DashboardPageView() {
  const {
    data: brandData,
    loading: brandLoading,
    error: brandError,
  } = useQuery(GET_MY_BRAND, {
    fetchPolicy: "cache-and-network",
  });

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useQuery(GET_BRAND_PRODUCTS, {
    fetchPolicy: "cache-and-network",
    variables: {
      input: {
        page: 1,
        limit: DASHBOARD_LIMIT,
        sort: "createdAt",
        direction: "DESC",
        search: {},
      },
    },
  });

  const {
    data: ordersData,
    loading: ordersLoading,
    error: ordersError,
  } = useQuery(GET_BRAND_ORDERS, {
    fetchPolicy: "cache-and-network",
    variables: {
      input: {
        page: 1,
        limit: DASHBOARD_LIMIT,
        sort: "createdAt",
        direction: "DESC",
      },
    },
  });

  const isInitialLoading = brandLoading || productsLoading || ordersLoading;
  const hasError = brandError || productsError || ordersError;

  const brand = (brandData as T)?.getMyBrand;
  const products: T[] = (productsData as T)?.getBrandProducts?.products ?? [];
  const orders: T[] = (ordersData as T)?.getBrandOrders?.orders ?? [];
  const totalProducts = (productsData as T)?.getBrandProducts?.metaData?.total ?? products.length;
  const totalOrders = (ordersData as T)?.getBrandOrders?.metaData?.total ?? orders.length;

  const stats = useMemo(() => {
    const activeProducts = products.filter((item) => item.productStatus === "ACTIVE");
    const draftProducts = products.filter((item) => item.productStatus === "DRAFT");
    const soldOutProducts = products.filter((item) => item.productStatus === "SOLD_OUT");
    const hiddenProducts = products.filter((item) => item.productStatus === "HIDDEN");
    const lowStockProducts = products.filter(
      (item) => item.productStatus === "ACTIVE" && Number(item.productStockQuantity ?? 0) <= 5
    );

    const statusCounts = orders.reduce<Record<string, number>>((acc, order) => {
      const key = order.orderStatus || "OTHER";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const liveOrders = orders.filter((item) =>
      ["PENDING", "CONFIRMED", "SHIPPED"].includes(item.orderStatus)
    );
    const salesOrders = orders.filter((item) =>
      ["CONFIRMED", "SHIPPED", "DELIVERED"].includes(item.orderStatus)
    );
    const deliveredOrders = orders.filter((item) => item.orderStatus === "DELIVERED");

    const totalViews = products.reduce((sum, item) => sum + Number(item.productViews ?? 0), 0);
    const totalPipelineValue = liveOrders.reduce((sum, item) => sum + Number(item.orderFinalPrice ?? 0), 0);
    const totalSalesValue = salesOrders.reduce((sum, item) => sum + Number(item.orderFinalPrice ?? 0), 0);
    const deliveredRevenue = deliveredOrders.reduce((sum, item) => sum + Number(item.orderFinalPrice ?? 0), 0);
    const averageOrderValue = salesOrders.length ? totalSalesValue / salesOrders.length : 0;

    return {
      activeProducts: activeProducts.length,
      draftProducts: draftProducts.length,
      soldOutProducts: soldOutProducts.length,
      hiddenProducts: hiddenProducts.length,
      lowStockProducts,
      totalViews,
      totalPipelineValue,
      totalSalesValue,
      deliveredRevenue,
      averageOrderValue,
      liveOrders: liveOrders.length,
      deliveredOrders: deliveredOrders.length,
      statusCounts,
      recentOrders: orders.slice(0, 6),
      topProductsByViews: [...products]
        .sort((a, b) => Number(b.productViews ?? 0) - Number(a.productViews ?? 0))
        .slice(0, 5),
    };
  }, [orders, products]);

  if (isInitialLoading && !brand && products.length === 0 && orders.length === 0) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (hasError) {
    return (
      <Card sx={{ p: 4, borderRadius: 3 }}>
        <Typography color="error.main">Failed to load brand dashboard.</Typography>
      </Card>
    );
  }

  return (
    <Stack spacing={3}>
      <Card sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 4 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          gap={3}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={resolveImage(brand?.brandLogo)}
              alt={brand?.brandName || "Brand"}
              sx={{ width: 64, height: 64 }}
            >
              {(brand?.brandName || "B")[0]}
            </Avatar>

            <Box>
              <Typography variant="h4" fontWeight={700}>
                {brand?.brandName || "Your Brand"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Track product health, order flow, and completed sales from one place.
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
                <Chip label={`Status ${brand?.brandStatus || "ACTIVE"}`} color="info" variant="outlined" />
                <Chip label={`${brand?.brandFollowersCount ?? 0} followers`} variant="outlined" />
                <Chip label={`${brand?.brandReviewsCount ?? 0} reviews`} variant="outlined" />
                <Chip
                  icon={<StarOutline />}
                  label={`${Number(brand?.brandRating ?? 0).toFixed(1)} rating`}
                  variant="outlined"
                />
              </Stack>
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
            <Button component={Link} href="/brand/products/create" variant="contained" color="info">
              Add Product
            </Button>
            <Button component={Link} href="/brand/orders" variant="outlined" color="info">
              Open Orders
            </Button>
          </Stack>
        </Stack>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard
            title="Completed Sales"
            value={formatCurrency(stats.deliveredRevenue)}
            caption={`${stats.deliveredOrders} delivered orders`}
            icon={<PaidOutlined fontSize="small" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard
            title="Sales Pipeline"
            value={formatCurrency(stats.totalPipelineValue)}
            caption={`${stats.liveOrders} orders in progress`}
            icon={<TrendingUpOutlined fontSize="small" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard
            title="Catalog"
            value={String(totalProducts)}
            caption={`${stats.activeProducts} active products`}
            icon={<Inventory2Outlined fontSize="small" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard
            title="Product Views"
            value={new Intl.NumberFormat("en-US").format(stats.totalViews)}
            caption={`${stats.lowStockProducts.length} low-stock alerts`}
            icon={<VisibilityOutlined fontSize="small" />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ p: 3, borderRadius: 4, height: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Order Pipeline
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current fulfillment load for your store.
                </Typography>
              </Box>
              <Button component={Link} href="/brand/orders" color="info">
                Manage Orders
              </Button>
            </Stack>

            <Grid container spacing={2}>
              {[
                "PENDING",
                "CONFIRMED",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED",
                "REFUNDED",
              ].map((status) => (
                <Grid size={{ xs: 6, md: 4 }} key={status}>
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                      p: 2,
                      height: "100%",
                    }}
                  >
                    <Chip
                      size="small"
                      color={ORDER_STATUS_COLORS[status] ?? "default"}
                      label={status}
                      sx={{ mb: 1.5 }}
                    />
                    <Typography variant="h4" fontWeight={700}>
                      {stats.statusCounts[status] ?? 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      orders
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ p: 3, borderRadius: 4, height: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Product Health
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stock and visibility overview for your catalog.
                </Typography>
              </Box>
              <Button component={Link} href="/brand/products" color="info">
                Open Products
              </Button>
            </Stack>

            <Stack spacing={1.5}>
              {[
                ["Active", stats.activeProducts],
                ["Draft", stats.draftProducts],
                ["Sold Out", stats.soldOutProducts],
                ["Hidden", stats.hiddenProducts],
              ].map(([label, value]) => (
                <FlexStat key={label} label={label} value={String(value)} />
              ))}

              <Divider sx={{ my: 1 }} />

              <FlexStat label="Average Order Value" value={formatCurrency(stats.averageOrderValue)} />
              <FlexStat label="Followers" value={String(brand?.brandFollowersCount ?? 0)} />
              <FlexStat label="Brand Reviews" value={String(brand?.brandReviewsCount ?? 0)} />
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ p: 3, borderRadius: 4, height: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Recent Orders
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Latest customer activity on your brand orders.
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {totalOrders} total orders
              </Typography>
            </Stack>

            {stats.recentOrders.length === 0 ? (
              <EmptyState
                icon={<ShoppingBagOutlined fontSize="small" />}
                title="No orders yet"
                description="Your recent brand orders will appear here."
              />
            ) : (
              <Stack spacing={0}>
                {stats.recentOrders.map((order, index) => (
                  <Box key={order._id}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", md: "center" }}
                      gap={2}
                      sx={{ py: 2 }}
                    >
                      <Box>
                        <Typography fontWeight={700}>#{String(order._id).slice(-8).toUpperCase()}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                          {order.member?.memberNick || "Customer"} · {formatShortDate(order.createdAt)}
                        </Typography>
                      </Box>

                      <Stack direction="row" gap={1} flexWrap="wrap">
                        <Chip
                          size="small"
                          label={order.orderStatus}
                          color={ORDER_STATUS_COLORS[order.orderStatus] ?? "default"}
                        />
                        <Chip size="small" label={`Payment ${order.orderPaymentStatus}`} variant="outlined" />
                        <Chip size="small" label={`Delivery ${order.orderDeliveryStatus}`} variant="outlined" />
                      </Stack>

                      <Typography variant="h6" fontWeight={700}>
                        {formatCurrency(Number(order.orderFinalPrice ?? 0))}
                      </Typography>
                    </Stack>
                    {index < stats.recentOrders.length - 1 && <Divider />}
                  </Box>
                ))}
              </Stack>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ p: 3, borderRadius: 4, height: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Attention Needed
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Products and activity that need a quick check.
                </Typography>
              </Box>
            </Stack>

            {stats.lowStockProducts.length === 0 ? (
              <EmptyState
                icon={<WarningAmberOutlined fontSize="small" />}
                title="No low-stock products"
                description="Your active products currently have healthy stock."
              />
            ) : (
              <Stack spacing={1.5}>
                {stats.lowStockProducts.slice(0, 5).map((product) => (
                  <Stack
                    key={product._id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={2}
                    sx={{
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={600} noWrap>
                        {product.productTitle}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Number(product.productStockQuantity ?? 0)} left in stock
                      </Typography>
                    </Box>
                    <Chip size="small" color="warning" label="Low stock" />
                  </Stack>
                ))}
              </Stack>
            )}

            <Divider sx={{ my: 2.5 }} />

            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
              Top Products By Views
            </Typography>

            {stats.topProductsByViews.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No product activity yet.
              </Typography>
            ) : (
              <Stack spacing={1.25}>
                {stats.topProductsByViews.map((product) => (
                  <Stack
                    key={product._id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={2}
                  >
                    <Typography variant="body2" noWrap sx={{ maxWidth: "70%" }}>
                      {product.productTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Number(product.productViews ?? 0)} views
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

function FlexStat({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={700}>{value}</Typography>
    </Stack>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Stack alignItems="center" textAlign="center" py={4} spacing={1.25}>
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: "grey.100",
          color: "text.secondary",
        }}
      >
        {icon}
      </Box>
      <Typography fontWeight={700}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Stack>
  );
}
