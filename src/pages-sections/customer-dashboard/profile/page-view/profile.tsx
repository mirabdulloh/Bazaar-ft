"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
// MUI
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid";
import Rating from "@mui/material/Rating";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
// MUI ICONS
import CardGiftcardOutlined from "@mui/icons-material/CardGiftcardOutlined";
import CameraEnhance from "@mui/icons-material/CameraEnhance";
import ConfirmationNumberOutlined from "@mui/icons-material/ConfirmationNumberOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MenuIcon from "@mui/icons-material/Menu";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import IconButton from "@mui/material/IconButton";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HistoryIcon from "@mui/icons-material/History";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import CloseIcon from "@mui/icons-material/Close";
// REACT-i18n
import { useTranslation } from "../../react-i18next";
// APOLLO
import { useReactiveVar, useMutation } from "@apollo/client/react";
import { userVar } from "../../../../../apollo/store";
import { useQuery } from "../../../../lib/hooks/useQuery";
import {
  GET_MY_ORDERS,
  GET_AVAILABLE_COUPONS_FOR_ME,
  GET_MY_COUPON_CLAIMS,
  GET_MY_REVIEWS,
  GET_MEMBER,
  GET_MEMBER_FOLLOWINGS,
  GET_MEMBER_FOLLOWERS,
  GET_VISITED_PRODUCTS,
  GET_BOARD_ARTICLES,
  GET_ADDRESSES,
} from "../../../../../apollo/user/query";
import {
  CLAIM_COUPON,
  UPDATE_MEMBER,
  SUBSCRIBE,
  UNSUBSCRIBE,
  CHANGE_PASSWORD,
  DELETE_ADDRESS,
  CANCEL_ORDER,
  CONFIRM_ORDER_RECEIVED,
  CREATE_REVIEW
} from "../../../../../apollo/user/mutation";
// CUSTOM COMPONENTS
import AddressForm from "../../address/address-form";
import { OrderDetailsPageView } from "../../orders/page-view/order-details";
// GLOBAL CUSTOM COMPONENTS
import { FlexBetween, FlexBox } from "components/flex-box";
import ProductCard1 from "components/product-cards/product-card-1/product-card";
import useCart from "hooks/useCart";
import Product from "models/Product.model";
import DashboardHeader from "../../dashboard-header";
import User3 from "icons/User3";
import { useVariantPicker } from "contexts/VariantPickerContext";
// CUSTOM TYPES
import { T } from "../../../../lib/types/common";
// UTILS
import { currency } from "lib";
import { getJwtToken, logOut, updateStorage, setUserFromMemberData } from "lib/auth";
import { sweetMixinSuccessAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert, sweetTopSmallErrorAlert, sweetConfirmAlert } from "../../../../lib/sweetAlert";
// STYLED COMPONENTS
import {
  ProfileCard,
  SidebarWrapper,
  SidebarProfileBox,
  SidebarAvatar,
  SidebarNav,
  NavItem,
  LogoutNavItem,
  SectionLabel,
  ContentArea,
  SectionTitleBar,
  PanelCard,
  OverviewHeroCard,
  OverviewAvatar,
  StatCard,
  InfoRowWrapper,
  OrderCard,
  OrderStatusRow,
  OrderSummaryGrid,
  OrderSummaryCard,
  OrderItemsPreview,
  OrderProductLine,
  OrderProductThumb,
  OrderProductInfo,
  OrderActionBar,
  OrderVariantBadge,
  EmptyCard,
  ProductCard,
  ProductImageBox,
  PeopleCard,
  PeopleTableWrapper,
  PeopleTableHeader,
  PeopleTableRow,
  PeopleNameCell,
  PeopleDetailsCell,
  PeopleSubscriptionCell,
  DetailBadge,
  PaginationWrapper,
  AvatarUploadWrapper,
  EditAvatar,
  CameraButton
} from "../styles";

// ─── Tab Definitions ──────────────────────────────────────────────────────────

type TabKey =
  | "overview"
  | "orders"
  | "order-history"
  | "recently-visited"
  | "followers"
  | "followings"
  | "articles"
  | "addresses"
  | "claim-coupon"
  | "edit-profile";

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  section?: string;
  roleOnly?: "BRAND_ADMIN" | "USER";
}

const ICON_SZ = { fontSize: 18 };

const TABS: TabDef[] = [
  {
    key: "overview",
    label: "Overview",
    icon: <PersonOutlined sx={ICON_SZ} />,
    section: "MY ACCOUNT"
  },
  {
    key: "orders",
    label: "Orders",
    icon: <LocalShippingOutlined sx={ICON_SZ} />,
    section: "MANAGE"
  },
  {
    key: "order-history",
    label: "Order History",
    icon: <ConfirmationNumberOutlined sx={ICON_SZ} />
  },
  { key: "recently-visited", label: "Recently Visited", icon: <HistoryIcon sx={ICON_SZ} /> },
  { key: "followers", label: "My Followers", icon: <PeopleAltOutlinedIcon sx={ICON_SZ} /> },
  { key: "followings", label: "My Followings", icon: <GroupsOutlinedIcon sx={ICON_SZ} /> },
  {
    key: "articles",
    label: "My Articles",
    icon: <ArticleOutlinedIcon sx={ICON_SZ} />,
    roleOnly: "BRAND_ADMIN"
  },
  {
    key: "addresses",
    label: "Shipping Addresses",
    icon: <HomeOutlined sx={ICON_SZ} />,
    roleOnly: "USER",
    section: "ACCOUNT"
  },
  {
    key: "claim-coupon",
    label: "Claim Coupon",
    icon: <CardGiftcardOutlined sx={ICON_SZ} />,
    roleOnly: "USER"
  },
  {
    key: "edit-profile",
    label: "Edit Profile",
    icon: <EditOutlined sx={ICON_SZ} />,
    section: "SETTINGS"
  }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function orderStatusColor(status: string): "warning" | "success" | "error" | "default" {
  if (["PENDING", "CONFIRMED", "SHIPPED", "PROCESSING"].includes(status)) return "warning";
  if (["PAID", "DELIVERED", "COMPLETED"].includes(status)) return "success";
  if (["CANCELLED", "REFUNDED"].includes(status)) return "error";
  return "default";
}

function resolveImage(img: string | undefined | null): string {
  if (!img) return "";
  const value = img.trim().replace(/^['"]+|['"]+$/g, "");
  if (!value || value === "null" || value === "undefined") return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${base}${path}`;
}

function getProductImageCandidates(rawImage: string | undefined | null): string[] {
  if (!rawImage) return ["/assets/images/products/product-1.png"];

  const normalized = rawImage.trim().replace(/^['"]+|['"]+$/g, "");
  if (!normalized || normalized === "null" || normalized === "undefined") {
    return ["/assets/images/products/product-1.png"];
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return [normalized];
  }

  const candidates = [resolveImage(normalized)];
  const clean = normalized.replace(/^\/+/, "");

  if (clean && !clean.startsWith("uploads/")) {
    candidates.push(resolveImage(`/uploads/products/${clean}`));
    candidates.push(resolveImage(`/uploads/${clean}`));
  }

  candidates.push("/assets/images/products/product-1.png");

  return Array.from(new Set(candidates.filter(Boolean)));
}

function parseOptionArray(value: unknown): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : [value];
  const split = raw.flatMap((item) => String(item).split(/[,|]/));
  return Array.from(new Set(split.map((item) => item.trim()).filter(Boolean)));
}

function toProductModel(product: T): Product {
  const images = Array.isArray(product?.productImages) ? (product.productImages as string[]) : [];
  const title = (product?.productTitle as string) ?? "Product";
  const price = Number(product?.productDiscountPrice || product?.productPrice || 0);

  return {
    id: String(product?._id ?? ""),
    memberId: String(product?.memberId ?? ""),
    slug: String(product?._id ?? ""),
    title,
    price,
    rating: Number(product?.productRatingAverage ?? 0),
    discount: Math.max(
      0,
      Number(product?.productPrice ?? 0) - Number(product?.productDiscountPrice ?? 0) > 0
        ? Math.round(
            ((Number(product?.productPrice ?? 0) - Number(product?.productDiscountPrice ?? 0)) /
              Number(product?.productPrice ?? 1)) *
              100
          )
        : 0
    ),
    thumbnail: resolveImage(images[0]) || "/assets/images/products/placeholder.png",
    images: images.map((image) => resolveImage(image)),
    description: String(product?.productDesc ?? ""),
    colors: parseOptionArray(product?.productColor),
    size: parseOptionArray(product?.productSize),
    categories: [],
    productStockQuantity: Number(product?.productStockQuantity ?? 0),
    productLikes: Number(product?.productLikes ?? 0),
    productViews: Number(product?.productViews ?? 0),
    productRank: Number(product?.productRank ?? 0),
    productRatingCount: Number(product?.productRatingCount ?? 0),
  };
}

function countOrderUnits(order: T): number {
  return (Array.isArray(order.orderItems) ? order.orderItems : []).reduce(
    (sum: number, item: T) => sum + Number(item?.itemQuantity ?? 0),
    0
  );
}

function getOrderDisplayDate(order: T): string {
  return new Date(String(order.createdAt ?? "")).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function getOrderStatusMessage(status: string): string {
  switch (status) {
    case "PENDING":
      return "Waiting for the brand to confirm and prepare your order.";
    case "CONFIRMED":
      return "The brand accepted your order and is preparing it.";
    case "SHIPPED":
      return "The brand shipped your order. Mark it received when it arrives.";
    case "DELIVERED":
      return "Order completed. You can review purchased items or reorder them.";
    case "CANCELLED":
      return "This order was cancelled before completion.";
    case "REFUNDED":
      return "This order has been refunded.";
    default:
      return "Order status updated.";
  }
}

function getOrderItemVariantText(item: T): string {
  const parts = [
    item?.selectedSize ? `Size ${String(item.selectedSize)}` : "",
    item?.selectedColor ? `Color ${String(item.selectedColor)}` : "",
  ].filter(Boolean);

  return parts.join(" • ");
}

function getOrderProductImageCandidates(item: T): string[] {
  const raw = Array.isArray(item?.product?.productImages) ? (item.product.productImages as string[]) : [];
  return getProductImageCandidates(raw[0]);
}

function SafeProductImage({
  srcCandidates,
  alt
}: {
  srcCandidates: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [srcCandidates.join("|")]);

  const currentSrc =
    srcCandidates[index] ||
    srcCandidates[0] ||
    "/assets/images/products/product-1.png";

  return (
    <Box
      component="img"
      src={currentSrc}
      alt={alt}
      onError={() => {
        setIndex((prev) => {
          if (prev >= srcCandidates.length - 1) return prev;
          return prev + 1;
        });
      }}
      sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ProfilePageView() {
  const { t } = useTranslation();
  const user = useReactiveVar(userVar);
  const token = getJwtToken();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const isBrandOrAdmin = user.memberType === "BRAND" || user.memberType === "ADMIN";
  const isUser = user.memberType === "USER";

  const initialTab = useMemo(() => {
    const rawTab = searchParams.get("tab");
    const validTabs = new Set(TABS.map((tab) => tab.key));
    return validTabs.has(rawTab as TabKey) ? (rawTab as TabKey) : "overview";
  }, [searchParams]);
  const selectedOrderId = searchParams.get("orderId");

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Switch tab + auto-close drawer on mobile
  const handleTabChange = useCallback((key: TabKey) => {
    setActiveTab(key);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("orderId");
    if (key === "overview") params.delete("tab");
    else params.set("tab", key);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    if (isMobile) setDrawerOpen(false);
  }, [isMobile, pathname, router, searchParams]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // ── Edit Profile state ──
  const [updateData, setUpdateData] = useState({
    memberNick: user.memberNick || "",
    memberFullName: user.memberFullName || "",
    memberPhone: user.memberPhone || "",
    memberAddress: user.memberAddress || "",
    memberDesc: user.memberDesc || "",
    memberImage: user.memberImage || "",
    memberEmail: ""
  });
  const [editMsg, setEditMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [updateMember, { loading: updateLoading }] = useMutation(UPDATE_MEMBER);
  const [subscribeMember] = useMutation(SUBSCRIBE);
  const [unsubscribeMember] = useMutation(UNSUBSCRIBE);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [pendingFollowIds, setPendingFollowIds] = useState<Record<string, boolean>>({});

  const followingsQueryVariables = useMemo(
    () => ({
      input: { page: 1, limit: 50, search: { followerId: user._id } }
    }),
    [user._id]
  );

  const followersQueryVariables = useMemo(
    () => ({
      input: { page: 1, limit: 50, search: { followingId: user._id } }
    }),
    [user._id]
  );

  // Sync edit form when user reactive var changes
  useEffect(() => {
    setUpdateData((prev) => ({
      ...prev,
      memberNick: user.memberNick || "",
      memberFullName: user.memberFullName || "",
      memberPhone: user.memberPhone || "",
      memberAddress: user.memberAddress || "",
      memberDesc: user.memberDesc || "",
      memberImage: user.memberImage || ""
    }));
  }, [user]);


  /** Upload image to backend via multipart/form-data graphql-upload **/
  const uploadImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview immediately
        setProfileImagePreview(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append(
          "operations",
          JSON.stringify({
            query: `mutation ImageUploader($file: Upload!, $target: String!) {
              imageUploader(file: $file, target: $target)
            }`,
            variables: { file: null, target: "members" }
          })
        );
        formData.append("map", JSON.stringify({ "0": ["variables.file"] }));
        formData.append("0", file);

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "apollo-require-preflight": "true",
            Authorization: `Bearer ${token}`
          }
        });

        const responseImage = response.data.data.imageUploader;
        setUpdateData((prev) => ({ ...prev, memberImage: responseImage }));

        // Auto-save the new image immediately so the avatar updates everywhere
        const saveResult = await updateMember({
          variables: {
            input: {
              _id: user._id,
              memberNick: updateData.memberNick.trim() || undefined,
              memberFullName: updateData.memberFullName.trim() || undefined,
              memberPhone: updateData.memberPhone.trim() || undefined,
              memberAddress: updateData.memberAddress.trim() || undefined,
              memberDesc: updateData.memberDesc.trim() || undefined,
              memberImage: responseImage
            }
          }
        });
        const updatedMember = (saveResult?.data as T)?.updateMember;
        if (updatedMember?.accessToken) updateStorage({ jwtToken: updatedMember.accessToken });
        setUserFromMemberData(updatedMember);
        setProfileImagePreview(null);
      } catch (err) {
        console.error("Error uploading image:", err);
        await sweetMixinErrorAlert("Image upload failed");
        setProfileImagePreview(null);
      }
    },
    [token, user._id, updateData, updateMember]
  );

  /** Save profile changes **/
  const handleUpdateProfile = useCallback(async () => {
    try {
      if (!user._id) throw new Error("Not authenticated");

      const result = await updateMember({
        variables: {
          input: {
            _id: user._id,
            memberNick: updateData.memberNick.trim() || undefined,
            memberFullName: updateData.memberFullName.trim() || undefined,
            memberPhone: updateData.memberPhone.trim() || undefined,
            memberAddress: updateData.memberAddress.trim() || undefined,
            memberDesc: updateData.memberDesc.trim() || undefined,
            memberImage: updateData.memberImage || undefined,
            memberEmail: updateData.memberEmail.trim() || undefined
          }
        }
      });

      const updatedMember = (result?.data as T)?.updateMember;
      if (updatedMember?.accessToken) updateStorage({ jwtToken: updatedMember.accessToken });
      setUserFromMemberData(updatedMember);
      setProfileImagePreview(null);
      setEditMsg(null);
      await sweetMixinSuccessAlert("Profile updated successfully!");
    } catch (err: any) {
      console.error("Update error:", err);
      await sweetMixinErrorAlert(err?.message || "Failed to update profile");
    }
  }, [updateData, user._id, updateMember]);

  const doDisabledCheck = () => {
    return !updateData.memberNick.trim();
  };

  // ── Coupon state ──
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [claimCoupon, { loading: claimLoading }] = useMutation(CLAIM_COUPON);
  const {
    loading: availableCouponsLoading,
    data: availableCouponsData,
    refetch: refetchAvailableCoupons
  } = useQuery(GET_AVAILABLE_COUPONS_FOR_ME, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 20, sort: "createdAt", direction: "DESC" } },
    notifyOnNetworkStatusChange: true,
    skip: !user._id
  });
  const {
    loading: couponClaimsLoading,
    data: couponClaimsData,
    refetch: refetchCouponClaims
  } = useQuery(GET_MY_COUPON_CLAIMS, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 20, sort: "claimedAt", direction: "DESC" } },
    notifyOnNetworkStatusChange: true,
    skip: !user._id
  });

  /** APOLLO QUERIES **/
  // Fetch full member profile to get email (not in JWT)
  const { data: memberData, refetch: memberRefetch } = useQuery(GET_MEMBER, {
    variables: { input: user._id },
    skip: !user._id,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const memberEmail: string = (memberData as T)?.getMember?.memberEmail ?? "";
  const profileMember: T = ((memberData as T)?.getMember as T) ?? user;

  const handleClaimCoupon = useCallback(async (code?: string) => {
    const targetCouponCode = (code ?? couponCode).trim();
    if (!targetCouponCode) return;
    setCouponMsg(null);
    try {
      const result = await claimCoupon({ variables: { couponCode: targetCouponCode } });

      const claimedMember = (result?.data as T)?.claimCoupon;
      if (claimedMember?.accessToken) updateStorage({ jwtToken: claimedMember.accessToken });
      setUserFromMemberData(claimedMember);

      setCouponMsg({ type: "success", text: "Coupon claimed successfully!" });
      setCouponCode("");
      await Promise.allSettled([memberRefetch(), refetchCouponClaims(), refetchAvailableCoupons()]);
      await sweetMixinSuccessAlert("Coupon claimed!");
    } catch (err: any) {
      console.error("Coupon error:", err);
      const message = err?.message || "Invalid or expired coupon code.";
      setCouponMsg({ type: "error", text: message });
      await sweetMixinErrorAlert(message);
    }
  }, [couponCode, claimCoupon, memberRefetch, refetchCouponClaims, refetchAvailableCoupons]);

  // Sync email when query data loads (email lives in GET_MEMBER, not in userVar)
  useEffect(() => {
    if (memberEmail) setUpdateData((prev) => ({ ...prev, memberEmail }));
  }, [memberEmail]);

  const { loading: ordersLoading, data: ordersData, refetch: refetchOrders } = useQuery(GET_MY_ORDERS, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 10 } },
    notifyOnNetworkStatusChange: true
  });

  const { loading: visitedLoading, data: visitedData } = useQuery(GET_VISITED_PRODUCTS, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 12 } },
    notifyOnNetworkStatusChange: true
  });

  const { loading: followingsLoading, data: followingsData, refetch: followingsRefetch } = useQuery(GET_MEMBER_FOLLOWINGS, {
    fetchPolicy: "cache-and-network",
    variables: followingsQueryVariables,
    notifyOnNetworkStatusChange: true,
    skip: !user._id
  });

  const { loading: followersLoading, data: followersData, refetch: followersRefetch } = useQuery(GET_MEMBER_FOLLOWERS, {
    fetchPolicy: "cache-and-network",
    variables: followersQueryVariables,
    notifyOnNetworkStatusChange: true,
    skip: !user._id
  });

  const { data: myReviewsData, refetch: refetchMyReviews } = useQuery(GET_MY_REVIEWS, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 200, sort: "createdAt", direction: "DESC", search: {} } },
    notifyOnNetworkStatusChange: true,
    skip: !user._id
  });

  const { loading: articlesLoading, data: articlesData } = useQuery(GET_BOARD_ARTICLES, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 10, search: { memberId: user._id } } },
    skip: !user._id || !isBrandOrAdmin
  });

  // ── Data extraction ──
  const orders: T[] = (ordersData as T)?.getMyOrders?.orders ?? [];
  const myReviews: T[] = (myReviewsData as T)?.getMyReviews?.list ?? [];
  const visitedProducts: T[] = (visitedData as T)?.getVisitedProducts?.products ?? [];
  const followings: T[] = (followingsData as T)?.getMemberFollowings?.list ?? [];
  const followers: T[] = (followersData as T)?.getMemberFollowers?.list ?? [];
  const myArticles: T[] = (articlesData as T)?.getBoardArticles?.list ?? [];

  const [cancelOrder] = useMutation(CANCEL_ORDER);
  const [confirmOrderReceived] = useMutation(CONFIRM_ORDER_RECEIVED);
  const [createReview] = useMutation(CREATE_REVIEW);

  const handleCancelOrder = useCallback(async (orderId: string) => {
    const confirmed = await sweetConfirmAlert("Cancel order?", "Only pending orders can be cancelled.");
    if (!confirmed) return;

    try {
      await cancelOrder({ variables: { orderId } });
      await sweetTopSmallSuccessAlert("Order cancelled");
      await refetchOrders();
    } catch (err: any) {
      await sweetMixinErrorAlert(err?.message || "Failed to cancel order");
    }
  }, [cancelOrder, refetchOrders]);

  const handleConfirmOrderReceived = useCallback(async (orderId: string) => {
    const confirmed = await sweetConfirmAlert(
      "Mark order as received?",
      "This will complete the order and unlock review actions."
    );
    if (!confirmed) return;

    try {
      await confirmOrderReceived({ variables: { orderId } });
      await sweetTopSmallSuccessAlert("Order marked as delivered");
      await refetchOrders();
    } catch (err: any) {
      await sweetMixinErrorAlert(err?.message || "Failed to confirm delivery");
    }
  }, [confirmOrderReceived, refetchOrders]);

  const handleCreateReview = useCallback(async (input: T) => {
    await createReview({ variables: { input } });
    await refetchMyReviews({ input: { page: 1, limit: 200, sort: "createdAt", direction: "DESC", search: {} } });
  }, [createReview, refetchMyReviews]);

  // ── Follow / Unfollow handlers ──
  const refetchFollowPanels = useCallback(async () => {
    if (!user._id) return;
    await Promise.all([
      memberRefetch({ input: user._id }),
      followersRefetch(followersQueryVariables),
      followingsRefetch(followingsQueryVariables),
    ]);
  }, [followingsQueryVariables, followingsRefetch, followersQueryVariables, followersRefetch, memberRefetch, user._id]);

  const handleFollow = useCallback(async (targetId: string) => {
    if (pendingFollowIds[targetId]) return;
    try {
      setPendingFollowIds((prev) => ({ ...prev, [targetId]: true }));
      await subscribeMember({ variables: { input: targetId } });
      await refetchFollowPanels();
      await sweetTopSmallSuccessAlert("Followed");
    } catch (err: any) {
      console.error("Follow error:", err);
      await sweetTopSmallErrorAlert(err.message || "Failed to follow");
    } finally {
      setPendingFollowIds((prev) => ({ ...prev, [targetId]: false }));
    }
  }, [pendingFollowIds, refetchFollowPanels, subscribeMember]);

  const handleUnfollow = useCallback(async (targetId: string) => {
    if (pendingFollowIds[targetId]) return;
    try {
      setPendingFollowIds((prev) => ({ ...prev, [targetId]: true }));
      await unsubscribeMember({ variables: { input: targetId } });
      await refetchFollowPanels();
      await sweetTopSmallSuccessAlert("Unfollowed");
    } catch (err: any) {
      console.error("Unfollow error:", err);
      await sweetTopSmallErrorAlert(err.message || "Failed to unfollow");
    } finally {
      setPendingFollowIds((prev) => ({ ...prev, [targetId]: false }));
    }
  }, [pendingFollowIds, refetchFollowPanels, unsubscribeMember]);

  // Resolve avatar: preview > uploaded image > dicebear fallback
  const avatarSrc =
    profileImagePreview ||
    resolveImage(updateData.memberImage) ||
    resolveImage(user.memberImage) ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.memberNick || "U")}`;

  // ── Render active tab content ──
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewPanel user={profileMember} avatarSrc={avatarSrc} />;
      case "orders":
        if (selectedOrderId) {
          return (
            <Box>
              <SectionTitle
                title="Order Details"
                action={
                  <Button size="small" variant="outlined" onClick={() => handleTabChange("orders")}>
                    Back to Orders
                  </Button>
                }
              />
              <OrderDetailsPageView
                orderId={selectedOrderId}
                embedded
                backHref="/profile?tab=orders"
                title="Order Details"
              />
            </Box>
          );
        }
        return (
          <OrdersPanel
            orders={orders}
            loading={ordersLoading}
            onCancel={handleCancelOrder}
            onConfirmReceived={handleConfirmOrderReceived}
          />
        );
      case "order-history":
        return (
          <OrderHistoryPanel
            orders={orders}
            myReviews={myReviews}
            loading={ordersLoading}
            onCreateReview={handleCreateReview}
          />
        );
      case "recently-visited":
        return (
          <ProductGridPanel
            title="Recently Visited"
            products={visitedProducts}
            loading={visitedLoading}
            emptyMsg="No recently visited products."
          />
        );
      case "followers":
        return (
          <PeoplePanel
            title="My Followers"
            people={followers}
            loading={followersLoading}
            dataKey="followerData"
            emptyMsg="No followers yet."
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            pendingFollowIds={pendingFollowIds}
          />
        );
      case "followings":
        return (
          <PeoplePanel
            title="My Followings"
            people={followings}
            loading={followingsLoading}
            dataKey="followingData"
            emptyMsg="You haven't followed anyone yet."
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            pendingFollowIds={pendingFollowIds}
          />
        );
      case "articles":
        return (
          <ArticlesPanel articles={myArticles} loading={articlesLoading} />
        );
      case "addresses":
        return <AddressesPanel />;
      case "claim-coupon":
        return (
          <CouponPanel
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            couponMsg={couponMsg}
            setCouponMsg={setCouponMsg}
            handleClaimCoupon={handleClaimCoupon}
            claimLoading={claimLoading}
            availableCouponsLoading={availableCouponsLoading}
            availableCoupons={(availableCouponsData as T)?.getAvailableCouponsForMe?.list ?? []}
            claimsLoading={couponClaimsLoading}
            couponClaims={(couponClaimsData as T)?.getMyCouponClaims?.list ?? []}
          />
        );
      case "edit-profile":
        return (
          <EditProfilePanel
            updateData={updateData}
            setUpdateData={setUpdateData}
            editMsg={editMsg}
            handleUpdateProfile={handleUpdateProfile}
            updateLoading={updateLoading}
            doDisabledCheck={doDisabledCheck}
            avatarSrc={avatarSrc}
            uploadImage={uploadImage}
          />
        );
      default:
        return null;
    }
  };

  // ── Sidebar content (shared between drawer & inline) ──
  const sidebarContent = (
    <SidebarWrapper>
      {/* Profile card in sidebar */}
      <SidebarProfileBox>
        <SidebarAvatar src={avatarSrc} alt={user.memberNick} />
        <Typography variant="subtitle1" fontWeight={700} noWrap>
          {user.memberNick}
        </Typography>
        {user.memberFullName && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            {user.memberFullName}
          </Typography>
        )}
        <Chip
          label={user.memberType}
          size="small"
          color="primary"
          sx={{ mt: 1, fontSize: 10, fontWeight: 700 }}
        />
        <FlexBox justifyContent="center" gap={3} mt={1.5}>
          <Box textAlign="center">
            <Typography variant="subtitle2" fontWeight={700}>
              {(profileMember as T).memberFollowers ?? (user as T).memberFollowers ?? 0}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize={10}>
              Followers
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box textAlign="center">
            <Typography variant="subtitle2" fontWeight={700}>
              {(profileMember as T).memberFollowings ?? (user as T).memberFollowings ?? 0}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize={10}>
              Following
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box textAlign="center">
            <Typography variant="subtitle2" fontWeight={700}>
              {user.memberPoints ?? 0}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize={10}>
              Points
            </Typography>
          </Box>
        </FlexBox>
      </SidebarProfileBox>

      {/* Navigation tabs */}
      <SidebarNav>
        {TABS.filter(tab => {
          if (tab.roleOnly === "BRAND_ADMIN") return isBrandOrAdmin;
          if (tab.roleOnly === "USER") return isUser;
          return true;
        }).map((tab, index, visibleTabs) => {
          const isActive = activeTab === tab.key;
          const showSection =
            tab.section && (index === 0 || visibleTabs[index - 1]?.section !== tab.section);

          return (
            <Box key={tab.key}>
              {showSection && (
                <SectionLabel sx={{ pt: index === 0 ? 0.5 : 1.5 }}>
                  {tab.section}
                </SectionLabel>
              )}
              <NavItem isActive={isActive} onClick={() => handleTabChange(tab.key)}>
                {tab.icon}
                <Typography variant="body2" fontWeight={isActive ? 600 : 400}>
                  {tab.label}
                </Typography>
              </NavItem>
            </Box>
          );
        })}

        {/* Logout */}
        <Divider sx={{ my: 1.5 }} />
        <LogoutNavItem onClick={() => logOut()}>
          <LogoutOutlinedIcon sx={ICON_SZ} />
          <Typography variant="body2" fontWeight={500}>
            Logout
          </Typography>
        </LogoutNavItem>
      </SidebarNav>
    </SidebarWrapper>
  );

  // Find the label for the active tab
  const activeTabLabel = TABS.find((t) => t.key === activeTab)?.label ?? "Profile";
  const activeTabIcon = TABS.find((t) => t.key === activeTab)?.icon;

  return (
    <Box>
      <DashboardHeader title={t("My Profile", { defaultValue: "My Profile" })} Icon={User3} />

      {/* ── Mobile: floating tab selector bar ── */}
      {isMobile && (
        <Box
          onClick={() => setDrawerOpen(true)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 2,
            px: 2,
            py: 1.5,
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 2,
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": { borderColor: "primary.main", bgcolor: "grey.100" },
          }}
        >
          <MenuIcon sx={{ fontSize: 20, color: "text.secondary" }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
            {activeTabIcon}
            <Typography variant="body2" fontWeight={600}>
              {activeTabLabel}
            </Typography>
          </Box>
          <ChevronRightIcon sx={{ fontSize: 18, color: "text.disabled" }} />
        </Box>
      )}

      {/* ── Mobile Drawer ── */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 280,
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      <ProfileCard>
        <Grid container sx={{ minHeight: { xs: "auto", md: 600 } }}>
          {/* ── LEFT SIDEBAR (desktop only) ── */}
          <Grid
            size={{ xs: 12, md: 3 }}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            {sidebarContent}
          </Grid>

          {/* ── RIGHT CONTENT ── */}
          <Grid size={{ xs: 12, md: 9 }}>
            <ContentArea>{renderContent()}</ContentArea>
          </Grid>
        </Grid>
      </ProfileCard>
    </Box>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ─── PANEL COMPONENTS ─────────────────────────────────────────────────────────
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── Section Header ──
function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <FlexBetween mb={2.5}>
      <SectionTitleBar>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
      </SectionTitleBar>
      {action}
    </FlexBetween>
  );
}

// ── Info Row ──
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <InfoRowWrapper>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value || "\u2014"}
      </Typography>
    </InfoRowWrapper>
  );
}

// ━━━ OVERVIEW PANEL ━━━
function OverviewPanel({ user, avatarSrc }: { user: T; avatarSrc: string }) {
  const mt = user.memberType as string;
  const isBrandOrAdmin = mt === "BRAND" || mt === "ADMIN";

  // Role-specific stats
  const stats = isBrandOrAdmin
    ? [
        { label: "Articles", value: user.memberArticles ?? 0 },
        { label: "Products", value: user.memberProperties ?? 0 },
        { label: "Likes", value: user.memberLikes ?? 0 },
        { label: "Views", value: user.memberViews ?? 0 },
      ]
    : [
        { label: "Points", value: user.memberPoints ?? 0 },
        { label: "Likes", value: user.memberLikes ?? 0 },
        { label: "Views", value: user.memberViews ?? 0 },
        { label: "Rank", value: user.memberRank ?? 0 },
      ];

  return (
    <Box>
      <SectionTitle title="Profile Overview" />

      {/* Profile hero card */}
      <OverviewHeroCard>
        <FlexBox alignItems="center" gap={3} flexWrap="wrap">
          <OverviewAvatar src={avatarSrc} alt={user.memberNick as string} />
          <Box flex={1}>
            <Typography variant="h5" fontWeight={800}>
              {user.memberNick as string}
            </Typography>
            {user.memberFullName && (
              <Typography variant="body1" color="text.secondary" mt={0.25}>
                {user.memberFullName as string}
              </Typography>
            )}
            <FlexBox gap={1} mt={1} flexWrap="wrap">
              <Chip
                label={mt}
                size="small"
                color="primary"
                sx={{ fontSize: 11, fontWeight: 600 }}
              />
              {/* Points chip only for customers — earned as 1% of each purchase */}
              {!isBrandOrAdmin && (
                <Chip
                  label={`${user.memberPoints ?? 0} pts`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: 11 }}
                />
              )}
            </FlexBox>
          </Box>
        </FlexBox>
      </OverviewHeroCard>

      {/* Details */}
      <PanelCard sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
          PERSONAL INFORMATION
        </Typography>
        <InfoRow label="Username" value={user.memberNick as string} />
        <InfoRow label="Full Name" value={user.memberFullName as string} />
        <InfoRow label="Phone" value={user.memberPhone as string} />
        <InfoRow label="Address" value={user.memberAddress as string} />
        <InfoRow label="Member Type" value={mt} />
        <InfoRow label="Rank" value={String(user.memberRank ?? 0)} />

        {/* Stats — role-gated */}
        <Grid container spacing={2} mt={2}>
          {stats.map((stat) => (
            <Grid size={{ xs: 6, sm: 3 }} key={stat.label}>
              <StatCard>
                <Typography variant="h5" color="primary.main" fontWeight={700}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </StatCard>
            </Grid>
          ))}
        </Grid>
      </PanelCard>

    </Box>
  );
}

// ━━━ ORDERS PANEL ━━━
function OrdersPanel({
  orders,
  loading,
  onCancel,
  onConfirmReceived
}: {
  orders: T[];
  loading: boolean;
  onCancel: (orderId: string) => Promise<void>;
  onConfirmReceived: (orderId: string) => Promise<void>;
}) {
  const ITEMS_PER_PAGE = 2;
  const [page, setPage] = useState(1);
  const activeOrders = useMemo(
    () =>
      orders.filter((order) =>
        !["DELIVERED", "CANCELLED", "REFUNDED"].includes(String(order.orderStatus ?? ""))
      ),
    [orders]
  );
  const totalPages = Math.max(1, Math.ceil(activeOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = activeOrders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <Box>
      <SectionTitle
        title="My Orders"
        action={
          <Typography variant="body2" color="text.secondary">
            {activeOrders.length} active
          </Typography>
        }
      />

      {loading && activeOrders.length === 0 ? (
        <Stack spacing={1.5}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={180} variant="rounded" sx={{ borderRadius: 2.5 }} />
          ))}
        </Stack>
      ) : activeOrders.length === 0 ? (
        <EmptyCard>
          <LocalShippingOutlined sx={{ fontSize: 48, color: "grey.300", mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No active orders right now.
          </Typography>
          <Link href="/products/search">
            <Button variant="contained" size="small" sx={{ mt: 2 }}>
              Start Shopping
            </Button>
          </Link>
        </EmptyCard>
      ) : (
        <Stack spacing={2}>
          {paginatedOrders.map((order: T) => (
            <OrderCard key={order._id as string} sx={{ p: 1.75 }}>
              <FlexBetween flexWrap="wrap" gap={2}>
                <FlexBox alignItems="center" gap={1.5}>
                  <Avatar
                    src={resolveImage(order.brand?.memberImage as string)}
                    alt={String(order.brand?.memberNick ?? "Brand")}
                    sx={{ width: 46, height: 46 }}
                  />

                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {String(order.brand?.memberNick ?? "Brand")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Order #{String(order._id).slice(-8).toUpperCase()} • {getOrderDisplayDate(order)}
                    </Typography>
                  </Box>
                </FlexBox>

                <Box textAlign={{ xs: "left", sm: "right" }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Final total
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="primary.main">
                    {currency(Number(order.orderFinalPrice ?? order.orderTotalPrice ?? 0))}
                  </Typography>
                </Box>
              </FlexBetween>

              <OrderStatusRow>
                <FlexBox gap={1} flexWrap="wrap">
                  <Chip
                    label={String(order.orderStatus)}
                    size="small"
                    color={orderStatusColor(String(order.orderStatus))}
                    sx={{ fontWeight: 700, fontSize: 10 }}
                  />
                  <Chip
                    label={`Payment ${String(order.orderPaymentStatus ?? "PENDING")}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: 10 }}
                  />
                  <Chip
                    label={`Delivery ${String(order.orderDeliveryStatus ?? "PREPARING")}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: 10 }}
                  />
                </FlexBox>

                <Typography variant="body2" color="text.secondary">
                  {getOrderStatusMessage(String(order.orderStatus))}
                </Typography>
              </OrderStatusRow>

              <OrderSummaryGrid>
                <OrderSummaryCard>
                  <Typography variant="caption" color="text.secondary">
                    Items
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.4 }}>
                    {countOrderUnits(order)}
                  </Typography>
                </OrderSummaryCard>
                <OrderSummaryCard>
                  <Typography variant="caption" color="text.secondary">
                    Payment
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.4 }}>
                    {String(order.orderPaymentStatus ?? "PENDING")}
                  </Typography>
                </OrderSummaryCard>
                <OrderSummaryCard>
                  <Typography variant="caption" color="text.secondary">
                    Delivery
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.4 }}>
                    {String(order.orderDeliveryStatus ?? "PREPARING")}
                  </Typography>
                </OrderSummaryCard>
              </OrderSummaryGrid>

              <Divider sx={{ my: 1.5 }} />

              <OrderItemsPreview>
                {(Array.isArray(order.orderItems) ? order.orderItems : []).slice(0, 1).map((item: T) => {
                  const productImageCandidates = getOrderProductImageCandidates(item);
                  const variantText = getOrderItemVariantText(item);

                  return (
                    <OrderProductLine key={String(item._id)}>
                      <OrderProductThumb>
                        <SafeProductImage
                          srcCandidates={productImageCandidates}
                          alt={String(item?.product?.productTitle ?? "Product")}
                        />
                      </OrderProductThumb>

                      <OrderProductInfo>
                        <Typography variant="body2" fontWeight={700}>
                          {String(item?.product?.productTitle ?? "Product")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.4 }}>
                          Qty {Number(item?.itemQuantity ?? 1)} • {currency(Number(item?.subtotal ?? item?.priceAtPurchase ?? 0))}
                        </Typography>
                        {variantText && (
                          <FlexBox gap={0.75} sx={{ mt: 0.9 }} flexWrap="wrap">
                            {variantText.split(" • ").map((part) => (
                              <OrderVariantBadge key={part}>{part}</OrderVariantBadge>
                            ))}
                          </FlexBox>
                        )}
                      </OrderProductInfo>

                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}
                      >
                        {currency(Number(item?.subtotal ?? 0))}
                      </Typography>
                    </OrderProductLine>
                  );
                })}

                {(Array.isArray(order.orderItems) ? order.orderItems.length : 0) > 1 && (
                  <Typography variant="caption" color="text.secondary">
                    +{(order.orderItems as T[]).length - 1} more item(s) in this order
                  </Typography>
                )}
              </OrderItemsPreview>

              <Divider />

              <OrderActionBar>
                <Typography variant="body2" color="text.secondary">
                  {String(order.deliveryAddress?.addressCity ?? "")}
                  {order.deliveryAddress?.addressCountry ? `, ${String(order.deliveryAddress.addressCountry)}` : ""}
                </Typography>

                <FlexBox gap={1} flexWrap="wrap">
                  <Link href={`/profile?tab=orders&orderId=${order._id}`} style={{ textDecoration: "none" }}>
                    <Button size="small" variant="outlined">
                      View Details
                    </Button>
                  </Link>
                  {String(order.orderStatus) === "PENDING" && (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => onCancel(String(order._id))}
                    >
                      Cancel Order
                    </Button>
                  )}
                  {String(order.orderStatus) === "SHIPPED" && (
                    <Button
                      size="small"
                      color="success"
                      variant="contained"
                      onClick={() => onConfirmReceived(String(order._id))}
                    >
                      Mark as Received
                    </Button>
                  )}
                </FlexBox>
              </OrderActionBar>
            </OrderCard>
          ))}

          {totalPages > 1 && (
            <PaginationWrapper>
              <IconButton
                size="small"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((value) => (
                <Box
                  key={value}
                  onClick={() => setPage(value)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    transition: "all 0.15s ease",
                    ...(value === page
                      ? { backgroundColor: "primary.main", color: "white" }
                      : { "&:hover": { backgroundColor: "grey.100" } }),
                  }}
                >
                  {value}
                </Box>
              ))}

              <IconButton
                size="small"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </PaginationWrapper>
          )}
        </Stack>
      )}
    </Box>
  );
}

function OrderHistoryPanel({
  orders,
  myReviews,
  loading,
  onCreateReview
}: {
  orders: T[];
  myReviews: T[];
  loading: boolean;
  onCreateReview: (input: T) => Promise<void>;
}) {
  const router = useRouter();
  const { dispatch } = useCart();
  const { openPicker } = useVariantPicker();

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<T | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState<number | null>(5);
  const [reviewedProductIdsLocal, setReviewedProductIdsLocal] = useState<string[]>([]);
  const [reviewFiles, setReviewFiles] = useState<File[]>([]);
  const [reviewPreviews, setReviewPreviews] = useState<string[]>([]);
  const [uploadingReviewImages, setUploadingReviewImages] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const historyOrders = useMemo(
    () =>
      orders.filter((order) =>
        ["DELIVERED", "CANCELLED", "REFUNDED"].includes(String(order.orderStatus ?? ""))
      ),
    [orders]
  );
  const ITEMS_PER_PAGE = 2;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(historyOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = historyOrders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const reviewedProductIds = useMemo(
    () =>
      new Set<string>([
        ...myReviews.map((review) => String(review.productId)),
        ...reviewedProductIdsLocal,
      ]),
    [myReviews, reviewedProductIdsLocal]
  );

  const openReviewDialog = useCallback((target: T) => {
    setReviewTarget(target);
    setReviewComment("");
    setReviewRating(5);
    setReviewError("");
    reviewPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setReviewFiles([]);
    setReviewPreviews([]);
    setReviewDialogOpen(true);
  }, [reviewPreviews]);

  const closeReviewDialog = useCallback(() => {
    setReviewDialogOpen(false);
    setReviewTarget(null);
    setReviewComment("");
    setReviewRating(5);
    setReviewError("");
    reviewPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setReviewFiles([]);
    setReviewPreviews([]);
  }, [reviewPreviews]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleReviewFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const remaining = 5 - reviewFiles.length;
    if (!remaining) return;

    const toAdd = selected.slice(0, remaining);
    setReviewFiles((prev) => [...prev, ...toAdd]);
    setReviewPreviews((prev) => [...prev, ...toAdd.map((file) => URL.createObjectURL(file))]);
    e.target.value = "";
  }, [reviewFiles.length]);

  const removeReviewImage = useCallback((index: number) => {
    URL.revokeObjectURL(reviewPreviews[index]);
    setReviewFiles((prev) => prev.filter((_, i) => i !== index));
    setReviewPreviews((prev) => prev.filter((_, i) => i !== index));
  }, [reviewPreviews]);

  const handleSubmitReview = useCallback(async () => {
    if (!reviewTarget?.item?._id || !reviewTarget?.product?._id || !reviewRating || !reviewComment.trim()) {
      setReviewError("Write a review and choose a rating.");
      return;
    }

    if (reviewFiles.length > 5) {
      setReviewError("You can upload up to 5 review images.");
      return;
    }

    const itemId = String(reviewTarget.item._id);
    const productId = String(reviewTarget.product._id);
    setReviewError("");
    try {
      let reviewImages: string[] = [];

      if (reviewFiles.length > 0) {
        setUploadingReviewImages(true);

        const token = getJwtToken();
        const fileVars: Record<string, string[]> = {};
        reviewFiles.forEach((_, index) => {
          fileVars[String(index)] = [`variables.files.${index}`];
        });

        const formData = new FormData();
        formData.append(
          "operations",
          JSON.stringify({
            query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
              imagesUploader(files: $files, target: $target)
            }`,
            variables: { files: reviewFiles.map(() => null), target: "reviews" },
          })
        );
        formData.append("map", JSON.stringify(fileVars));
        reviewFiles.forEach((file, index) => formData.append(String(index), file));

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "apollo-require-preflight": "true",
            Authorization: `Bearer ${token}`,
          },
        });

        reviewImages = (response.data?.data?.imagesUploader ?? [])
          .filter((image: unknown): image is string => typeof image === "string")
          .map((image: string) => image.trim())
          .filter(Boolean);

        if (reviewImages.length !== reviewFiles.length) {
          setUploadingReviewImages(false);
          setReviewError("Some images failed to upload. Use PNG, JPG, or JPEG files only.");
          return;
        }

        setUploadingReviewImages(false);
      }

      await onCreateReview({
        productId,
        orderItemId: itemId,
        reviewRating,
        reviewComment: reviewComment.trim(),
        reviewImages,
      });
      setReviewedProductIdsLocal((prev) => Array.from(new Set([...prev, productId])));
      closeReviewDialog();
      await sweetTopSmallSuccessAlert("Review submitted");
    } catch (err: any) {
      setUploadingReviewImages(false);
      const message = err?.message || "Failed to submit review";
      if (message.includes("already reviewed this product")) {
        setReviewedProductIdsLocal((prev) => Array.from(new Set([...prev, productId])));
      }
      setReviewError(message);
    }
  }, [closeReviewDialog, onCreateReview, reviewComment, reviewFiles, reviewRating, reviewTarget]);

  const handleReorder = useCallback((productRaw: T) => {
    const product = toProductModel(productRaw);
    const hasVariants = !!(product.size?.length || product.colors?.length);

    if (hasVariants) {
      openPicker(product);
      return;
    }

      dispatch({
        type: "CHANGE_CART_AMOUNT",
        payload: {
          id: product.id,
          brandId: product.memberId,
          slug: product.slug,
          price: product.price,
          title: product.title,
        thumbnail: product.thumbnail,
        qty: 1,
      }
    });

    router.push("/mini-cart", { scroll: false });
  }, [dispatch, openPicker, router]);

  return (
    <Box>
      <SectionTitle
        title="Order History"
        action={
          <Typography variant="body2" color="text.secondary">
            {historyOrders.length} completed
          </Typography>
        }
      />

      {loading && historyOrders.length === 0 ? (
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={220} variant="rounded" sx={{ borderRadius: 2.5 }} />
          ))}
        </Stack>
      ) : historyOrders.length === 0 ? (
        <EmptyCard>
          <ConfirmationNumberOutlined sx={{ fontSize: 48, color: "grey.300", mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No order history yet.
          </Typography>
        </EmptyCard>
      ) : (
        <Stack spacing={2}>
          {paginatedOrders.map((order: T) => {
            const orderItems = (Array.isArray(order.orderItems) ? order.orderItems : []).filter((item: T) => item?.product?._id);
            return (
              <OrderCard key={String(order._id)} sx={{ p: 1.75 }}>
                <FlexBetween flexWrap="wrap" gap={2}>
                  <FlexBox alignItems="center" gap={1.5}>
                    <Avatar
                      src={resolveImage(order.brand?.memberImage as string)}
                      alt={String(order.brand?.memberNick ?? "Brand")}
                      sx={{ width: 46, height: 46 }}
                    />

                    <Box>
                      <Typography variant="subtitle1" fontWeight={800}>
                        {String(order.brand?.memberNick ?? "Brand")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Order #{String(order._id).slice(-8).toUpperCase()} • {getOrderDisplayDate(order)}
                      </Typography>
                    </Box>
                  </FlexBox>

                  <Box textAlign={{ xs: "left", sm: "right" }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Final total
                    </Typography>
                    <Typography variant="h6" fontWeight={800} color="primary.main">
                      {currency(Number(order.orderFinalPrice ?? order.orderTotalPrice ?? 0))}
                    </Typography>
                  </Box>
                </FlexBetween>

                <OrderStatusRow>
                  <FlexBox gap={1} flexWrap="wrap">
                    <Chip
                      label={String(order.orderStatus)}
                      size="small"
                      color={orderStatusColor(String(order.orderStatus))}
                      sx={{ fontWeight: 700, fontSize: 10 }}
                    />
                    <Chip
                      label={`Payment ${String(order.orderPaymentStatus ?? "PENDING")}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: 10 }}
                    />
                    <Chip
                      label={`Delivery ${String(order.orderDeliveryStatus ?? "PREPARING")}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: 10 }}
                    />
                  </FlexBox>

                  <Typography variant="body2" color="text.secondary">
                    {getOrderStatusMessage(String(order.orderStatus))}
                  </Typography>
                </OrderStatusRow>

                <OrderSummaryGrid>
                  <OrderSummaryCard>
                    <Typography variant="caption" color="text.secondary">
                      Items
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.4 }}>
                      {countOrderUnits(order)}
                    </Typography>
                  </OrderSummaryCard>
                  <OrderSummaryCard>
                    <Typography variant="caption" color="text.secondary">
                      Payment
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.4 }}>
                      {String(order.orderPaymentStatus ?? "PENDING")}
                    </Typography>
                  </OrderSummaryCard>
                  <OrderSummaryCard>
                    <Typography variant="caption" color="text.secondary">
                      Delivery
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.4 }}>
                      {String(order.orderDeliveryStatus ?? "PREPARING")}
                    </Typography>
                  </OrderSummaryCard>
                </OrderSummaryGrid>

                <Divider sx={{ my: 2 }} />

                <OrderItemsPreview>
                  {orderItems.map((item: T) => {
                    const product = item.product as T;
                    const productImageCandidates = getOrderProductImageCandidates(item);
                    const variantText = getOrderItemVariantText(item);
                    const alreadyReviewed = reviewedProductIds.has(String(product?._id));
                    const canReview = String(order.orderStatus) === "DELIVERED";

                    return (
                      <Box key={String(item._id)}>
                        <OrderProductLine>
                          <OrderProductThumb>
                            <SafeProductImage
                              srcCandidates={productImageCandidates}
                              alt={String(product?.productTitle ?? "Product")}
                            />
                          </OrderProductThumb>

                          <OrderProductInfo>
                            <Typography variant="body2" fontWeight={700}>
                              {String(product?.productTitle ?? "Product")}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.4 }}>
                              Qty {Number(item?.itemQuantity ?? 1)} • {currency(Number(item?.subtotal ?? item?.priceAtPurchase ?? 0))}
                            </Typography>
                            {variantText && (
                              <FlexBox gap={0.75} sx={{ mt: 0.9 }} flexWrap="wrap">
                                {variantText.split(" • ").map((part) => (
                                  <OrderVariantBadge key={part}>{part}</OrderVariantBadge>
                                ))}
                              </FlexBox>
                            )}
                          </OrderProductInfo>

                          <Stack
                            direction={{ xs: "row", sm: "column" }}
                            spacing={1}
                            alignItems={{ xs: "flex-start", sm: "flex-end" }}
                            sx={{ display: { xs: "none", sm: "flex" } }}
                          >
                            <Button size="small" variant="outlined" onClick={() => handleReorder(product)}>
                              Reorder
                            </Button>
                            {canReview && (
                              <Button
                                size="small"
                                variant="contained"
                                disabled={alreadyReviewed}
                                onClick={() => openReviewDialog({ order, item, product })}
                              >
                                {alreadyReviewed ? "Reviewed" : "Write Review"}
                              </Button>
                            )}
                          </Stack>
                        </OrderProductLine>

                        <FlexBox
                          gap={1}
                          flexWrap="wrap"
                          sx={{ display: { xs: "flex", sm: "none" }, mt: 1.25 }}
                        >
                          <Button size="small" variant="outlined" onClick={() => handleReorder(product)}>
                            Reorder
                          </Button>
                          {canReview && (
                            <Button
                              size="small"
                              variant="contained"
                              disabled={alreadyReviewed}
                              onClick={() => openReviewDialog({ order, item, product })}
                            >
                              {alreadyReviewed ? "Reviewed" : "Write Review"}
                            </Button>
                          )}
                        </FlexBox>
                      </Box>
                    );
                  })}
                </OrderItemsPreview>
              </OrderCard>
            );
          })}

          {totalPages > 1 && (
            <PaginationWrapper>
              <IconButton
                size="small"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((value) => (
                <Box
                  key={value}
                  onClick={() => setPage(value)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    transition: "all 0.15s ease",
                    ...(value === page
                      ? { backgroundColor: "primary.main", color: "white" }
                      : { "&:hover": { backgroundColor: "grey.100" } }),
                  }}
                >
                  {value}
                </Box>
              ))}

              <IconButton
                size="small"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </PaginationWrapper>
          )}
        </Stack>
      )}

      <Dialog open={reviewDialogOpen} onClose={closeReviewDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Write Review</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {reviewError && <Alert severity="error">{reviewError}</Alert>}

            <Box>
              <Typography variant="body2" fontWeight={600} mb={1}>
                Rating
              </Typography>
              <Rating
                value={reviewRating}
                onChange={(_, value) => setReviewRating(value)}
              />
            </Box>

            <TextField
              label="Review"
              multiline
              minRows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Write what you think about this product"
              fullWidth
            />

            <Box>
              <Typography variant="body2" fontWeight={600} mb={1}>
                Review Images (optional)
              </Typography>
              <FlexBox gap={1.25} flexWrap="wrap">
                {reviewPreviews.map((src, index) => (
                  <Box
                    key={`${src}-${index}`}
                    sx={{ position: "relative", width: 76, height: 76, borderRadius: 2, overflow: "hidden" }}
                  >
                    <Box
                      component="img"
                      src={src}
                      alt={`Review preview ${index + 1}`}
                      sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeReviewImage(index)}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 22,
                        height: 22,
                        bgcolor: "rgba(17, 24, 39, 0.82)",
                        color: "common.white",
                        "&:hover": { bgcolor: "error.main" },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ))}

                {reviewFiles.length < 5 && (
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<AddPhotoAlternateOutlinedIcon />}
                    sx={{ minHeight: 76, px: 2 }}
                  >
                    Add Photos ({reviewFiles.length}/5)
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleReviewFileChange}
                    />
                  </Button>
                )}
              </FlexBox>
              <Typography variant="caption" color="text.secondary">
                Upload between 1 and 5 images with your review.
              </Typography>
            </Box>

            <FlexBetween>
              <Button variant="text" onClick={closeReviewDialog}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitReview}
                loading={uploadingReviewImages}
                disabled={reviewFiles.length < 1 || reviewFiles.length > 5}
              >
                Submit Review
              </Button>
            </FlexBetween>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

// ━━━ ADDRESSES PANEL ━━━
function AddressesPanel() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<T | null>(null);

  const { data, loading, refetch } = useQuery(GET_ADDRESSES, {
    fetchPolicy: "cache-and-network",
  });
  const addresses: T[] = (data as T)?.getAddresses ?? [];

  const [deleteAddress] = useMutation(DELETE_ADDRESS);

  const handleAdd = () => { setEditingAddress(null); setDialogOpen(true); };
  const handleEdit = (addr: T) => { setEditingAddress(addr); setDialogOpen(true); };
  const handleClose = () => { setDialogOpen(false); setEditingAddress(null); };
  const handleSaved = () => { handleClose(); refetch(); };

  const handleDelete = async (id: string) => {
    const confirmed = await sweetConfirmAlert("Delete address?", "This address will be permanently removed.");
    if (!confirmed) return;
    try {
      await deleteAddress({ variables: { input: id } });
      await sweetTopSmallSuccessAlert("Address deleted");
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err?.message || "Failed to delete address");
    }
  };

  return (
    <Box>
      <SectionTitle
        title="Shipping Addresses"
        action={
          <Button size="small" variant="contained" onClick={handleAdd}>
            + Add New
          </Button>
        }
      />

      {loading ? (
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={96} variant="rounded" sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      ) : addresses.length === 0 ? (
        <EmptyCard>
          <HomeOutlined sx={{ fontSize: 48, color: "grey.300", mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No saved addresses yet.
          </Typography>
          <Button variant="contained" size="small" sx={{ mt: 2 }} onClick={handleAdd}>
            Add Your First Address
          </Button>
        </EmptyCard>
      ) : (
        <Stack spacing={2}>
          {addresses.map((addr: T) => (
            <PanelCard
              key={addr._id as string}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: addr.isDefault ? "primary.main" : "divider",
                bgcolor: addr.isDefault ? "primary.50" : "background.paper",
              }}
            >
              <FlexBetween gap={2} flexWrap="wrap">
                <Box flex={1}>
                  <FlexBox alignItems="center" gap={1} mb={0.5}>
                    <Typography variant="body2" fontWeight={700}>
                      {addr.addressName as string}
                    </Typography>
                    {addr.isDefault && (
                      <Chip label="Default" size="small" color="primary" sx={{ fontSize: 10, height: 18 }} />
                    )}
                  </FlexBox>
                  <Typography variant="body2" color="text.secondary">
                    {addr.addressLine1 as string}
                    {addr.addressLine2 ? `, ${addr.addressLine2 as string}` : ""}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {[addr.addressCity, addr.addressZipCode, addr.addressCountry].filter(Boolean).join(", ")}
                  </Typography>
                  {addr.addressPhone && (
                    <Typography variant="caption" color="text.secondary">
                      {addr.addressPhone as string}
                    </Typography>
                  )}
                </Box>
                <FlexBox gap={1} flexShrink={0}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditOutlined sx={{ fontSize: 14 }} />}
                    onClick={() => handleEdit(addr)}
                    sx={{ fontSize: 12 }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => handleDelete(addr._id as string)}
                    sx={{ fontSize: 12 }}
                  >
                    Delete
                  </Button>
                </FlexBox>
              </FlexBetween>
            </PanelCard>
          ))}
        </Stack>
      )}

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingAddress ? "Edit Address" : "Add New Address"}
        </DialogTitle>
        <DialogContent>
          <AddressForm address={editingAddress} onSuccess={handleSaved} onCancel={handleClose} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

// ━━━ PRODUCT GRID PANEL (Recently Visited / Favorites) ━━━
function ProductGridPanel({
  title,
  products,
  loading,
  emptyMsg
}: {
  title: string;
  products: T[];
  loading: boolean;
  emptyMsg: string;
}) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  const resolveProductImage = (img?: string | null): string => {
    if (!img || img === "null" || img === "undefined") {
      return "/assets/images/products/product-1.png";
    }
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    const normalized = img.startsWith("/") ? img : `/${img}`;
    return base ? `${base}${normalized}` : normalized;
  };

  const parseVariantValues = (value?: string[] | string): string[] => {
    if (!value) return [];
    const rawValues = Array.isArray(value) ? value : value.split(/[,/|]/);
    return Array.from(new Set(rawValues.map((item) => item.trim()).filter(Boolean)));
  };

  const toProductModel = (p: T): Product => {
    const rawImages = Array.isArray(p.productImages) ? (p.productImages as string[]) : [];
    const thumb = resolveProductImage(rawImages[0]);
    const price = p.productPrice as number;
    const discPrice = p.productDiscountPrice as number;
    const discount = discPrice && price ? Math.round(((price - discPrice) / price) * 100) : 0;
    return {
      id: p._id as string,
      memberId: p.memberId as string,
      slug: p._id as string,
      title: p.productTitle as string,
      price,
      discount,
      thumbnail: thumb,
      images: rawImages.map((img: string) => resolveProductImage(img)),
      rating: (p.productRatingAverage as number) ?? 0,
      size: parseVariantValues(p.productSize as string[] | string),
      colors: parseVariantValues(p.productColor as string[] | string),
      categories: [],
      meLiked: !!(p.meLiked as T[])?.some?.((l: T) => l.myFavorite),
      productLikes: p.productLikes as number,
      productViews: p.productViews as number,
      productStockQuantity: p.productStockQuantity as number,
      productRatingCount: p.productRatingCount as number,
    };
  };

  return (
    <Box>
      <SectionTitle title={title} />

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={i}>
              <Skeleton height={280} variant="rounded" sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : products.length === 0 ? (
        <EmptyCard>
          <FavoriteBorderIcon sx={{ fontSize: 48, color: "grey.300", mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            {emptyMsg}
          </Typography>
          <Link href="/products/search">
            <Button variant="contained" size="small" sx={{ mt: 2 }}>
              Browse Products
            </Button>
          </Link>
        </EmptyCard>
      ) : (
        <Box
          sx={{
            "& .hover-box": { opacity: 0, pointerEvents: "none" },
            "& .MuiCard-root:hover .hover-box": { opacity: 0 }
          }}
        >
          <Grid container spacing={2}>
            {products.map((p: T) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={p._id as string}>
                <ProductCard1 product={toProductModel(p)} showFavorite={false} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}

// ━━━ PEOPLE PANEL (Followers / Followings) ━━━
function PeoplePanel({
  title,
  people,
  loading,
  dataKey,
  emptyMsg,
  onFollow,
  onUnfollow,
  pendingFollowIds,
}: {
  title: string;
  people: T[];
  loading: boolean;
  dataKey: "followerData" | "followingData";
  emptyMsg: string;
  onFollow: (id: string) => Promise<void>;
  onUnfollow: (id: string) => Promise<void>;
  pendingFollowIds: Record<string, boolean>;
}) {
  const ITEMS_PER_PAGE = 6;
  const [page, setPage] = useState(1);
  const router = useRouter();
  const totalPages = Math.max(1, Math.ceil(people.length / ITEMS_PER_PAGE));
  const paginated = people.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleNavigate = (fd: T) => {
    const mt = fd.memberType as string;
    if (mt === "BRAND" || mt === "ADMIN") {
      router.push(`/brands/${fd._id}`);
    }
    // CUSTOMER: no public profile page — do nothing
  };

  return (
    <Box>
      <SectionTitle
        title={title}
        action={
          <Typography variant="body2" color="text.secondary">
            {people.length} total
          </Typography>
        }
      />

      {loading && people.length === 0 ? (
        <Box>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2, py: 2, px: 2.5, borderBottom: "1px solid", borderColor: "grey.100" }}>
              <Skeleton variant="circular" width={48} height={48} />
              <Box flex={1}>
                <Skeleton width={120} />
                <Skeleton width={200} sx={{ mt: 0.5 }} />
              </Box>
              <Skeleton width={80} height={36} variant="rounded" />
            </Box>
          ))}
        </Box>
      ) : people.length === 0 ? (
        <EmptyCard>
          <PeopleAltOutlinedIcon sx={{ fontSize: 48, color: "grey.300", mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            {emptyMsg}
          </Typography>
        </EmptyCard>
      ) : (
        <PeopleTableWrapper>
          {/* Table Header (hidden on mobile) */}
          <PeopleTableHeader>
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
              Name
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
              Details
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8} textAlign="right">
              Subscription
            </Typography>
          </PeopleTableHeader>

          {/* Table body — grows to fill space */}
          <Box sx={{ flex: 1 }}>
          {/* Rows */}
          {paginated.map((f: T) => {
            const fd = (f[dataKey] as T) ?? {};
            const memberType = fd.memberType as string;
            const memberImg = resolveImage(fd.memberImage as string);
            const memberId = fd._id as string;
            const isFollowing = !!(f.meFollowed as T[])?.[0]?.myFollowing;
            const isBrandOrAdmin = memberType === "BRAND" || memberType === "ADMIN";
            const isPending = !!pendingFollowIds[memberId];
            return (
              <PeopleTableRow key={f._id as string}>
                {/* Name Cell */}
                <PeopleNameCell>
                  <Avatar
                    src={memberImg}
                    alt={fd.memberNick as string}
                    sx={{
                      width: 48,
                      height: 48,
                      cursor: "pointer",
                      border: isBrandOrAdmin ? "2px solid" : "none",
                      borderColor: memberType === "BRAND" ? "primary.main" : "info.main",
                    }}
                    onClick={() => handleNavigate(fd)}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        cursor: "pointer",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        "&:hover": { color: "primary.main" }
                      }}
                      onClick={() => handleNavigate(fd)}
                    >
                      {fd.memberNick as string}
                    </Typography>
                    {isBrandOrAdmin && (
                      <Chip
                        label={memberType}
                        size="small"
                        color={memberType === "BRAND" ? "primary" : "info"}
                        variant="outlined"
                        sx={{ fontSize: 9, height: 18, mt: 0.3 }}
                      />
                    )}
                  </Box>
                </PeopleNameCell>

                {/* Details Cell */}
                <PeopleDetailsCell>
                  <DetailBadge>
                    <PeopleAltOutlinedIcon sx={{ fontSize: 15 }} />
                    <Typography variant="caption" fontWeight={600}>
                      Followers ({(fd.memberFollowers as number) ?? 0})
                    </Typography>
                  </DetailBadge>
                  <DetailBadge>
                    <GroupsOutlinedIcon sx={{ fontSize: 15 }} />
                    <Typography variant="caption" fontWeight={600}>
                      Followings ({(fd.memberFollowings as number) ?? 0})
                    </Typography>
                  </DetailBadge>
                  {isBrandOrAdmin && (
                    <DetailBadge>
                      <ArticleOutlinedIcon sx={{ fontSize: 15 }} />
                      <Typography variant="caption" fontWeight={600}>
                        Articles ({(fd.memberArticles as number) ?? 0})
                      </Typography>
                    </DetailBadge>
                  )}
                  {memberType === "BRAND" && (
                    <DetailBadge>
                      <StorefrontOutlinedIcon sx={{ fontSize: 15 }} />
                      <Typography variant="caption" fontWeight={600}>
                        Products ({(fd.memberProducts as number) ?? 0})
                      </Typography>
                    </DetailBadge>
                  )}
                </PeopleDetailsCell>

                {/* Subscription Cell */}
                <PeopleSubscriptionCell>
                  {isFollowing ? (
                    <>
                      <Typography variant="caption" color="text.secondary" fontStyle="italic" sx={{ display: { xs: "none", sm: "block" } }}>
                        Following
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={isPending}
                        onClick={() => onUnfollow(memberId)}
                        sx={{
                          borderRadius: 5,
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "none",
                          px: 2,
                          py: 0.3,
                          minWidth: 0,
                        }}
                      >
                        Unfollow
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      disabled={isPending}
                      onClick={() => onFollow(memberId)}
                      sx={{
                        borderRadius: 5,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "none",
                        px: 2.5,
                        py: 0.3,
                        minWidth: 0,
                        boxShadow: "none",
                        "&:hover": { boxShadow: "none" },
                      }}
                    >
                      Follow
                    </Button>
                  )}
                </PeopleSubscriptionCell>
              </PeopleTableRow>
            );
          })}
          </Box>

          {/* Pagination + total — pinned at bottom */}
          <Box sx={{ mt: "auto" }}>
          {totalPages > 1 && (
            <PaginationWrapper>
              <IconButton
                size="small"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Box
                  key={p}
                  onClick={() => setPage(p)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    transition: "all 0.15s ease",
                    ...(p === page
                      ? { backgroundColor: "success.main", color: "white" }
                      : { "&:hover": { backgroundColor: "grey.100" } }
                    ),
                  }}
                >
                  {p}
                </Box>
              ))}
              <IconButton
                size="small"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </PaginationWrapper>
          )}

          <Typography variant="body2" color="text.secondary" textAlign="center" py={1.5}>
            {people.length} {title.toLowerCase().includes("follower") ? "followers" : "followings"}
          </Typography>
          </Box>
        </PeopleTableWrapper>
      )}
    </Box>
  );
}

// ━━━ COUPON PANEL ━━━
function CouponPanel({
  couponCode,
  setCouponCode,
  couponMsg,
  setCouponMsg,
  handleClaimCoupon,
  claimLoading,
  availableCouponsLoading,
  availableCoupons,
  claimsLoading,
  couponClaims
}: {
  couponCode: string;
  setCouponCode: (v: string) => void;
  couponMsg: { type: "success" | "error"; text: string } | null;
  setCouponMsg: (v: { type: "success" | "error"; text: string } | null) => void;
  handleClaimCoupon: (code?: string) => void;
  claimLoading: boolean;
  availableCouponsLoading: boolean;
  availableCoupons: T[];
  claimsLoading: boolean;
  couponClaims: T[];
}) {
  return (
    <Box>
      <SectionTitle title="Coupons" />

      {/* Available coupons */}
      <PanelCard sx={{ mb: 3 }}>
        <FlexBox alignItems="center" gap={1.5} mb={2}>
          <CardGiftcardOutlined color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            Available Coupons
          </Typography>
        </FlexBox>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Eligible coupons appear here automatically. Claims are first-come, first-served until the limit is reached.
        </Typography>

        {availableCouponsLoading ? (
          <Stack spacing={1.5}>
            {[1, 2].map((item) => (
              <Skeleton key={item} variant="rounded" height={116} />
            ))}
          </Stack>
        ) : availableCoupons.length ? (
          <Stack spacing={1.5}>
            {availableCoupons.map((coupon: T) => {
              const remainingClaims =
                coupon.couponMaxUsage == null
                  ? "Unlimited claims"
                  : `${Math.max(0, Number(coupon.couponMaxUsage ?? 0) - Number(coupon.couponUsageCount ?? 0))} left`;
              const discountLabel =
                coupon.discountType === "PERCENTAGE"
                  ? `${coupon.discountValue ?? 0}% off`
                  : `${currency(coupon.discountValue ?? 0)} off`;

              return (
                <Box
                  key={String(coupon._id)}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper"
                  }}
                >
                  <FlexBetween gap={2} alignItems="flex-start" flexWrap="wrap">
                    <Box>
                      <FlexBox alignItems="center" gap={1} mb={0.75}>
                        <Typography variant="subtitle1" fontWeight={800}>
                          {coupon.couponCode}
                        </Typography>
                        <Chip
                          label={coupon.couponType === "BRAND" ? "Brand" : "Platform"}
                          size="small"
                          color={coupon.couponType === "BRAND" ? "info" : "primary"}
                          sx={{ fontSize: 11, fontWeight: 700 }}
                        />
                      </FlexBox>

                      <Typography variant="body2" fontWeight={700}>
                        {discountLabel}
                      </Typography>

                      <Typography variant="caption" color="text.secondary" display="block" mt={0.75}>
                        {coupon.minOrderCount ? `Min ${coupon.minOrderCount} delivered orders` : "No order minimum"}
                        {` · ${remainingClaims}`}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      onClick={() => handleClaimCoupon(String(coupon.couponCode ?? ""))}
                      disabled={claimLoading}
                    >
                      Claim
                    </Button>
                  </FlexBetween>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Box textAlign="center" py={3}>
            <CardGiftcardOutlined sx={{ fontSize: 48, color: "grey.300", mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              No eligible coupons right now.
            </Typography>
          </Box>
        )}

        {couponMsg && (
          <Alert severity={couponMsg.type} sx={{ mt: 2, borderRadius: 2 }}>
            {couponMsg.text}
          </Alert>
        )}
      </PanelCard>

      {/* Manual code claim */}
      <PanelCard sx={{ mb: 3 }}>
        <FlexBox alignItems="center" gap={1.5} mb={2}>
          <ConfirmationNumberOutlined color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            Claim by Code
          </Typography>
        </FlexBox>

        <Typography variant="body2" color="text.secondary" mb={2}>
          If you received a private code, you can still claim it manually here.
        </Typography>

        <FlexBox gap={1.5} alignItems="flex-start" flexWrap="wrap">
          <TextField
            size="small"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value);
              setCouponMsg(null);
            }}
            placeholder="Enter coupon code"
            sx={{ flex: 1, minWidth: 200 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleClaimCoupon();
            }}
          />
          <Button
            variant="outlined"
            onClick={() => handleClaimCoupon()}
            disabled={!couponCode.trim() || claimLoading}
            sx={{ px: 4 }}
          >
            Claim
          </Button>
        </FlexBox>
      </PanelCard>

      {/* Claimed coupon details */}
      <PanelCard>
        <FlexBox alignItems="center" gap={1.5} mb={2}>
          <ConfirmationNumberOutlined color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            My Claimed Coupons
          </Typography>
        </FlexBox>

        {claimsLoading ? (
          <Stack spacing={1.5}>
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} variant="rounded" height={96} />
            ))}
          </Stack>
        ) : couponClaims.length ? (
          <Stack spacing={1.5}>
            {couponClaims.map((claim: T) => {
              const coupon = claim.coupon as T;
              const isClaimed = claim.claimStatus === "CLAIMED";
              const discountLabel =
                coupon?.discountType === "PERCENTAGE"
                  ? `${coupon?.discountValue ?? 0}% off`
                  : `${currency(coupon?.discountValue ?? 0)} off`;

              return (
                <Box
                  key={String(claim._id)}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: "1px solid",
                    borderColor: isClaimed ? "success.main" : "divider",
                    bgcolor: isClaimed ? "success.50" : "background.paper"
                  }}
                >
                  <FlexBetween gap={2} alignItems="flex-start" flexWrap="wrap">
                    <Box>
                      <FlexBox alignItems="center" gap={1} mb={0.75}>
                        <Typography variant="subtitle1" fontWeight={800}>
                          {coupon?.couponCode || "Coupon"}
                        </Typography>
                        <Chip
                          label={claim.claimStatus || "CLAIMED"}
                          size="small"
                          color={isClaimed ? "success" : "default"}
                          sx={{ fontSize: 11, fontWeight: 700 }}
                        />
                      </FlexBox>

                      <Typography variant="body2" fontWeight={700}>
                        {discountLabel}
                      </Typography>

                      <Typography variant="caption" color="text.secondary" display="block" mt={0.75}>
                        {coupon?.couponType === "BRAND" ? "Brand coupon" : "Platform coupon"}
                        {coupon?.minOrderCount ? ` · Min ${coupon.minOrderCount} delivered orders` : ""}
                      </Typography>
                    </Box>

                    <Box sx={{ minWidth: 180 }}>
                      <InfoRow
                        label="Claimed"
                        value={new Date((claim.claimedAt as string) || (claim.createdAt as string)).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          }
                        )}
                      />
                      {claim.usedAt && (
                        <InfoRow
                          label="Used"
                          value={new Date(claim.usedAt as string).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        />
                      )}
                    </Box>
                  </FlexBetween>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Box textAlign="center" py={3}>
            <ConfirmationNumberOutlined sx={{ fontSize: 48, color: "grey.300", mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              No coupon claimed yet.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Use the form above to claim your first coupon!
            </Typography>
          </Box>
        )}
      </PanelCard>
    </Box>
  );
}

// ━━━ EDIT PROFILE PANEL ━━━
function EditProfilePanel({
  updateData,
  setUpdateData,
  editMsg,
  handleUpdateProfile,
  updateLoading,
  doDisabledCheck,
  avatarSrc,
  uploadImage,
}: {
  updateData: {
    memberNick: string;
    memberFullName: string;
    memberPhone: string;
    memberAddress: string;
    memberDesc: string;
    memberImage: string;
    memberEmail: string;
  };
  setUpdateData: React.Dispatch<
    React.SetStateAction<{
      memberNick: string;
      memberFullName: string;
      memberPhone: string;
      memberAddress: string;
      memberDesc: string;
      memberImage: string;
      memberEmail: string;
    }>
  >;
  editMsg: { type: "success" | "error"; text: string } | null;
  handleUpdateProfile: () => void;
  updateLoading: boolean;
  doDisabledCheck: () => boolean;
  avatarSrc: string;
  uploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  // ── Change password local state ──
  const [pwData, setPwData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPw, setShowPw] = useState({ old: false, next: false, confirm: false });
  const [changePassword, { loading: pwLoading }] = useMutation(CHANGE_PASSWORD);

  const handleChangePassword = async () => {
    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (pwData.newPassword.length < 7) {
      setPwMsg({ type: "error", text: "Password must be at least 7 characters." });
      return;
    }
    setPwMsg(null);
    try {
      await changePassword({
        variables: { input: { oldPassword: pwData.oldPassword, newPassword: pwData.newPassword } }
      });
      setPwData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setPwMsg({ type: "success", text: "Password changed!" });
    } catch (err: any) {
      const msg = err?.graphQLErrors?.[0]?.message || "Failed to change password.";
      setPwMsg({ type: "error", text: msg });
    }
  };

  return (
    <Box>
      <SectionTitle title="Edit Profile" />

      {/* Photo upload */}
      <PanelCard sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary">
          PROFILE PHOTO
        </Typography>

        <FlexBox alignItems="center" gap={3}>
          <AvatarUploadWrapper>
            <EditAvatar src={avatarSrc} alt="Profile" />
            <label
              htmlFor="profile-img-upload"
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 30,
                height: 30,
                borderRadius: "50%",
                backgroundColor: "var(--mui-palette-primary-main, #D23F57)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 3px 5px -1px rgba(0,0,0,.2)",
                transition: "all 0.2s",
              }}
            >
              <CameraEnhance sx={{ fontSize: 16, color: "white" }} />
            </label>
            <input
              type="file"
              id="profile-img-upload"
              accept="image/jpg, image/jpeg, image/png"
              onChange={uploadImage}
              style={{ display: "none" }}
            />
          </AvatarUploadWrapper>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              Upload Profile Image
            </Typography>
            <Typography variant="caption" color="text.secondary">
              A photo must be in JPG, JPEG or PNG format!
            </Typography>
          </Box>
        </FlexBox>
      </PanelCard>

      {/* Personal information */}
      <PanelCard sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={700} mb={2.5} color="text.secondary">
          PERSONAL INFORMATION
        </Typography>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="medium"
              label="Username"
              placeholder="Your username"
              value={updateData.memberNick}
              onChange={(e) => setUpdateData((prev) => ({ ...prev, memberNick: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="medium"
              label="Full Name"
              placeholder="Your full name"
              value={updateData.memberFullName}
              onChange={(e) => setUpdateData((prev) => ({ ...prev, memberFullName: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="medium"
              label="Email"
              type="email"
              placeholder="Your email"
              value={updateData.memberEmail}
              onChange={(e) => setUpdateData((prev) => ({ ...prev, memberEmail: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="medium"
              label="Phone"
              placeholder="Your phone"
              value={updateData.memberPhone}
              onChange={(e) => setUpdateData((prev) => ({ ...prev, memberPhone: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="medium"
              label="Address"
              placeholder="Your address"
              value={updateData.memberAddress}
              onChange={(e) => setUpdateData((prev) => ({ ...prev, memberAddress: e.target.value }))}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              size="medium"
              label="Description"
              placeholder="Tell us about yourself"
              value={updateData.memberDesc}
              onChange={(e) => setUpdateData((prev) => ({ ...prev, memberDesc: e.target.value }))}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>

        {editMsg && (
          <Alert severity={editMsg.type} sx={{ mt: 2, borderRadius: 2 }}>
            {editMsg.text}
          </Alert>
        )}

        <Box mt={3}>
          <Button
            variant="contained"
            size="large"
            onClick={handleUpdateProfile}
            disabled={doDisabledCheck() || updateLoading}
            loading={updateLoading}
            sx={{ px: 5 }}
          >
            Save Changes
          </Button>
        </Box>
      </PanelCard>

      {/* Change password */}
      <PanelCard>
        <Typography variant="subtitle2" fontWeight={700} mb={2.5} color="text.secondary">
          CHANGE PASSWORD
        </Typography>

        <Grid container spacing={2.5}>
          <Grid size={12}>
            <TextField
              fullWidth
              size="medium"
              label="Current Password"
              type={showPw.old ? "text" : "password"}
              value={pwData.oldPassword}
              onChange={(e) => setPwData((prev) => ({ ...prev, oldPassword: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPw((prev) => ({ ...prev, old: !prev.old }))}
                      edge="end"
                      size="small"
                    >
                      {showPw.old ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="medium"
              label="New Password"
              type={showPw.next ? "text" : "password"}
              value={pwData.newPassword}
              onChange={(e) => setPwData((prev) => ({ ...prev, newPassword: e.target.value }))}
              helperText="7–20 characters"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPw((prev) => ({ ...prev, next: !prev.next }))}
                      edge="end"
                      size="small"
                    >
                      {showPw.next ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="medium"
              label="Confirm New Password"
              type={showPw.confirm ? "text" : "password"}
              value={pwData.confirmPassword}
              onChange={(e) => setPwData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPw((prev) => ({ ...prev, confirm: !prev.confirm }))}
                      edge="end"
                      size="small"
                    >
                      {showPw.confirm ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>

        {pwMsg && (
          <Alert severity={pwMsg.type} sx={{ mt: 2, borderRadius: 2 }}>
            {pwMsg.text}
          </Alert>
        )}

        <Box mt={3}>
          <Button
            variant="outlined"
            size="large"
            onClick={handleChangePassword}
            disabled={!pwData.oldPassword || !pwData.newPassword || !pwData.confirmPassword || pwLoading}
            loading={pwLoading}
            sx={{ px: 5 }}
          >
            Change Password
          </Button>
        </Box>
      </PanelCard>
    </Box>
  );
}

// ━━━ ARTICLES PANEL (BRAND + ADMIN) ━━━
function ArticlesPanel({ articles, loading }: { articles: T[]; loading: boolean }) {
  return (
    <Box>
      <SectionTitle
        title="My Articles"
        action={
          <Link href="/community/write">
            <Button size="small" variant="contained" sx={{ fontSize: 12 }}>
              + Write
            </Button>
          </Link>
        }
      />

      {loading ? (
        <Stack spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={72} variant="rounded" sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      ) : articles.length === 0 ? (
        <EmptyCard>
          <ArticleOutlinedIcon sx={{ fontSize: 48, color: "grey.300", mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No articles yet.
          </Typography>
        </EmptyCard>
      ) : (
        <Stack spacing={1}>
          {articles.map((a: T) => {
            const imgSrc = resolveImage((a.articleImages as string[])?.[0]) || "";
            return (
              <Link key={a._id as string} href={`/community/${a._id}`} style={{ textDecoration: "none" }}>
                <OrderCard>
                  <FlexBox alignItems="center" gap={2}>
                    {imgSrc && (
                      <Box sx={{ width: 60, height: 60, borderRadius: 1.5, overflow: "hidden", flexShrink: 0 }}>
                        <Image src={imgSrc} alt={a.articleTitle as string} width={60} height={60} style={{ objectFit: "cover" }} />
                      </Box>
                    )}
                    <Box flex={1} minWidth={0}>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {a.articleTitle as string}
                      </Typography>
                      <FlexBox gap={1} mt={0.5} alignItems="center">
                        <Chip label={a.articleCategory as string} size="small" sx={{ fontSize: 10 }} />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(a.createdAt as string).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </Typography>
                      </FlexBox>
                    </Box>
                  </FlexBox>
                </OrderCard>
              </Link>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
