"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Pagination from "@mui/material/Pagination";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import GroupIcon from "@mui/icons-material/Group";
import StarIcon from "@mui/icons-material/Star";
import Link from "next/link";
import { GET_BRANDS } from "../../../../apollo/user/query";
import { Brand } from "../../../lib/types/Brand";
import { T } from "../../../lib/types/common";

const ShopsPageView = ({ initialInput }: T) => {
	const [searchBrands, setSearchBrands] = useState({ ...initialInput });
	const [brands, setBrands] = useState<Brand[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const {
		loading: getBrandsLoading,
		data: getBrandsData,
		error: getBrandsError,
		refetch: getBrandsRefetch,
	} = useQuery(GET_BRANDS, {
		fetchPolicy: "cache-and-network",
		variables: { input: searchBrands },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBrands(data?.getBrands?.list ?? []);
			setTotalCount(data?.getBrands?.metaData?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchBrands({ ...searchBrands, page: value });
	};

	return (
		<Container sx={{ py: 6 }}>
			<Typography variant="h3" fontWeight={700} mb={1}>
				All Brands
			</Typography>
			<Typography variant="body1" color="text.secondary" mb={4}>
				Discover independent fashion brands on BAZAAR.
			</Typography>

			{getBrandsLoading ? (
				<Box display="flex" justifyContent="center" py={8}>
					<CircularProgress />
				</Box>
			) : getBrandsError ? (
				<Typography color="error.main">Failed to load brands.</Typography>
			) : brands.length === 0 ? (
				<Typography color="text.secondary">No brands found.</Typography>
			) : (
				<>
					<Grid container spacing={3}>
						{brands.map((brand: Brand) => (
							<Grid size={{ xs: 12, sm: 6, md: 4 }} key={brand._id}>
								<Link
									href={`/brands/${brand._id}`}
									style={{ textDecoration: "none" }}
								>
									<Card
										sx={{
											height: "100%",
											transition: "box-shadow 0.2s",
											"&:hover": { boxShadow: 4 },
											cursor: "pointer",
										}}
									>
										<CardContent>
											<Stack alignItems="center" spacing={2} py={2}>
												<Avatar
													src={brand.brandLogo}
													alt={brand.brandName}
													sx={{ width: 80, height: 80 }}
												/>
												<Box textAlign="center">
													<Typography variant="h6" fontWeight={700}>
														{brand.brandName}
													</Typography>
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{
															mt: 0.5,
															display: "-webkit-box",
															WebkitLineClamp: 2,
															WebkitBoxOrient: "vertical",
															overflow: "hidden",
														}}
													>
														{brand.brandDesc}
													</Typography>
												</Box>

												<Stack
													direction="row"
													spacing={3}
													justifyContent="center"
												>
													<Stack alignItems="center" direction="row" gap={0.5}>
														<GroupIcon
															sx={{ fontSize: 16, color: "text.secondary" }}
														/>
														<Typography variant="caption" color="text.secondary">
															{brand.brandFollowersCount} followers
														</Typography>
													</Stack>
													<Stack alignItems="center" direction="row" gap={0.5}>
														<StarIcon
															sx={{ fontSize: 16, color: "warning.main" }}
														/>
														<Typography variant="caption" color="text.secondary">
															{brand.brandRating?.toFixed(1) ?? "—"}
														</Typography>
													</Stack>
												</Stack>
											</Stack>
										</CardContent>
									</Card>
								</Link>
							</Grid>
						))}
					</Grid>

					{totalCount > searchBrands.limit && (
						<Stack alignItems="center" mt={6}>
							<Pagination
								count={Math.ceil(totalCount / searchBrands.limit)}
								page={searchBrands.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
					)}
				</>
			)}
		</Container>
	);
};

ShopsPageView.defaultProps = {
	initialInput: {
		page: 1,
		limit: 12,
		search: {},
	},
};

export default ShopsPageView;
