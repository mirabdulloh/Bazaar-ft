import type { Metadata } from "next";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { initializeApollo } from "../../../apollo/client";
import { GET_FAQS } from "../../../apollo/user/query";

export const metadata: Metadata = {
  title: "FAQ - BAZAAR",
  description: "Frequently asked questions about shopping on BAZAAR.",
};

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: "General",
  PRODUCTS: "Products",
  ORDERS: "Orders",
  PAYMENTS: "Payments",
  SHIPPING: "Shipping",
  ACCOUNT: "Account",
  OTHER: "Other",
};

export default async function FaqPage() {
  const client = initializeApollo();

  let faqs: any[] = [];

  try {
    const { data } = await client.query({
      query: GET_FAQS,
      variables: { input: { page: 1, limit: 100 } },
      fetchPolicy: "no-cache",
    });
    faqs = data?.getFaqs?.list ?? [];
  } catch {
    // backend not running — show empty state
  }

  // Group by category
  const grouped = faqs.reduce<Record<string, any[]>>((acc, faq) => {
    const cat = faq.faqCategory ?? "OTHER";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  return (
    <Container sx={{ py: 6, maxWidth: "md" }}>
      <Typography variant="h2" fontWeight={700} mb={1}>
        Frequently Asked Questions
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={5}>
        Find answers to common questions about shopping, orders, and your account.
      </Typography>

      {categories.length === 0 ? (
        <Typography color="text.secondary">No FAQs available yet.</Typography>
      ) : (
        categories.map((cat) => (
          <Box key={cat} mb={4}>
            <Chip
              label={CATEGORY_LABELS[cat] ?? cat}
              color="primary"
              size="small"
              sx={{ mb: 2, fontWeight: 600 }}
            />
            {grouped[cat].map((faq: any) => (
              <Accordion key={faq._id} disableGutters elevation={0} sx={{ border: "1px solid", borderColor: "divider", mb: 1, "&:before": { display: "none" } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={500}>{faq.faqQuestion}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {faq.faqAnswer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ))
      )}
    </Container>
  );
}
