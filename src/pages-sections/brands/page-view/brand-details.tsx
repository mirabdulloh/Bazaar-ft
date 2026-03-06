"use client";

import { useState } from "react";
import { useQuery } from "../../../lib/hooks/useQuery";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import GroupIcon from "@mui/icons-material/Group";
import StarIcon from "@mui/icons-material/Star";
import { GET_BRAND } from "../../../../apollo/user/query";
import { Brand } from "../../../lib/types/Brand";
import { T } from "../../../lib/types/common";
import ProductSearchPageView from "../../product-details/page-view/product-search";

// ── Component ─────────────────────────────────────────────────────────────────
const BrandDetailsPageView = ({ brandId }: { brandId: string }) => {
	const [brand, setBrand] = useState<Brand | null>(null);

	/** APOLLO REQUESTS **/
	const { loading: brandLoading, error: brandError } = useQuery(GET_BRAND, {
		variables: { brandId },
		fetchPolicy: "cache-and-network",
		onCompleted: (data: T) => {
			setBrand(data?.getBrand ?? null);
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
			<ProductSearchPageView fixedBrandId={brandId} showMobileFilter />
		</Container>
	);
};

export default BrandDetailsPageView;
