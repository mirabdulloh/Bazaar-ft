"use client";

import { useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import Typography from "@mui/material/Typography";
// GLOBAL CUSTOM COMPONENTS
import ProductCard1 from "components/product-cards/product-card-1";
// CUSTOM DATA MODEL
import Product from "models/Product.model";

// ==============================================================
type Props = { products: Product[] };
// ==============================================================

export default function RelatedProducts({ products }: Props) {
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const totalPages = Math.ceil(products.length / pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const pagedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, page]);

  // IF NO PRODUCTS RETURN NULL
  if (!products || !products.length) return null;

  return (
    <div className="mb-4">
      <Typography variant="h3" sx={{ mb: 3 }}>
        Related Products
      </Typography>

      <Grid container spacing={3}>
        {pagedProducts.map((product) => (
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
            onChange={(_, value) => setPage(value)}
          />
        </Box>
      )}
    </div>
  );
}
