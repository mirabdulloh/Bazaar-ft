"use client";

import { useState } from "react";
import { useQuery } from "../../../lib/hooks/useQuery";
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
import { GET_FAQS } from "../../../../apollo/user/query";
import { Faq, FaqCategory } from "../../../lib/types/Faq";
import { T } from "../../../lib/types/common";
import { sweetMixinErrorAlert } from "../../../lib/sweetAlert";

const CATEGORIES: { value: FaqCategory | ""; label: string }[] = [
	{ value: "", label: "All" },
	{ value: "GENERAL", label: "General" },
	{ value: "PRODUCTS", label: "Products" },
	{ value: "ORDERS", label: "Orders" },
	{ value: "PAYMENTS", label: "Payments" },
	{ value: "SHIPPING", label: "Shipping" },
	{ value: "ACCOUNT", label: "Account" },
	{ value: "OTHER", label: "Other" },
];

const FaqPageView = ({ initialInput }: T) => {
	const [searchFaqs, setSearchFaqs] = useState({ ...initialInput });
	const [faqs, setFaqs] = useState<Faq[]>([]);
	const [activeCategory, setActiveCategory] = useState<FaqCategory | "">("");

	/** APOLLO REQUESTS **/
	const {
		loading: getFaqsLoading,
		data: getFaqsData,
		error: getFaqsError,
		refetch: getFaqsRefetch,
	} = useQuery(GET_FAQS, {
		fetchPolicy: "cache-and-network",
		variables: { input: searchFaqs },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setFaqs(data?.getFaqs?.list ?? []);
		},
	});

	/** HANDLERS **/
	const categoryHandler = (category: FaqCategory | "") => {
		setActiveCategory(category);
	};

	const filtered = activeCategory
		? faqs.filter((f) => f.faqCategory === activeCategory)
		: faqs;

	return (
		<Container sx={{ py: 6, maxWidth: "md" }}>
			<Typography variant="h3" fontWeight={700} mb={1}>
				Frequently Asked Questions
			</Typography>
			<Typography variant="body1" color="text.secondary" mb={4}>
				Find answers to common questions about shopping, orders, and your account.
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

			{getFaqsLoading ? (
				<Box display="flex" justifyContent="center" py={6}>
					<CircularProgress />
				</Box>
			) : getFaqsError ? (
				<Typography color="error.main">Failed to load FAQs.</Typography>
			) : filtered.length === 0 ? (
				<Typography color="text.secondary">No FAQs available yet.</Typography>
			) : (
				filtered.map((faq: Faq) => (
					<Accordion
						key={faq._id}
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
							<Typography fontWeight={500}>{faq.faqQuestion}</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ lineHeight: 1.8 }}
							>
								{faq.faqAnswer}
							</Typography>
						</AccordionDetails>
					</Accordion>
				))
			)}
		</Container>
	);
};

FaqPageView.defaultProps = {
	initialInput: {
		page: 1,
		limit: 100,
		search: {},
	},
};

export default FaqPageView;
