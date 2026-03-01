"use client";

import { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useQuery } from "../../../lib/hooks/useQuery";
import { GET_CATEGORIES } from "../../../../apollo/user/query";
import { T } from "../../../lib/types/common";

interface GqlCategory {
  _id: string;
  categoryName: string;
  parentCategoryId: string | null;
}

// Fashion-toned gradient backgrounds, cycled per tile
const TILE_GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
];

export default function SectionCategories() {
  const [categories, setCategories] = useState<GqlCategory[]>([]);

  /** APOLLO REQUESTS **/
  const {
    loading: getCategoriesLoading,
    data: _getCategoriesData,
    error: _getCategoriesError,
    refetch: _getCategoriesRefetch,
  } = useQuery(GET_CATEGORIES, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 12, search: {} } },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      const all: GqlCategory[] = data?.getCategories?.list ?? [];
      // Show only top-level categories on the homepage
      setCategories(all.filter((c) => !c.parentCategoryId));
    },
  });

  if (!getCategoriesLoading && !categories.length) return null;

  return (
    <Container sx={{ mb: 5 }}>
      <Box
        sx={{
          display: "flex",
          gap: { xs: 2, md: 3 },
          overflowX: "auto",
          pb: 1,
          // Hide scrollbar visually
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {getCategoriesLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Box
                key={i}
                sx={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}
              >
                <Skeleton variant="circular" width={80} height={80} />
                <Skeleton variant="text" width={64} height={18} />
              </Box>
            ))
          : categories.map((cat, i) => (
              <Link
                key={cat._id}
                href={`/products/search?categoryId=${cat._id}`}
                style={{ textDecoration: "none", flexShrink: 0 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                    "&:hover .cat-circle": { transform: "translateY(-4px)", boxShadow: 4 },
                  }}
                >
                  <Box
                    className="cat-circle"
                    sx={{
                      width: { xs: 72, md: 88 },
                      height: { xs: 72, md: 88 },
                      borderRadius: "50%",
                      background: TILE_GRADIENTS[i % TILE_GRADIENTS.length],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 0.25s ease, box-shadow 0.25s ease",
                      boxShadow: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: { xs: 22, md: 26 },
                        lineHeight: 1,
                        userSelect: "none",
                      }}
                    >
                      {cat.categoryName.charAt(0).toUpperCase()}
                    </Typography>
                  </Box>

                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.primary"
                    sx={{ textAlign: "center", maxWidth: 80, lineHeight: 1.3 }}
                  >
                    {cat.categoryName}
                  </Typography>
                </Box>
              </Link>
            ))}
      </Box>
    </Container>
  );
}
