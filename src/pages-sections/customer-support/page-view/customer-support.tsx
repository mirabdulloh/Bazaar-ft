"use client";

import { useRef, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import { useQuery } from "../../../lib/hooks/useQuery";
import { GET_FAQS, GET_NOTICES } from "../../../../apollo/user/query";
import { Faq } from "../../../lib/types/Faq";
import { Notice } from "../../../lib/types/Notice";
import { T } from "../../../lib/types/common";
import {
  CategoryFilterRow,
  CenterStateBox,
  ContentContainer,
  HeroSection,
  HeroSubtitle,
  HeroTitle,
  ListStack,
  PageRoot,
  PaginationWrap,
  SearchBox,
  SectionHeader,
  SectionSubtitle,
  SectionTitle,
  StateText,
  TabButton,
  TabWrap,
} from "./styles";

type TabKey = "notices" | "faq";

type Props = {
  initialTab?: TabKey;
};

const PAGE_SIZE = 8;

const FAQ_CATEGORIES: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "GENERAL", label: "General" },
  { value: "PRODUCTS", label: "Products" },
  { value: "ORDERS", label: "Orders" },
  { value: "PAYMENTS", label: "Payments" },
  { value: "SHIPPING", label: "Shipping" },
  { value: "ACCOUNT", label: "Account" },
  { value: "OTHER", label: "Other" },
];

const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

const INITIAL_FAQ_INPUT = { page: 1, limit: PAGE_SIZE, search: {} };

export default function CustomerSupportPageView({ initialTab = "notices" }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Notices state
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticePage, setNoticePage] = useState(1);
  const [noticeTotal, setNoticeTotal] = useState(0);

  // FAQ state
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqTotal, setFaqTotal] = useState(0);
  const [faqQueryInput, setFaqQueryInput] = useState(INITIAL_FAQ_INPUT);
  const [faqInputValue, setFaqInputValue] = useState("");
  const [faqCategory, setFaqCategory] = useState("");
  const activeTextRef = useRef("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /** APOLLO REQUESTS **/
  const { loading: noticesLoading, error: noticesError } = useQuery(GET_NOTICES, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: noticePage, limit: PAGE_SIZE, search: {} } },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setNotices(data?.getNotices?.list ?? []);
      setNoticeTotal(data?.getNotices?.metaCounter?.[0]?.total ?? 0);
    },
  });

  const { loading: faqsLoading, error: faqsError } = useQuery(GET_FAQS, {
    fetchPolicy: "cache-and-network",
    variables: { input: faqQueryInput },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setFaqs(data?.getFaqs?.list ?? []);
      setFaqTotal(data?.getFaqs?.metaCounter?.[0]?.total ?? 0);
    },
  });

  /** HANDLERS **/
  const buildSearch = (text: string, category: string) => ({
    ...(text && { text }),
    ...(category && { faqCategory: category }),
  });

  const categoryHandler = (category: string) => {
    setFaqCategory(category);
    setFaqQueryInput({ ...INITIAL_FAQ_INPUT, search: buildSearch(activeTextRef.current, category) });
  };

  const handleFaqSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFaqInputValue(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      activeTextRef.current = val.trim();
      setFaqQueryInput({ ...INITIAL_FAQ_INPUT, search: buildSearch(val.trim(), faqCategory) });
    }, 350);
  };

  const handleClearSearch = () => {
    setFaqInputValue("");
    activeTextRef.current = "";
    clearTimeout(debounceRef.current);
    setFaqQueryInput({ ...INITIAL_FAQ_INPUT, search: buildSearch("", faqCategory) });
  };

  const isNoticesTab = activeTab === "notices";
  const isLoading = isNoticesTab ? noticesLoading : faqsLoading;
  const hasError = isNoticesTab ? !!noticesError : !!faqsError;
  const noticeTotalPages = Math.ceil(noticeTotal / PAGE_SIZE);
  const faqTotalPages = Math.ceil(faqTotal / PAGE_SIZE);

  const accordionSx = {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: "12px !important",
    "&:before": { display: "none" },
    "&.Mui-expanded": { boxShadow: 2 },
  };

  return (
    <PageRoot>
      <HeroSection>
        <Container maxWidth="lg">
          <HeroTitle>Customer Support</HeroTitle>
          <HeroSubtitle>Find answers and stay updated with our latest announcements</HeroSubtitle>
        </Container>
      </HeroSection>

      <ContentContainer maxWidth="md">
        <TabWrap>
          <TabButton
            type="button"
            active={isNoticesTab}
            aria-pressed={isNoticesTab}
            onClick={() => setActiveTab("notices")}
          >
            <NotificationsNoneIcon fontSize="small" />
            Notices
          </TabButton>

          <TabButton
            type="button"
            active={!isNoticesTab}
            aria-pressed={!isNoticesTab}
            onClick={() => setActiveTab("faq")}
          >
            <HelpOutlineIcon fontSize="small" />
            FAQ
          </TabButton>
        </TabWrap>

        <SectionHeader>
          <SectionTitle>{isNoticesTab ? "Notices" : "Frequently Asked Questions"}</SectionTitle>
          <SectionSubtitle>
            {isNoticesTab
              ? "Stay updated with our latest announcements"
              : "Find quick answers to common questions"}
          </SectionSubtitle>
        </SectionHeader>

        {/* FAQ search + category filter */}
        {!isNoticesTab && (
          <>
            <SearchBox>
              <SearchIcon sx={{ color: "text.disabled", flexShrink: 0 }} />
              <InputBase
                fullWidth
                placeholder="Search questions or keywords..."
                value={faqInputValue}
                onChange={handleFaqSearchChange}
                inputProps={{ "aria-label": "Search FAQs" }}
                sx={{ fontSize: 15 }}
              />
              {faqInputValue && (
                <IconButton size="small" onClick={handleClearSearch} edge="end" sx={{ flexShrink: 0 }}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
            </SearchBox>

            <CategoryFilterRow>
              {FAQ_CATEGORIES.map((cat) => (
                <Chip
                  key={cat.value}
                  label={cat.label}
                  onClick={() => categoryHandler(cat.value)}
                  color={faqCategory === cat.value ? "primary" : "default"}
                  variant={faqCategory === cat.value ? "filled" : "outlined"}
                  sx={{ fontWeight: 500, flexShrink: 0 }}
                />
              ))}
            </CategoryFilterRow>
          </>
        )}

        {isLoading ? (
          <CenterStateBox>
            <CircularProgress />
          </CenterStateBox>
        ) : hasError ? (
          <StateText color="error.main">
            Failed to load {isNoticesTab ? "notices" : "FAQs"}.
          </StateText>
        ) : isNoticesTab ? (
          <>
            <ListStack>
              {notices.length === 0 ? (
                <StateText color="text.secondary">No notices yet.</StateText>
              ) : (
                notices.map((notice) => (
                  <Accordion key={notice._id} disableGutters elevation={0} sx={accordionSx}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ px: { xs: 2, md: 3 }, py: 1.5, minHeight: "auto", alignItems: "flex-start" }}
                    >
                      <Box sx={{ flex: 1, mr: 1, minWidth: 0 }}>
                        <Typography
                          fontWeight={700}
                          sx={{ fontSize: { xs: 15, md: 17 }, mb: 0.75, lineHeight: 1.35, wordBreak: "break-word" }}
                        >
                          {notice.noticeTitle}
                        </Typography>
                        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                          <Chip
                            label={notice.noticeCategory}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: 11, height: 22 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notice.createdAt)}
                          </Typography>
                        </Stack>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 2.5, pt: 0 }}>
                      <Typography
                        color="text.secondary"
                        sx={{ lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                      >
                        {notice.noticeContent}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </ListStack>

            {noticeTotalPages > 1 && (
              <PaginationWrap>
                <Pagination
                  count={noticeTotalPages}
                  page={noticePage}
                  onChange={(_, v) => {
                    setNoticePage(v);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  color="primary"
                  shape="rounded"
                />
              </PaginationWrap>
            )}
          </>
        ) : (
          <>
            <ListStack>
              {faqs.length === 0 ? (
                <StateText color="text.secondary">
                  {faqInputValue || faqCategory
                    ? "No results found. Try a different search."
                    : "No FAQs available yet."}
                </StateText>
              ) : (
                faqs.map((faq) => (
                  <Accordion key={faq._id} disableGutters elevation={0} sx={accordionSx}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ px: { xs: 2, md: 3 }, py: 1.5, minHeight: "auto", alignItems: "flex-start" }}
                    >
                      <Box sx={{ flex: 1, mr: 1, minWidth: 0 }}>
                        <Box sx={{ mb: 0.6 }}>
                          <Chip
                            label={FAQ_CATEGORIES.find((c) => c.value === faq.faqCategory)?.label ?? faq.faqCategory}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: 11, height: 22 }}
                          />
                        </Box>
                        <Typography
                          fontWeight={700}
                          sx={{ fontSize: { xs: 15, md: 17 }, lineHeight: 1.35, wordBreak: "break-word" }}
                        >
                          {faq.faqQuestion}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 2.5, pt: 0 }}>
                      <Typography
                        color="text.secondary"
                        sx={{ lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                      >
                        {faq.faqAnswer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </ListStack>

            {faqTotalPages > 1 && (
              <PaginationWrap>
                <Pagination
                  count={faqTotalPages}
                  page={faqQueryInput.page}
                  onChange={(_, v) => {
                    setFaqQueryInput((prev) => ({ ...prev, page: v }));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  color="primary"
                  shape="rounded"
                />
              </PaginationWrap>
            )}
          </>
        )}
      </ContentContainer>
    </PageRoot>
  );
}
