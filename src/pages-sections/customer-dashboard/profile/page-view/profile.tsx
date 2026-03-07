"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
// MUI
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid";
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
import FavoriteIcon from "@mui/icons-material/Favorite";
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
// REACT-i18n
import { useTranslation } from "../../../../../node_modules/react-i18next";
// APOLLO
import { useReactiveVar, useMutation } from "@apollo/client/react";
import { userVar } from "../../../../../apollo/store";
import { useQuery } from "../../../../lib/hooks/useQuery";
import {
  GET_MY_ORDERS,
  GET_MEMBER,
  GET_MEMBER_FOLLOWINGS,
  GET_MEMBER_FOLLOWERS,
  GET_VISITED_PRODUCTS,
  GET_ADDRESSES,
  GET_BOARD_ARTICLES,
} from "../../../../../apollo/user/query";
import { CLAIM_COUPON, UPDATE_MEMBER, SUBSCRIBE, UNSUBSCRIBE, CHANGE_PASSWORD } from "../../../../../apollo/user/mutation";
// GLOBAL CUSTOM COMPONENTS
import { FlexBetween, FlexBox } from "components/flex-box";
import ProductCard1 from "components/product-cards/product-card-1/product-card";
import Product from "models/Product.model";
import DashboardHeader from "../../dashboard-header";
import User3 from "icons/User3";
// CUSTOM TYPES
import { T } from "../../../../lib/types/common";
// UTILS
import { currency } from "lib";
import { getJwtToken, logOut, updateStorage, setUserFromMemberData } from "lib/auth";
import { sweetMixinSuccessAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert, sweetTopSmallErrorAlert } from "../../../../lib/sweetAlert";
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
  roleOnly?: "BRAND_ADMIN" | "CUSTOMER";
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
    label: "My Addresses",
    icon: <HomeOutlined sx={ICON_SZ} />,
    roleOnly: "CUSTOMER",
    section: "ACCOUNT"
  },
  {
    key: "claim-coupon",
    label: "Claim Coupon",
    icon: <CardGiftcardOutlined sx={ICON_SZ} />,
    roleOnly: "CUSTOMER"
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
  if (["PENDING", "PROCESSING"].includes(status)) return "warning";
  if (["PAID", "DELIVERED", "COMPLETED"].includes(status)) return "success";
  if (["CANCELLED", "REFUNDED"].includes(status)) return "error";
  return "default";
}

function resolveImage(img: string | undefined | null): string {
  if (!img || img.trim() === "") return "";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  const path = img.startsWith("/") ? img : `/${img}`;
  return `${base}${path}`;
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ProfilePageView() {
  const { t } = useTranslation();
  const user = useReactiveVar(userVar);
  const token = getJwtToken();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const isBrandOrAdmin = user.memberType === "BRAND" || user.memberType === "ADMIN";
  const isCustomer = user.memberType === "CUSTOMER";

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Switch tab + auto-close drawer on mobile
  const handleTabChange = useCallback((key: TabKey) => {
    setActiveTab(key);
    if (isMobile) setDrawerOpen(false);
  }, [isMobile]);

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

  const handleClaimCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    setCouponMsg(null);
    try {
      const result = await claimCoupon({ variables: { couponCode: couponCode.trim() } });

      const claimedMember = (result?.data as T)?.claimCoupon;
      if (claimedMember?.accessToken) updateStorage({ jwtToken: claimedMember.accessToken });
      setUserFromMemberData(claimedMember);

      setCouponMsg({ type: "success", text: "Coupon claimed successfully!" });
      setCouponCode("");
      await sweetMixinSuccessAlert("Coupon claimed!");
    } catch (err: any) {
      console.error("Coupon error:", err);
      setCouponMsg({ type: "error", text: "Invalid or expired coupon code." });
      await sweetMixinErrorAlert("Invalid or expired coupon code");
    }
  }, [couponCode, claimCoupon]);

  /** APOLLO QUERIES **/
  // Fetch full member profile to get email (not in JWT)
  const { data: memberData } = useQuery(GET_MEMBER, {
    variables: { input: user._id },
    skip: !user._id,
    fetchPolicy: "cache-and-network",
  });
  const memberEmail: string = (memberData as T)?.getMember?.memberEmail ?? "";

  // Sync email when query data loads (email lives in GET_MEMBER, not in userVar)
  useEffect(() => {
    if (memberEmail) setUpdateData((prev) => ({ ...prev, memberEmail }));
  }, [memberEmail]);

  const { loading: ordersLoading, data: ordersData } = useQuery(GET_MY_ORDERS, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 10 } },
    notifyOnNetworkStatusChange: true
  });

  const { loading: visitedLoading, data: visitedData } = useQuery(GET_VISITED_PRODUCTS, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 12 } },
    notifyOnNetworkStatusChange: true
  });

  const { loading: followingsLoading, data: followingsData } = useQuery(GET_MEMBER_FOLLOWINGS, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 50, search: { followerId: user._id } } },
    notifyOnNetworkStatusChange: true,
    skip: !user._id
  });

  const { loading: followersLoading, data: followersData } = useQuery(GET_MEMBER_FOLLOWERS, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 50, search: { followingId: user._id } } },
    notifyOnNetworkStatusChange: true,
    skip: !user._id
  });

  const { loading: articlesLoading, data: articlesData } = useQuery(GET_BOARD_ARTICLES, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 10, search: { memberId: user._id } } },
    skip: !user._id || !isBrandOrAdmin
  });

  const { loading: addressesLoading, data: addressesData } = useQuery(GET_ADDRESSES, {
    fetchPolicy: "cache-and-network",
    skip: !user._id || !isCustomer
  });

  // ── Data extraction ──
  const orders: T[] = (ordersData as T)?.getMyOrders?.orders ?? [];
  const visitedProducts: T[] = (visitedData as T)?.getVisitedProducts?.products ?? [];
  const followings: T[] = (followingsData as T)?.getMemberFollowings?.list ?? [];
  const followers: T[] = (followersData as T)?.getMemberFollowers?.list ?? [];
  const myArticles: T[] = (articlesData as T)?.getBoardArticles?.list ?? [];
  const addresses: T[] = (addressesData as T)?.getAddresses ?? [];

  // ── Follow / Unfollow handlers ──
  const handleFollow = useCallback(async (targetId: string) => {
    try {
      await subscribeMember({ variables: { input: targetId } });
      sweetTopSmallSuccessAlert("Followed");
    } catch (err: any) {
      console.error("Follow error:", err);
      sweetTopSmallErrorAlert(err.message || "Failed to follow");
    }
  }, [subscribeMember]);

  const handleUnfollow = useCallback(async (targetId: string) => {
    try {
      await unsubscribeMember({ variables: { input: targetId } });
      sweetTopSmallSuccessAlert("Unfollowed");
    } catch (err: any) {
      console.error("Unfollow error:", err);
      sweetTopSmallErrorAlert(err.message || "Failed to unfollow");
    }
  }, [unsubscribeMember]);

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
        return <OverviewPanel user={user} avatarSrc={avatarSrc} />;
      case "orders":
        return <OrdersPanel orders={orders} loading={ordersLoading} />;
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
          />
        );
      case "articles":
        return (
          <ArticlesPanel articles={myArticles} loading={articlesLoading} />
        );
      case "addresses":
        return (
          <AddressesPanel addresses={addresses} loading={addressesLoading} />
        );
      case "claim-coupon":
        return (
          <CouponPanel
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            couponMsg={couponMsg}
            setCouponMsg={setCouponMsg}
            handleClaimCoupon={handleClaimCoupon}
            claimLoading={claimLoading}
            user={user}
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
              {(user as T).memberFollowers ?? 0}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize={10}>
              Followers
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box textAlign="center">
            <Typography variant="subtitle2" fontWeight={700}>
              {(user as T).memberFollowings ?? 0}
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
          if (tab.roleOnly === "CUSTOMER") return isCustomer;
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
        <LogoutNavItem onClick={logOut}>
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
function OrdersPanel({ orders, loading }: { orders: T[]; loading: boolean }) {
  return (
    <Box>
      <SectionTitle title="My Orders" />

      {loading ? (
        <Stack spacing={1.5}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={64} variant="rounded" sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      ) : orders.length === 0 ? (
        <EmptyCard>
          <LocalShippingOutlined sx={{ fontSize: 48, color: "grey.300", mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No orders yet.
          </Typography>
          <Link href="/products/search">
            <Button variant="contained" size="small" sx={{ mt: 2 }}>
              Start Shopping
            </Button>
          </Link>
        </EmptyCard>
      ) : (
        <Stack spacing={1}>
          {orders.map((order: T) => (
            <Link
              key={order._id as string}
              href={`/orders/${order._id}`}
              style={{ textDecoration: "none" }}
            >
              <OrderCard>
                <FlexBetween flexWrap="wrap" gap={1}>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      Order #{(order._id as string).slice(-8).toUpperCase()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(order.createdAt as string).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </Typography>
                  </Box>
                  <FlexBox alignItems="center" gap={2}>
                    <Chip
                      label={order.orderStatus as string}
                      size="small"
                      color={orderStatusColor(order.orderStatus as string)}
                      sx={{ fontWeight: 600, fontSize: 10 }}
                    />
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                      {currency((order.orderFinalPrice ?? order.orderTotalPrice) as number)}
                    </Typography>
                  </FlexBox>
                </FlexBetween>
              </OrderCard>
            </Link>
          ))}
        </Stack>
      )}
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
  const parseVariantValues = (value?: string[] | string): string[] => {
    if (!value) return [];
    const rawValues = Array.isArray(value) ? value : value.split(/[,/|]/);
    return Array.from(new Set(rawValues.map((item) => item.trim()).filter(Boolean)));
  };

  const toProductModel = (p: T): Product => {
    const rawImg = (p.productImages as string[])?.[0] ?? "";
    const thumb = rawImg.startsWith("http") ? rawImg : rawImg ? `${base}/${rawImg}` : "/assets/images/products/product-1.png";
    const price = p.productPrice as number;
    const discPrice = p.productDiscountPrice as number;
    const discount = discPrice && price ? Math.round(((price - discPrice) / price) * 100) : 0;
    return {
      id: p._id as string,
      slug: p._id as string,
      title: p.productTitle as string,
      price,
      discount,
      thumbnail: thumb,
      images: (p.productImages as string[] ?? []).map((img: string) =>
        img.startsWith("http") ? img : `${base}/${img}`
      ),
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
}: {
  title: string;
  people: T[];
  loading: boolean;
  dataKey: "followerData" | "followingData";
  emptyMsg: string;
  onFollow: (id: string) => void;
  onUnfollow: (id: string) => void;
}) {
  const ITEMS_PER_PAGE = 6;
  const [page, setPage] = useState(1);
  const [localPeople, setLocalPeople] = useState<T[]>([]);
  const router = useRouter();

  useEffect(() => {
    setLocalPeople(people);
  }, [people]);

  const totalPages = Math.max(1, Math.ceil(localPeople.length / ITEMS_PER_PAGE));
  const paginated = localPeople.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const isFollowingsList = title.toLowerCase().includes("followings");

  const getMemberId = (row: T) => {
    const fd = (row[dataKey] as T) ?? {};
    return fd._id as string;
  };

  const toggleLocalFollow = (targetId: string, nextFollowing: boolean) => {
    setLocalPeople((prev) =>
      prev.map((row) => {
        const fd = (row[dataKey] as T) ?? {};
        if ((fd._id as string) !== targetId) return row;
        return { ...row, meFollowed: [{ myFollowing: nextFollowing }] };
      })
    );
  };

  const handleFollowClick = (targetId: string) => {
    toggleLocalFollow(targetId, true);
    onFollow(targetId);
  };

  const handleUnfollowClick = (targetId: string) => {
    if (isFollowingsList) {
      setLocalPeople((prev) => prev.filter((row) => getMemberId(row) !== targetId));
    } else {
      toggleLocalFollow(targetId, false);
    }
    onUnfollow(targetId);
  };

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

      {loading ? (
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
                        onClick={() => handleUnfollowClick(memberId)}
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
                      onClick={() => handleFollowClick(memberId)}
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
  user
}: {
  couponCode: string;
  setCouponCode: (v: string) => void;
  couponMsg: { type: "success" | "error"; text: string } | null;
  setCouponMsg: (v: { type: "success" | "error"; text: string } | null) => void;
  handleClaimCoupon: () => void;
  claimLoading: boolean;
  user: T;
}) {
  return (
    <Box>
      <SectionTitle title="Coupons" />

      {/* Claim coupon */}
      <PanelCard sx={{ mb: 3 }}>
        <FlexBox alignItems="center" gap={1.5} mb={2}>
          <CardGiftcardOutlined color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            Claim a Coupon
          </Typography>
        </FlexBox>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Enter your coupon code below to claim your discount.
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
            variant="contained"
            onClick={handleClaimCoupon}
            disabled={!couponCode.trim() || claimLoading}
            loading={claimLoading}
            sx={{ px: 4 }}
          >
            Claim
          </Button>
        </FlexBox>

        {couponMsg && (
          <Alert severity={couponMsg.type} sx={{ mt: 2, borderRadius: 2 }}>
            {couponMsg.text}
          </Alert>
        )}
      </PanelCard>

      {/* Claimed coupon details */}
      <PanelCard>
        <FlexBox alignItems="center" gap={1.5} mb={2}>
          <ConfirmationNumberOutlined color="primary" />
          <Typography variant="subtitle1" fontWeight={700}>
            My Claimed Coupon
          </Typography>
        </FlexBox>

        {(user as T).memberCouponId ? (
          <Box>
            {/* Coupon visual card */}
            <Box
              sx={{
                p: 2.5,
                mb: 2,
                borderRadius: 2.5,
                border: "2px dashed",
                borderColor:
                  ((user as T).memberCouponStatus as string) === "ACTIVE"
                    ? "success.main"
                    : "grey.300",
                bgcolor:
                  ((user as T).memberCouponStatus as string) === "ACTIVE"
                    ? "success.50"
                    : "grey.50",
                textAlign: "center"
              }}
            >
              <CardGiftcardOutlined
                sx={{
                  fontSize: 40,
                  color:
                    ((user as T).memberCouponStatus as string) === "ACTIVE"
                      ? "success.main"
                      : "grey.400",
                  mb: 1
                }}
              />
              <Typography variant="h6" fontWeight={700}>
                Coupon
              </Typography>
              <Chip
                label={((user as T).memberCouponStatus as string) || "ACTIVE"}
                size="small"
                color={
                  ((user as T).memberCouponStatus as string) === "ACTIVE"
                    ? "success"
                    : ((user as T).memberCouponStatus as string) === "EXPIRED"
                      ? "error"
                      : "default"
                }
                sx={{ mt: 1, fontSize: 11, fontWeight: 700 }}
              />
            </Box>

            {/* Coupon info rows */}
            <InfoRow label="Status" value={((user as T).memberCouponStatus as string) || "N/A"} />
            {(user as T).memberCouponAssignedAt && (
              <InfoRow
                label="Claimed At"
                value={new Date((user as T).memberCouponAssignedAt as string).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  }
                )}
              />
            )}
            {(user as T).memberCouponUsedAt && (
              <InfoRow
                label="Used At"
                value={new Date((user as T).memberCouponUsedAt as string).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  }
                )}
              />
            )}

            {((user as T).memberCouponStatus as string) === "ACTIVE" && (
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                This coupon will be applied automatically at checkout.
              </Alert>
            )}
            {((user as T).memberCouponStatus as string) === "EXPIRED" && (
              <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                This coupon has been used. Claim a new one above!
              </Alert>
            )}
          </Box>
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

// ━━━ ADDRESSES PANEL (CUSTOMER) ━━━
function AddressesPanel({ addresses, loading }: { addresses: T[]; loading: boolean }) {
  return (
    <Box>
      <SectionTitle
        title="My Addresses"
        action={
          <Link href="/address">
            <Button size="small" variant="outlined" sx={{ fontSize: 12 }}>
              + Add Address
            </Button>
          </Link>
        }
      />

      {loading ? (
        <Stack spacing={1.5}>
          {[1, 2].map((i) => (
            <Skeleton key={i} height={80} variant="rounded" sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      ) : addresses.length === 0 ? (
        <EmptyCard>
          <HomeOutlined sx={{ fontSize: 48, color: "grey.300", mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No addresses saved yet.
          </Typography>
          <Link href="/address">
            <Button variant="contained" size="small" sx={{ mt: 2 }}>
              Add Your First Address
            </Button>
          </Link>
        </EmptyCard>
      ) : (
        <Stack spacing={1.5}>
          {addresses.map((addr: T) => (
            <PanelCard key={addr._id as string} sx={{ p: 2 }}>
              <FlexBetween>
                <Box>
                  <FlexBox gap={1} alignItems="center" mb={0.5}>
                    <Typography variant="body2" fontWeight={700}>
                      {addr.addressName as string}
                    </Typography>
                    {addr.isDefault && (
                      <Chip label="Default" size="small" color="primary" sx={{ fontSize: 10, height: 18 }} />
                    )}
                  </FlexBox>
                  <Typography variant="caption" color="text.secondary">
                    {addr.addressLine1 as string}
                    {addr.addressLine2 ? `, ${addr.addressLine2 as string}` : ""}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {addr.addressCity as string}, {addr.addressCountry as string} {addr.addressZipCode as string}
                  </Typography>
                  {addr.addressPhone && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {addr.addressPhone as string}
                    </Typography>
                  )}
                </Box>
                <Link href="/address">
                  <Button size="small" variant="text" sx={{ fontSize: 12 }}>
                    Edit
                  </Button>
                </Link>
              </FlexBetween>
            </PanelCard>
          ))}
        </Stack>
      )}
    </Box>
  );
}
