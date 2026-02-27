"use client";

import { Fragment } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
// MUI
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Collapse from "@mui/material/Collapse";
import TextField from "@mui/material/TextField";
import FormGroup from "@mui/material/FormGroup";
import Typography from "@mui/material/Typography";
// GLOBAL CUSTOM COMPONENTS
import AccordionHeader from "components/accordion";
import { FlexBetween, FlexBox } from "components/flex-box";
// LOCAL CUSTOM COMPONENTS
import CheckboxLabel from "./checkbox-label";
// CUSTOM LOCAL HOOK
import useProductFilterCard from "./use-product-filter-card";
// TYPES
import Filters from "models/Filters";

export default function ProductFilters({ filters }: { filters: Filters }) {
  const { brands: BRANDS, categories: CATEGORIES, others: OTHERS, colors: COLORS } = filters;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    sales,
    brands,
    rating,
    colors,
    prices,
    collapsed,
    setCollapsed,
    handleChangeBrand,
    handleChangeColor,
    handleChangePrice,
    handleChangeSales,
    handleChangeSearchParams
  } = useProductFilterCard();

  const handleClearFilters = () => {
    router.push(pathname);
  };

  return (
    <div>
      {/* CATEGORY VARIANT FILTER */}
      <Typography variant="h6" sx={{ mb: 1.25 }}>
        Categories
      </Typography>

      {CATEGORIES.map((item) =>
        item.children ? (
          <Fragment key={item.title}>
            <AccordionHeader
              open={collapsed}
              onClick={() => setCollapsed((state) => !state)}
              sx={{ padding: ".5rem 0", cursor: "pointer", color: "grey.600" }}
            >
              <Typography component="span">{item.title}</Typography>
            </AccordionHeader>

            <Collapse in={collapsed}>
              {item.children.map((name) => (
                <Typography
                  variant="body1"
                  key={name}
                  sx={{
                    py: 0.75,
                    pl: "22px",
                    fontSize: 14,
                    cursor: "pointer",
                    color: "grey.600"
                  }}
                >
                  {name}
                </Typography>
              ))}
            </Collapse>
          </Fragment>
        ) : (
          <Typography
            variant="body1"
            key={item.title}
            sx={{
              py: 0.75,
              fontSize: 14,
              cursor: "pointer",
              color: "grey.600"
            }}
          >
            {item.title}
          </Typography>
        )
      )}

      <Box component={Divider} my={3} />

      {/* PRICE VARIANT FILTER */}
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
          type="number"
          placeholder="0"
          value={prices[0]}
          onChange={(e) => handleChangePrice([+e.target.value, prices[1]])}
        />

        <Typography variant="h5" sx={{ px: 1, color: "grey.600" }}>
          -
        </Typography>

        <TextField
          fullWidth
          size="small"
          type="number"
          placeholder="250"
          value={prices[1]}
          onChange={(e) => handleChangePrice([prices[0], +e.target.value])}
        />
      </FlexBetween>

      <Box component={Divider} my={3} />

      {/* BRAND VARIANT FILTER */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Brands
      </Typography>

      <FormGroup>
        {BRANDS.map(({ label, value }) => (
          <CheckboxLabel
            key={value}
            label={label}
            checked={brands.includes(value)}
            onChange={() => handleChangeBrand(value)}
          />
        ))}
      </FormGroup>

      <Box component={Divider} my={3} />

      {/* SALES OPTIONS */}
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

      {/* RATINGS FILTER */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Ratings
      </Typography>

      <FormGroup>
        {[5, 4, 3, 2, 1].map((item) => (
          <CheckboxLabel
            key={item}
            checked={rating === item}
            onChange={() => handleChangeSearchParams("rating", item.toString())}
            label={<Rating size="small" value={item} color="warn" readOnly />}
          />
        ))}
      </FormGroup>

      <Box component={Divider} my={3} />

      {/* COLORS VARIANT FILTER */}
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
              outlineOffset: 1,
              cursor: "pointer",
              borderRadius: 3,
              outline: colors.includes(item) ? 1 : 0,
              outlineColor: item
            }}
          />
        ))}
      </FlexBox>

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
