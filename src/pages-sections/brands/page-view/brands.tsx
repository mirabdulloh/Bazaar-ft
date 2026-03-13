"use client";

import { useState } from "react";
import { useQuery } from "../../../lib/hooks/useQuery";
import { useMutation, useReactiveVar } from "@apollo/client/react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import GroupIcon from "@mui/icons-material/Group";
import StarIcon from "@mui/icons-material/Star";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import Link from "next/link";
import { GET_BRANDS } from "../../../../apollo/user/query";
import { LIKE_TARGET_MEMBER } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";
import { Brand } from "../../../lib/types/Brand";
import { Message, T } from "../../../lib/types/common";
import { sweetLikeSuccessAlert, sweetMixinErrorAlert, sweetTopSmallErrorAlert, sweetUnlikeAlert } from "../../../lib/sweetAlert";

function resolveBrandImage(img?: string | null): string {
	if (!img || img === "null" || img === "undefined") return "";
	if (img.startsWith("http://") || img.startsWith("https://")) return img;

	const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
	const normalized = img.startsWith("/") ? img : `/${img}`;
	return apiBase ? `${apiBase}${normalized}` : normalized;
}

const ShopsPageView = ({ initialInput = { page: 1, limit: 12, search: {}, sort: "memberRank", direction: "DESC" } }: T) => {
	const [searchBrands, setSearchBrands] = useState({ ...initialInput });
	const [brands, setBrands] = useState<Brand[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const {
		loading: getBrandsLoading,
		data: _getBrandsData,
		error: getBrandsError,
		refetch: getBrandsRefetch,
	} = useQuery(GET_BRANDS, {
		fetchPolicy: "cache-and-network",
		variables: { input: { ...searchBrands, limit: 12 } },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBrands(data?.getBrands?.brands ?? []);
			setTotalCount(data?.getBrands?.metaData?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const handleSearchChange = (value: string) => {
		setSearchBrands({
			...searchBrands,
			page: 1,
			search: { ...(searchBrands.search ?? {}), text: value },
		});
	};

	const handleSortChange = (value: string) => {
		let sort = "brandRating";
		let direction = "DESC";

		if (value === "recent") {
			sort = "createdAt";
			direction = "DESC";
		} else if (value === "oldest") {
			sort = "createdAt";
			direction = "ASC";
		} else if (value === "followers") {
			sort = "brandFollowersCount";
			direction = "DESC";
		} else if (value === "rating") {
			sort = "brandRating";
			direction = "DESC";
		}

		setSearchBrands({ ...searchBrands, page: 1, sort, direction });
	};

	const paginationHandler = (_e: T, value: number) => {
		setSearchBrands({ ...searchBrands, page: value });
	};

	const likeBrandHandler = async (e: React.MouseEvent, brand: Brand) => {
		e.preventDefault();
		e.stopPropagation();
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			const currentlyLiked = !!brand.meLiked?.[0]?.myFavorite;

			const { data } = await likeTargetMember({ variables: { input: brand._id } });
			const updatedLikes = (data as T)?.likeTargetMember?.memberLikes ?? brand.memberData?.memberLikes ?? 0;
			const nextLiked = !currentlyLiked;

			setBrands((prev) =>
				prev.map((b) =>
					b._id === brand._id
						? {
								...b,
								memberData: { ...b.memberData, memberLikes: updatedLikes },
								meLiked: [{ myFavorite: nextLiked }],
						  }
						: b
				)
			);

			if (nextLiked) await sweetLikeSuccessAlert();
			else await sweetUnlikeAlert();
		} catch (err: any) {
			if (err.message === Message.NOT_AUTHENTICATED) {
				sweetTopSmallErrorAlert("Please log in to like brands", 2500);
			} else {
				sweetMixinErrorAlert(err.message ?? Message.SOMETHING_WENT_WRONG).then();
			}
		}
	};

	return (
		<Container sx={{ py: 6 }}>
			<Typography variant="h3" fontWeight={700} mb={1}>
				All Brands
			</Typography>
			<Typography variant="body1" color="text.secondary" mb={4}>
				Discover independent fashion brands on BAZAAR.
			</Typography>

			<Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={4}>
				<TextField
					fullWidth
					placeholder="Search brands"
					value={(searchBrands.search as T)?.text ?? ""}
					onChange={(e) => handleSearchChange(e.target.value)}
					size="small"
				/>
				<FormControl size="small" sx={{ minWidth: 200 }}>
					<InputLabel id="brands-sort-label">Sort by</InputLabel>
					<Select
						labelId="brands-sort-label"
						label="Sort by"
						value={
							searchBrands.sort === "createdAt" && searchBrands.direction === "ASC"
								? "oldest"
								: searchBrands.sort === "brandFollowersCount"
								? "followers"
								: searchBrands.sort === "brandRating"
								? "rating"
								: "recent"
						}
						onChange={(e) => handleSortChange(e.target.value)}
					>
						<MenuItem value="recent">Recent</MenuItem>
						<MenuItem value="oldest">Oldest</MenuItem>
						<MenuItem value="rating">Top Rating</MenuItem>
						<MenuItem value="followers">Most Followers</MenuItem>
					</Select>
				</FormControl>
			</Stack>

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
						{brands.map((brand: Brand, i: number) => (
							<Grid size={{ xs: 12, sm: 6, md: 3 }} key={brand._id}>
								<Card
									sx={{
										height: "100%",
										borderRadius: 3,
										overflow: "hidden",
										transition: "transform 0.2s, box-shadow 0.2s",
										"&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
									}}
								>
									<Link href={`/brands/${brand._id}`} style={{ textDecoration: "none", display: "block" }}>
										<Box
											sx={{
												height: 210,
												bgcolor: "grey.100",
												backgroundImage: `url(${resolveBrandImage(brand.brandLogo)})`,
												backgroundRepeat: "no-repeat",
												backgroundPosition: "center",
												backgroundSize: "cover",
												position: "relative",
											}}
										>
											<Box
												sx={{
													position: "absolute",
													top: 10,
													right: 10,
													px: 1,
													py: 0.4,
													borderRadius: 999,
													bgcolor: "rgba(0,0,0,0.6)",
													color: "common.white",
													display: "flex",
													alignItems: "center",
													gap: 0.5,
													fontSize: 12,
													fontWeight: 600,
												}}
											>
												<VisibilityOutlined sx={{ fontSize: 14, color: "common.white" }} />
												{brand.memberData?.memberViews?.toLocaleString() ?? 0}
											</Box>
										</Box>
									</Link>

									<CardContent sx={{ p: 3 }}>
										<Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
											<Link href={`/brands/${brand._id}`} style={{ textDecoration: "none", color: "inherit" }}>
												<Typography variant="h6" fontWeight={700} noWrap>
													{brand.brandName}
												</Typography>
											</Link>
											<Stack
												alignItems="center"
												direction="row"
												gap={0.5}
												flexShrink={0}
												sx={{ display: { xs: "flex", md: "none" } }}
											>
												<GroupIcon sx={{ fontSize: 24, color: "text.secondary" }} />
												<Typography variant="caption" color="text.secondary" noWrap>
													{(brand.memberData?.memberFollowers ?? brand.brandFollowersCount ?? 0).toLocaleString()} followers
												</Typography>
											</Stack>
										</Stack>
												<Typography
													variant="body2"
													color="text.secondary"
													sx={{
														mt: 0.5,
														minHeight: 42,
														display: "-webkit-box",
														WebkitLineClamp: 2,
														WebkitBoxOrient: "vertical",
														overflow: "hidden",
													}}
												>
													{brand.brandDesc}
												</Typography>

										<Stack
											direction={{ xs: "column", sm: "row" }}
											spacing={2}
											mt={2}
											alignItems={{ xs: "flex-start", sm: "center" }}
											justifyContent="flex-start"
										>
											<Stack
												alignItems="center"
												direction="row"
												gap={0.5}
												sx={{ display: { xs: "none", md: "flex" } }}
											>
												<GroupIcon sx={{ fontSize: 24, color: "text.secondary" }} />
												<Typography variant="caption" color="text.secondary">
													{(brand.memberData?.memberFollowers ?? brand.brandFollowersCount ?? 0).toLocaleString()} followers
												</Typography>
											</Stack>
											<Stack alignItems="center" direction="row" gap={0.5}>
												<IconButton size="small" onClick={(e) => likeBrandHandler(e, brand)} sx={{ p: 0.2 }}>
													{brand.meLiked?.[0]?.myFavorite ? (
														<Favorite sx={{ fontSize: 24, color: "error.main" }} />
													) : (
														<FavoriteBorder sx={{ fontSize: 24, color: "text.secondary" }} />
													)}
												</IconButton>
												<Typography variant="caption" color="text.secondary">
													{brand.memberData?.memberLikes?.toLocaleString() ?? 0} likes
												</Typography>
											</Stack>
											<Stack alignItems="center" direction="row" gap={0.5}>
												<StarIcon sx={{ fontSize: 24, color: "warning.main" }} />
												<Typography variant="caption" color="text.secondary">
													{brand.brandRating?.toFixed(1) ?? "—"}
												</Typography>
											</Stack>
										</Stack>
									</CardContent>
								</Card>
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
		sort: "memberRank",
		direction: "DESC",
	},
};

export default ShopsPageView;
