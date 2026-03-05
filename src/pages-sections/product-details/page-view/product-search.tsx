"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
// MUI
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import Typography from "@mui/material/Typography";
// MUI ICONS
import Apps from "@mui/icons-material/Apps";
import ViewList from "@mui/icons-material/ViewList";
import FilterList from "@mui/icons-material/FilterList";
import FlashOn from "@mui/icons-material/FlashOn";
// GLOBAL CUSTOM COMPONENTS
import Sidenav from "components/side-nav";
import { FlexBetween, FlexBox } from "components/flex-box";
import ProductFilters from "components/products-view/filters";
import ProductsGridView from "components/products-view/products-grid-view";
import ProductsListView from "components/products-view/products-list-view";
// APOLLO
import { useQuery } from "../../../lib/hooks/useQuery";
import { GET_BRANDS, GET_CATEGORIES, GET_PRODUCTS } from "../../../../apollo/user/query";
import { T } from "../../../lib/types/common";
// CUSTOM DATA MODEL
import Product from "models/Product.model";
import Filters from "models/Filters";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GqlProduct {
  _id: string;
  productTitle: string;
  productPrice: number;
  productDiscountPrice: number;
  productImages: string[];
  productRatingAverage: number;
  productLikes: number;
  productViews: number;
  productRank?: number;
  productType?: string;
  productCategoryId?: string;
  memberData?: { memberNick?: string };
  productColor?: string;
  productSize?: string;
  productMaterials?: string;
  productStockQuantity?: number;
  meLiked?: { myFavorite?: boolean }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toProductModel(p: GqlProduct): Product {
  const discountPct =
    p.productDiscountPrice > 0 && p.productDiscountPrice < p.productPrice
      ? Math.round(((p.productPrice - p.productDiscountPrice) / p.productPrice) * 100)
      : 0;
  return {
    id: p._id,
    slug: p._id,
    title: p.productTitle,
    price: p.productPrice,
    discount: discountPct,
    thumbnail: p.productImages?.[0] ?? "/assets/images/products/product-1.png",
    images: p.productImages ?? [],
    rating: p.productRatingAverage ?? 0,
    categories: [],
    productLikes: p.productLikes,
    productViews: p.productViews,
    productRank: p.productRank,
    meLiked: p.meLiked?.[0]?.myFavorite ?? false,
    productStockQuantity: p.productStockQuantity,
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** How many products to fetch from backend in a single request */
const BACKEND_LIMIT = 100;
/** How many products to show per display page */
const DISPLAY_LIMIT = 12;

// Maps hex swatch value → text substrings to match against productColor (seed stores text names)
const COLOR_NAME_MAP: Record<string, string[]> = {
  "#1C1C1C": ["black"],
  "#FFFFFF": ["white"],
  "#8B0000": ["red"],
  "#00008B": ["blue", "navy"],
  "#006400": ["green"],
  "#FFD700": ["yellow", "gold"],
  "#FF8C00": ["orange"],
  "#808080": ["gray", "grey"],
  "#FFC0CB": ["pink"],
  "#A52A2A": ["brown"],
};

const SORT_OPTIONS = [
  { label: "Newest First",       value: "newest" },
  { label: "Most Popular",       value: "popular" },
  { label: "Trending",           value: "trending" },
  { label: "Flash Deals",        value: "flash_deals" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

const SORT_MAP: Record<string, { sort: string; direction: string }> = {
  newest:      { sort: "createdAt",    direction: "DESC" },
  popular:     { sort: "productLikes", direction: "DESC" },
  trending:    { sort: "productViews", direction: "DESC" },
  flash_deals: { sort: "productLikes", direction: "DESC" },
  price_asc:   { sort: "productPrice", direction: "ASC" },
  price_desc:  { sort: "productPrice", direction: "DESC" },
};

// Static parts — colors/others never change
const BASE_FILTER_COLORS = [
  "#1C1C1C", "#FFFFFF", "#8B0000", "#00008B",
  "#006400", "#FFD700", "#FF8C00", "#808080",
  "#FFC0CB", "#A52A2A",
];
const BASE_FILTER_OTHERS = [
  { label: "On Sale",  value: "sale" },
  { label: "In Stock", value: "instock" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductSearchPageView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q          = searchParams.get("q") || "";
  const page       = Number(searchParams.get("page") || "1");
  const sort       = searchParams.get("sort") || "newest";
  const view       = searchParams.get("view") || "grid";
  const categoryId = searchParams.get("categoryId") || "";

  // Sidebar filter values (set by useProductFilterCard inside ProductFilters)
  const prices    = JSON.parse(searchParams.get("prices")    || "[0,300]") as number[];
  const brands    = JSON.parse(searchParams.get("brands")    || "[]")      as string[];
  const colors    = JSON.parse(searchParams.get("colors")    || "[]")      as string[];
  const rating    = Number(searchParams.get("rating")        || "0");
  const sales     = JSON.parse(searchParams.get("sales")     || "[]")      as string[];
  const sizes     = JSON.parse(searchParams.get("sizes")     || "[]")      as string[];
  const materials = JSON.parse(searchParams.get("materials") || "[]")      as string[];
  const discount  = Number(searchParams.get("discount")      || "0");

  const { sort: backendSort, direction } = SORT_MAP[sort] ?? SORT_MAP.newest;

  // Only pass text search to backend — all other filters are applied client-side
  const search: Record<string, unknown> = {};
  if (q) search.text = q;

  /** APOLLO REQUESTS **/
  const {
    loading: getProductsLoading,
    data: getProductsData,
    error: _getProductsError,
    refetch: _getProductsRefetch,
  } = useQuery(GET_PRODUCTS, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: BACKEND_LIMIT, sort: backendSort, direction, search } },
    notifyOnNetworkStatusChange: true,
  });

  const {
    loading: _getBrandsLoading,
    data: getBrandsData,
    error: _getBrandsError,
    refetch: _getBrandsRefetch,
  } = useQuery(GET_BRANDS, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 100 } },
    notifyOnNetworkStatusChange: true,
  });

  const {
    loading: _getCategoriesLoading,
    data: getCategoriesData,
    error: _getCategoriesError,
    refetch: _getCategoriesRefetch,
  } = useQuery(GET_CATEGORIES, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 200 } },
    notifyOnNetworkStatusChange: true,
  });

  // Build dynamic brands list from real backend data
  const dynamicBrands = useMemo(() => {
    const list = (getBrandsData as T)?.getBrands?.brands ?? [];
    return list
      .filter((b: T) => b.memberData?.memberNick)
      .map((b: T) => ({ label: b.brandName as string, value: b.memberData.memberNick as string }));
  }, [getBrandsData]);

  // Build full filters object — brands from backend, rest static
  const filters: Filters = useMemo(() => ({
    brands: dynamicBrands,
    categories: [],
    colors: BASE_FILTER_COLORS,
    others: BASE_FILTER_OTHERS,
  }), [dynamicBrands]);

  // Build a set of category IDs to include when a category is selected.
  // If the selected category has children, include parent + all children.
  const activeCategoryIds = useMemo((): Set<string> => {
    if (!categoryId) return new Set();
    const allCats: T[] = (getCategoriesData as T)?.getCategories?.list ?? [];
    const children = allCats.filter(
      (c: T) => c.parentCategoryId && c.parentCategoryId.toString() === categoryId
    );
    const ids = new Set<string>([categoryId]);
    children.forEach((c: T) => ids.add(c._id.toString()));
    return ids;
  }, [categoryId, getCategoriesData]);

  // Raw products from backend
  const rawProducts: GqlProduct[] = useMemo(
    () => (getProductsData as T)?.getProducts?.products ?? [],
    [getProductsData]
  );

  // Client-side filters applied to ALL fetched products
  const filteredProducts: Product[] = useMemo(() => {
    let list = rawProducts;

    // Category filter — supports parent categories by including all children
    if (activeCategoryIds.size > 0) {
      list = list.filter((p) => p.productCategoryId && activeCategoryIds.has(p.productCategoryId.toString()));
    }

    if (prices[0] > 0 || prices[1] < 300) {
      list = list.filter((p) => p.productPrice >= prices[0] && p.productPrice <= prices[1]);
    }
    if (brands.length > 0) {
      list = list.filter((p) => p.memberData?.memberNick && brands.includes(p.memberData.memberNick));
    }
    if (colors.length > 0) {
      list = list.filter((p) => {
        if (!p.productColor) return false;
        const pc = p.productColor.toLowerCase();
        return colors.some((hex) => {
          const names = COLOR_NAME_MAP[hex] ?? [hex];
          return names.some((name) => pc.includes(name));
        });
      });
    }
    if (sizes.length > 0) {
      list = list.filter((p) => p.productSize && sizes.includes(p.productSize));
    }
    if (materials.length > 0) {
      list = list.filter((p) =>
        p.productMaterials && materials.includes(p.productMaterials)
      );
    }
    if (discount > 0) {
      list = list.filter((p) => {
        if (!p.productDiscountPrice || p.productDiscountPrice >= p.productPrice) return false;
        const pct = Math.round(((p.productPrice - p.productDiscountPrice) / p.productPrice) * 100);
        return pct >= discount;
      });
    }
    if (rating > 0) {
      // Show products that would display as X stars (rating >= X - 0.5)
      // E.g., "5 stars" filter shows products with rating >= 4.5
      const minRating = rating - 0.5;
      list = list.filter((p) => p.productRatingAverage >= minRating);
    }
    const saleSelected = sales.includes("sale");
    const inStockSelected = sales.includes("instock");

    if (saleSelected && inStockSelected) {
      list = list.filter(
        (p) =>
          (p.productDiscountPrice > 0 && p.productDiscountPrice < p.productPrice) ||
          (p.productStockQuantity ?? 0) > 0
      );
    } else if (saleSelected) {
      list = list.filter((p) => p.productDiscountPrice > 0 && p.productDiscountPrice < p.productPrice);
    } else if (inStockSelected) {
      list = list.filter((p) => (p.productStockQuantity ?? 0) > 0);
    }

    // Flash Deals: keep only discounted items, then sort by discount % descending
    if (sort === "flash_deals") {
      list = list.filter((p) => p.productDiscountPrice > 0 && p.productDiscountPrice < p.productPrice);
      list = [...list].sort((a, b) => {
        const discA = ((a.productPrice - a.productDiscountPrice) / a.productPrice) * 100;
        const discB = ((b.productPrice - b.productDiscountPrice) / b.productPrice) * 100;
        return discB - discA;
      });
    }

    return list.map(toProductModel);
  }, [rawProducts, activeCategoryIds, prices, brands, colors, sizes, materials, discount, rating, sales, sort]);

  // Client-side pagination on filtered results
  const total      = filteredProducts.length;
  const pageCount  = Math.max(1, Math.ceil(total / DISPLAY_LIMIT));
  const safePage   = Math.min(page, pageCount);
  const firstIndex = total === 0 ? 0 : (safePage - 1) * DISPLAY_LIMIT + 1;
  const lastIndex  = Math.min(safePage * DISPLAY_LIMIT, total);
  const displayProducts = useMemo(
    () => filteredProducts.slice((safePage - 1) * DISPLAY_LIMIT, safePage * DISPLAY_LIMIT),
    [filteredProducts, safePage]
  );

  const handleChangeSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleChangeView = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-white pt-2 pb-4">
      <Container>
        {/* TOP BAR — title + sort + view toggle */}
        <FlexBetween flexWrap="wrap" gap={2} mb={2}>
          <div>
            {sort === "flash_deals" && (
              <FlexBox alignItems="center" gap={0.5} mb={0.5}>
                <FlashOn sx={{ color: "error.main", fontSize: 22 }} />
                <Typography variant="h5" sx={{ color: "error.main", fontWeight: 700 }}>
                  Flash Deals
                </Typography>
              </FlexBox>
            )}
            {q && (
              <Typography variant="h5" sx={{ mb: 0.5 }}>
                Results for &ldquo;{q}&rdquo;
              </Typography>
            )}
            <Typography variant="body1" color="text.secondary">
              {getProductsLoading ? "Loading…" : `${total} products found`}
            </Typography>
          </div>

          <FlexBox alignItems="center" columnGap={4} flexWrap="wrap">
            {/* SORT */}
            <FlexBox alignItems="center" gap={1} flex="1 1 0">
              <Typography variant="body1" sx={{ color: "grey.600", whiteSpace: "pre" }}>
                Sort by:
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={sort}
                variant="outlined"
                placeholder="Sort by"
                onChange={(e) => handleChangeSort(e.target.value)}
                sx={{ flex: "1 1 0", minWidth: "150px" }}
              >
                {SORT_OPTIONS.map((item) => (
                  <MenuItem value={item.value} key={item.value}>{item.label}</MenuItem>
                ))}
              </TextField>
            </FlexBox>

            {/* VIEW TOGGLE */}
            <FlexBox alignItems="center" my="0.25rem">
              <Typography variant="body1" sx={{ color: "grey.600", mr: 1 }}>
                View:
              </Typography>
              <IconButton onClick={() => handleChangeView("grid")}>
                <Apps fontSize="small" color={view === "grid" ? "primary" : "inherit"} />
              </IconButton>
              <IconButton onClick={() => handleChangeView("list")}>
                <ViewList fontSize="small" color={view === "list" ? "primary" : "inherit"} />
              </IconButton>

              {/* MOBILE FILTER BUTTON */}
              <Box display={{ md: "none", xs: "block" }}>
                <Sidenav
                  handler={(close) => (
                    <IconButton onClick={close}>
                      <FilterList fontSize="small" />
                    </IconButton>
                  )}
                >
                  <Box px={3} py={2}>
                    <ProductFilters filters={filters} />
                  </Box>
                </Sidenav>
              </Box>
            </FlexBox>
          </FlexBox>
        </FlexBetween>

        <Grid container spacing={4}>
          {/* LEFT SIDEBAR FILTER */}
          <Grid size={{ xl: 2, md: 3 }} sx={{ display: { md: "block", xs: "none" } }}>
            <ProductFilters filters={filters} />
          </Grid>

          {/* PRODUCT VIEW AREA */}
          <Grid size={{ xl: 10, md: 9, xs: 12 }}>
            {getProductsLoading ? (
              <Grid container spacing={3}>
                {Array.from({ length: DISPLAY_LIMIT }).map((_, i) => (
                  <Grid key={i} size={{ xl: 3, lg: 4, md: 4, sm: 6, xs: 12 }}>
                    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="text" width="70%" sx={{ mt: 1 }} />
                    <Skeleton variant="text" width="40%" />
                  </Grid>
                ))}
              </Grid>
            ) : displayProducts.length === 0 ? (
              <Box py={10} textAlign="center">
                <Typography variant="h6" color="text.secondary">No products found.</Typography>
              </Box>
            ) : view === "grid" ? (
              <ProductsGridView products={displayProducts} />
            ) : (
              <ProductsListView products={displayProducts} />
            )}

            {/* PAGINATION */}
            {!getProductsLoading && total > DISPLAY_LIMIT && (
              <FlexBetween flexWrap="wrap" mt={6}>
                <Typography variant="body1" sx={{ color: "grey.600" }}>
                  Showing {firstIndex}–{lastIndex} of {total} products
                </Typography>
                <Pagination
                  color="primary"
                  variant="outlined"
                  page={safePage}
                  count={pageCount}
                  onChange={(_, p) => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("page", p.toString());
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                />
              </FlexBetween>
            )}
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
