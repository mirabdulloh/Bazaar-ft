"use client";

import { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Container from "@mui/material/Container";
import { useQuery } from "../../../lib/hooks/useQuery";
import { GET_CATEGORIES } from "../../../../apollo/user/query";
import { T } from "../../../lib/types/common";

// Preset gradient colors cycling per tile
const TILE_GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
];

interface GqlCategory {
  _id: string;
  categoryName: string;
}

export default function SectionCategories() {
  const [categories, setCategories] = useState<GqlCategory[]>([]);

  /** APOLLO REQUESTS **/
  const {
    loading: getCategoriesLoading,
    data: _getCategoriesData,
    error: _getCategoriesError,
    refetch: getCategoriesRefetch,
  } = useQuery(GET_CATEGORIES, {
    fetchPolicy: "cache-and-network",
    variables: {
      input: {
        page: 1,
        limit: 6,
        search: {},
      },
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setCategories(data?.getCategories?.list ?? []);
    },
  });

  return (
    <Container sx={{ py: 4 }}>
      <Box
        display="flex"
        gap={2}
        sx={{ overflowX: "auto", pb: 1, "::-webkit-scrollbar": { display: "none" } }}
      >
        {getCategoriesLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                sx={{ borderRadius: 3, minWidth: 140, height: 80, flex: "0 0 auto" }}
              />
            ))
          : categories.map((cat, i) => (
              <Link
                key={cat._id}
                href={`/products/search?category=${cat._id}`}
                style={{ textDecoration: "none", flex: "0 0 auto" }}
              >
                <Box
                  sx={{
                    minWidth: 140,
                    height: 80,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: TILE_GRADIENTS[i % TILE_GRADIENTS.length],
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="white"
                    textAlign="center"
                    px={1.5}
                    sx={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
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
