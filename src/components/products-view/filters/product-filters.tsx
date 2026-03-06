"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
// MUI
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Collapse from "@mui/material/Collapse";
import TextField from "@mui/material/TextField";
import FormGroup from "@mui/material/FormGroup";
import Typography from "@mui/material/Typography";
// GLOBAL CUSTOM COMPONENTS
import { FlexBetween, FlexBox } from "components/flex-box";
// LOCAL CUSTOM COMPONENTS
import CheckboxLabel from "./checkbox-label";
// CUSTOM LOCAL HOOK
import useProductFilterCard from "./use-product-filter-card";
// TYPES
import Filters from "models/Filters";

// ─── Constants ────────────────────────────────────────────────────────────────

const BRANDS_PREVIEW = 4;

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const EU_SHOE_SIZES  = ["EU 36", "EU 37", "EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44"];
const DENIM_SIZES    = ["28/30", "30/30", "32/30", "32/32", "34/30"];
const DISCOUNT_OPTIONS = [
  { label: "10% or more",  value: 10 },
  { label: "20% or more",  value: 20 },
  { label: "30% or more",  value: 30 },
  { label: "50% or more",  value: 50 },
];
const MATERIALS = ["Cotton", "Leather", "Wool", "Denim", "Polyester", "Silk", "Synthetic"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductFilters({ filters }: { filters: Filters }) {
  const { brands: BRANDS, others: OTHERS, colors: COLORS, categoryFilters } = filters;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [brandsHovered, setBrandsHovered] = useState(false);

  const {
    sales,
    brands,
    rating,
    colors,
    prices,
    sizes,
    materials,
    categoryId,
    discount,
    handleChangeBrand,
    handleChangeColor,
    handleChangePrice,
    handleChangeSales,
    handleChangeSize,
    handleChangeMaterial,
    handleChangeCategory,
    handleChangeDiscount,
    handleChangeSearchParams,
  } = useProductFilterCard();

  const handleClearFilters = () => {
    router.push(pathname);
  };

  const normalizePriceValue = (value: string): number => {
    const digitsOnly = value.replace(/[^\d]/g, "");
    const normalized = digitsOnly.replace(/^0+(?=\d)/, "");
    return Number(normalized || 0);
  };

  const inputPriceValue = (value: number): string => (value === 0 ? "" : String(value));

  return (
    <div>
      {/* ── PRICE RANGE ───────────────────────────────────────── */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Price Range
      </Typography>

      <Slider
        min={0}
        max={300}
        size="small"
        value={prices}
        valueLabelDisplay="auto"
        valueLabelFormat={(v) => `$${v}`}
        onChange={(_, v) => handleChangePrice(v as number[])}
      />

      <FlexBetween>
        <TextField
          fullWidth
          size="small"
          type="text"
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          placeholder="0"
          value={inputPriceValue(prices[0])}
          onFocus={(e) => e.target.select()}
          onChange={(e) => handleChangePrice([normalizePriceValue(e.target.value), prices[1]])}
        />
        <Typography variant="h5" sx={{ px: 1, color: "grey.600" }}>-</Typography>
        <TextField
          fullWidth
          size="small"
          type="text"
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          placeholder="250"
          value={inputPriceValue(prices[1])}
          onFocus={(e) => e.target.select()}
          onChange={(e) => handleChangePrice([prices[0], normalizePriceValue(e.target.value)])}
        />
      </FlexBetween>

      <Box component={Divider} my={3} />

      {categoryFilters && categoryFilters.length > 0 && (
        <>
          {/* ── CATEGORIES ───────────────────────────────────────── */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Categories
          </Typography>

          <FormGroup>
            {categoryFilters.map(({ label, value }) => (
              <CheckboxLabel
                key={value}
                label={label}
                checked={categoryId === value}
                onChange={() => handleChangeCategory(value)}
              />
            ))}
          </FormGroup>

          <Box component={Divider} my={3} />
        </>
      )}

      {/* ── SIZE ─────────────────────────────────────────────── */}
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Size
      </Typography>

      <Typography variant="caption" sx={{ color: "grey.500", mb: 0.5, display: "block" }}>
        Clothing
      </Typography>
      <FlexBox flexWrap="wrap" gap={0.75} mb={1.5}>
        {CLOTHING_SIZES.map((s) => (
          <Chip
            key={s}
            label={s}
            size="small"
            variant={sizes.includes(s) ? "filled" : "outlined"}
            color={sizes.includes(s) ? "primary" : "default"}
            onClick={() => handleChangeSize(s)}
            sx={{ cursor: "pointer", fontSize: 12 }}
          />
        ))}
      </FlexBox>

      <Typography variant="caption" sx={{ color: "grey.500", mb: 0.5, display: "block" }}>
        Shoes — EU
      </Typography>
      <FlexBox flexWrap="wrap" gap={0.75} mb={1.5}>
        {EU_SHOE_SIZES.map((s) => (
          <Chip
            key={s}
            label={s}
            size="small"
            variant={sizes.includes(s) ? "filled" : "outlined"}
            color={sizes.includes(s) ? "primary" : "default"}
            onClick={() => handleChangeSize(s)}
            sx={{ cursor: "pointer", fontSize: 11 }}
          />
        ))}
      </FlexBox>

      <Typography variant="caption" sx={{ color: "grey.500", mb: 0.5, display: "block" }}>
        Denim
      </Typography>
      <FlexBox flexWrap="wrap" gap={0.75} mb={0.5}>
        {DENIM_SIZES.map((s) => (
          <Chip
            key={s}
            label={s}
            size="small"
            variant={sizes.includes(s) ? "filled" : "outlined"}
            color={sizes.includes(s) ? "primary" : "default"}
            onClick={() => handleChangeSize(s)}
            sx={{ cursor: "pointer", fontSize: 11 }}
          />
        ))}
      </FlexBox>

      <Box component={Divider} my={3} />

      {BRANDS.length > 0 && (
        <>
          {/* ── BRANDS ───────────────────────────────────────────── */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Brands
          </Typography>

          <Box
            onMouseEnter={() => setBrandsHovered(true)}
            onMouseLeave={() => setBrandsHovered(false)}
          >
            <FormGroup>
              {BRANDS.slice(0, BRANDS_PREVIEW).map(({ label, value }) => (
                <CheckboxLabel
                  key={value}
                  label={label}
                  checked={brands.includes(value)}
                  onChange={() => handleChangeBrand(value)}
                />
              ))}
            </FormGroup>

            <Collapse in={brandsHovered} timeout={300}>
              <FormGroup>
                {BRANDS.slice(BRANDS_PREVIEW).map(({ label, value }) => (
                  <CheckboxLabel
                    key={value}
                    label={label}
                    checked={brands.includes(value)}
                    onChange={() => handleChangeBrand(value)}
                  />
                ))}
              </FormGroup>
            </Collapse>

            {!brandsHovered && BRANDS.length > BRANDS_PREVIEW && (
              <Typography
                variant="caption"
                sx={{ color: "grey.400", mt: 0.5, display: "block", userSelect: "none" }}
              >
                +{BRANDS.length - BRANDS_PREVIEW} more
              </Typography>
            )}
          </Box>

          <Box component={Divider} my={3} />
        </>
      )}

      {/* ── COLORS ───────────────────────────────────────────── */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Colors
      </Typography>

      <FlexBox mb={2} flexWrap="wrap" gap={1.5}>
        {COLORS.map((item) => (
          <Box
            key={item}
            bgcolor={item}
            onClick={() => handleChangeColor(item)}
            sx={{
              width: 25,
              height: 25,
              flexShrink: 0,
              outlineOffset: 2,
              cursor: "pointer",
              borderRadius: 3,
              outline: colors.includes(item) ? 2 : 0,
              outlineColor: item === "#FFFFFF" ? "#111" : item,
              border: item === "#FFFFFF" ? "1px solid #e0e0e0" : "none",
              boxShadow: colors.includes(item) ? "0 0 0 2px rgba(0,0,0,0.08)" : "none",
            }}
          />
        ))}
      </FlexBox>

      <Box component={Divider} my={3} />

      {/* ── DISCOUNT % ───────────────────────────────────────── */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Discount
      </Typography>

      <FormGroup>
        {DISCOUNT_OPTIONS.map(({ label, value }) => (
          <CheckboxLabel
            key={value}
            label={label}
            checked={discount === value}
            onChange={() => handleChangeDiscount(value)}
          />
        ))}
      </FormGroup>

      <Box component={Divider} my={3} />

      {/* ── MATERIAL ─────────────────────────────────────────── */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Material
      </Typography>

      <FormGroup>
        {MATERIALS.map((m) => (
          <CheckboxLabel
            key={m}
            label={m}
            checked={materials.includes(m)}
            onChange={() => handleChangeMaterial(m)}
          />
        ))}
      </FormGroup>

      <Box component={Divider} my={3} />

      {/* ── AVAILABILITY ─────────────────────────────────────── */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Availability
      </Typography>

      <FormGroup>
        {OTHERS.map(({ label, value }) => (
          <CheckboxLabel
            key={value}
            label={label}
            checked={sales.includes(value)}
            onChange={() => handleChangeSales(value)}
          />
        ))}
      </FormGroup>

      <Box component={Divider} my={3} />

      {/* ── RATINGS ──────────────────────────────────────────── */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Ratings
      </Typography>

      <FormGroup>
        {[5, 4, 3, 2, 1].map((item) => (
          <CheckboxLabel
            key={item}
            checked={rating === item}
            onChange={() => handleChangeSearchParams("rating", rating === item ? "0" : item.toString())}
            label={<Rating size="small" value={item} color="warn" readOnly />}
          />
        ))}
      </FormGroup>

      {searchParams.size > 0 && (
        <Button
          fullWidth
          disableElevation
          color="error"
          variant="contained"
          onClick={handleClearFilters}
          sx={{ mt: 4 }}
        >
          Clear all filters
        </Button>
      )}
    </div>
  );
}
