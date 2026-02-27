"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { GET_NOTICES } from "../../../../apollo/user/query";
import { Notice, NoticeCategory } from "../../../lib/types/Notice";
import { T } from "../../../lib/types/common";

const CATEGORIES: { value: NoticeCategory | ""; label: string }[] = [
	{ value: "", label: "All" },
	{ value: "GENERAL", label: "General" },
	{ value: "PRODUCTS", label: "Products" },
	{ value: "ORDERS", label: "Orders" },
	{ value: "PAYMENTS", label: "Payments" },
	{ value: "SHIPPING", label: "Shipping" },
	{ value: "ACCOUNT", label: "Account" },
	{ value: "OTHER", label: "Other" },
];

const CATEGORY_LABELS: Record<NoticeCategory, string> = {
	GENERAL: "General",
	PRODUCTS: "Products",
	ORDERS: "Orders",
	PAYMENTS: "Payments",
	SHIPPING: "Shipping",
	ACCOUNT: "Account",
	OTHER: "Other",
};

const NoticesPageView = ({ initialInput }: T) => {
	const [searchNotices, setSearchNotices] = useState({ ...initialInput });
	const [notices, setNotices] = useState<Notice[]>([]);
	const [activeCategory, setActiveCategory] = useState<NoticeCategory | "">("");

	/** APOLLO REQUESTS **/
	const {
		loading: getNoticesLoading,
		data: getNoticesData,
		error: getNoticesError,
		refetch: getNoticesRefetch,
	} = useQuery(GET_NOTICES, {
		fetchPolicy: "cache-and-network",
		variables: { input: searchNotices },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setNotices(data?.getNotices?.list ?? []);
		},
	});

	/** HANDLERS **/
	const categoryHandler = (category: NoticeCategory | "") => {
		setActiveCategory(category);
	};

	const filtered = activeCategory
		? notices.filter((n) => n.noticeCategory === activeCategory)
		: notices;

	return (
		<Container sx={{ py: 6, maxWidth: "md" }}>
			<Typography variant="h3" fontWeight={700} mb={1}>
				Notices
			</Typography>
			<Typography variant="body1" color="text.secondary" mb={4}>
				Latest announcements and updates from BAZAAR.
			</Typography>

			<Stack direction="row" flexWrap="wrap" gap={1} mb={4}>
				{CATEGORIES.map((cat) => (
					<Chip
						key={cat.value}
						label={cat.label}
						onClick={() => categoryHandler(cat.value)}
						color={activeCategory === cat.value ? "primary" : "default"}
						variant={activeCategory === cat.value ? "filled" : "outlined"}
						sx={{ fontWeight: 500 }}
					/>
				))}
			</Stack>

			{getNoticesLoading ? (
				<Box display="flex" justifyContent="center" py={6}>
					<CircularProgress />
				</Box>
			) : getNoticesError ? (
				<Typography color="error.main">Failed to load notices.</Typography>
			) : filtered.length === 0 ? (
				<Typography color="text.secondary">No notices yet.</Typography>
			) : (
				filtered.map((notice: Notice) => (
					<Accordion
						key={notice._id}
						disableGutters
						elevation={0}
						sx={{
							border: "1px solid",
							borderColor: "divider",
							mb: 1,
							"&:before": { display: "none" },
						}}
					>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Box width="100%">
								<Stack
									direction="row"
									justifyContent="space-between"
									alignItems="center"
									flexWrap="wrap"
									gap={1}
								>
									<Typography fontWeight={500}>{notice.noticeTitle}</Typography>
									<Stack direction="row" gap={1} alignItems="center">
										<Chip
											label={CATEGORY_LABELS[notice.noticeCategory]}
											size="small"
											variant="outlined"
										/>
										<Typography
											variant="caption"
											color="text.secondary"
											sx={{ whiteSpace: "nowrap" }}
										>
											{new Date(notice.createdAt).toLocaleDateString()}
										</Typography>
									</Stack>
								</Stack>
							</Box>
						</AccordionSummary>
						<AccordionDetails>
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ lineHeight: 1.8, whiteSpace: "pre-wrap" }}
							>
								{notice.noticeContent}
							</Typography>
						</AccordionDetails>
					</Accordion>
				))
			)}
		</Container>
	);
};

NoticesPageView.defaultProps = {
	initialInput: {
		page: 1,
		limit: 50,
		search: {},
	},
};

export default NoticesPageView;
