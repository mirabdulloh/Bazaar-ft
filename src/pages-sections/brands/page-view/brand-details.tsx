"use client";

import { useState } from "react";
import { useQuery } from "../../../lib/hooks/useQuery";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import GroupIcon from "@mui/icons-material/Group";
import StarIcon from "@mui/icons-material/Star";
import Link from "next/link";
import { GET_BRAND } from "../../../../apollo/user/query";
import { GET_PRODUCTS } from "../../../../apollo/user/query";
import { Brand } from "../../../lib/types/Brand";
import { T } from "../../../lib/types/common";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Product {
	_id: string;
	productName: string;
	productPrice: number;
	productSalePrice: number;
	productImages: string[];
	productType: string;
	productStatus: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
const BrandDetailsPageView = ({ brandId }: { brandId: string }) => {
	const [brand, setBrand] = useState<Brand | null>(null);
	const [products, setProducts] = useState<Product[]>([]);
	const [totalProducts, setTotalProducts] = useState(0);
	const [productPage, setProductPage] = useState(1);
	const PRODUCT_LIMIT = 9;

	/** APOLLO REQUESTS **/
	const { loading: brandLoading, error: brandError } = useQuery(GET_BRAND, {
		variables: { brandId },
		fetchPolicy: "cache-and-network",
		onCompleted: (data: T) => {
			setBrand(data?.getBrand ?? null);
		},
	});

	const { loading: productsLoading } = useQuery(GET_PRODUCTS, {
		variables: {
			input: {
				page: productPage,
				limit: PRODUCT_LIMIT,
				search: { memberId: brandId },
			},
		},
		fetchPolicy: "cache-and-network",
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getProducts?.products ?? []);
			setTotalProducts(data?.getProducts?.metaData?.total ?? 0);
		},
	});

	if (brandLoading) {
		return (
			<Box display="flex" justifyContent="center" py={10}>
				<CircularProgress />
			</Box>
		);
	}

	if (brandError || !brand) {
		return (
			<Container sx={{ py: 6 }}>
				<Typography color="error.main">Brand not found.</Typography>
			</Container>
		);
	}

	return (
		<Container sx={{ py: 6 }}>
			{/* ── Brand Header ────────────────────────────────────────────── */}
			<Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", mb: 5 }}>
				<CardContent>
					<Stack
						direction={{ xs: "column", sm: "row" }}
						alignItems={{ xs: "center", sm: "flex-start" }}
						spacing={3}
						py={2}
					>
						<Avatar
							src={brand.brandLogo}
							alt={brand.brandName}
							sx={{ width: 100, height: 100, flexShrink: 0 }}
						/>
						<Box flex={1}>
							<Typography variant="h4" fontWeight={700} mb={0.5}>
								{brand.brandName}
							</Typography>
							{brand.brandDesc && (
								<Typography variant="body2" color="text.secondary" mb={2} maxWidth={600}>
									{brand.brandDesc}
								</Typography>
							)}
							<Stack direction="row" spacing={3} flexWrap="wrap" gap={1}>
								<Stack direction="row" alignItems="center" gap={0.5}>
									<GroupIcon sx={{ fontSize: 16, color: "text.secondary" }} />
									<Typography variant="body2" color="text.secondary">
										{brand.brandFollowersCount?.toLocaleString()} followers
									</Typography>
								</Stack>
								<Stack direction="row" alignItems="center" gap={0.5}>
									<StarIcon sx={{ fontSize: 16, color: "warning.main" }} />
									<Typography variant="body2" color="text.secondary">
										{brand.brandRating?.toFixed(1) ?? "—"} rating
									</Typography>
								</Stack>
								<Chip
									label={brand.brandStatus}
									size="small"
									color={brand.brandStatus === "ACTIVE" ? "success" : "default"}
									variant="outlined"
								/>
							</Stack>
						</Box>
					</Stack>
				</CardContent>
			</Card>

			<Divider sx={{ mb: 4 }} />

			{/* ── Products Grid ────────────────────────────────────────────── */}
			<Typography variant="h5" fontWeight={700} mb={3}>
				Products
			</Typography>

			{productsLoading ? (
				<Box display="flex" justifyContent="center" py={6}>
					<CircularProgress />
				</Box>
			) : products.length === 0 ? (
				<Typography color="text.secondary">No products yet.</Typography>
			) : (
				<>
					<Grid container spacing={3}>
						{products.map((product: Product) => (
							<Grid size={{ xs: 12, sm: 6, md: 4 }} key={product._id}>
								<Link
									href={`/products/${product._id}`}
									style={{ textDecoration: "none" }}
								>
									<Card
										sx={{
											height: "100%",
											transition: "box-shadow 0.2s",
											"&:hover": { boxShadow: 4 },
										}}
									>
										<CardMedia
											component="img"
											height="240"
											image={
												product.productImages?.[0] ??
												"/assets/images/products/product-1.png"
											}
											alt={product.productName}
											sx={{ objectFit: "cover" }}
										/>
										<CardContent>
											<Typography
												variant="subtitle2"
												fontWeight={600}
												noWrap
												mb={0.5}
											>
												{product.productName}
											</Typography>
											<Stack direction="row" alignItems="center" gap={1}>
												{product.productSalePrice < product.productPrice && (
													<Typography
														variant="body2"
														color="text.disabled"
														sx={{ textDecoration: "line-through" }}
													>
														${product.productPrice}
													</Typography>
												)}
												<Typography variant="body1" fontWeight={700} color="primary.main">
													${product.productSalePrice ?? product.productPrice}
												</Typography>
											</Stack>
										</CardContent>
									</Card>
								</Link>
							</Grid>
						))}
					</Grid>

					{totalProducts > PRODUCT_LIMIT && (
						<Stack alignItems="center" mt={5}>
							<Pagination
								count={Math.ceil(totalProducts / PRODUCT_LIMIT)}
								page={productPage}
								shape="circular"
								color="primary"
								onChange={(_e, value) => setProductPage(value)}
							/>
						</Stack>
					)}
				</>
			)}
		</Container>
	);
};

export default BrandDetailsPageView;
