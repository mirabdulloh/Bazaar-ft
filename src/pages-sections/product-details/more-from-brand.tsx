"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
// MUI
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Pagination from "@mui/material/Pagination";
import Typography from "@mui/material/Typography";
// GLOBAL CUSTOM COMPONENTS
import ProductCard1 from "components/product-cards/product-card-1";
// CUSTOM DATA MODEL
import Product from "models/Product.model";

// ==============================================================
type Props = {
  products: Product[];
  brandId: string;
  brandName: string;
  brandImage?: string;
};
// ==============================================================

export default function MoreFromBrand({ products, brandId, brandName, brandImage }: Props) {
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const totalPages = Math.ceil(products.length / pageSize);
  const paged = useMemo(
    () => products.slice((page - 1) * pageSize, page * pageSize),
    [products, page]
  );

  if (!products.length || !brandName) return null;

  return (
    <div className="mb-4">
      {/* BRAND HEADER */}
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <Avatar
          src={brandImage}
          sx={{ width: 44, height: 44, bgcolor: "primary.main" }}
        >
          {brandName[0]?.toUpperCase()}
        </Avatar>

        <Typography variant="h3" sx={{ flex: 1 }}>
          More from {brandName}
        </Typography>

        <Button
          component={Link}
          href={`/brands/${brandId}`}
          variant="outlined"
          size="small"
        >
          View all
        </Button>
      </Box>

      {/* PRODUCT GRID */}
      <Grid container spacing={3}>
        {paged.map((product) => (
          <Grid size={{ lg: 3, md: 4, sm: 6, xs: 12 }} key={product.id}>
            <ProductCard1 product={product} showActions={false} />
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            color="primary"
            page={page}
            count={totalPages}
            onChange={(_, v) => setPage(v)}
          />
        </Box>
      )}
    </div>
  );
}
