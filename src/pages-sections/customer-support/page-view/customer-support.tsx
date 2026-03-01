"use client";

import { useMemo, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { useQuery } from "../../../lib/hooks/useQuery";
import { GET_FAQS, GET_NOTICES } from "../../../../apollo/user/query";
import { Faq } from "../../../lib/types/Faq";
import { Notice } from "../../../lib/types/Notice";
import { T } from "../../../lib/types/common";
import {
  CenterStateBox,
  FaqAnswer,
  FaqCard,
  FaqRow,
  FaqTitle,
  ContentContainer,
  HeroSection,
  HeroSubtitle,
  HeroTitle,
  ListIndex,
  ListStack,
  MetaRow,
  NoticeCard,
  NoticeTitle,
  PageRoot,
  SectionHeader,
  SectionSubtitle,
  SectionTitle,
  StateText,
  TabButton,
  TabWrap
} from "./styles";

type TabKey = "notices" | "faq";

type Props = {
  initialTab?: TabKey;
  initialNoticeInput?: T;
  initialFaqInput?: T;
};

const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  });

export default function CustomerSupportPageView({
  initialTab = "notices",
  initialNoticeInput = { page: 1, limit: 50, search: {} },
  initialFaqInput = { page: 1, limit: 100, search: {} }
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);

  const { loading: noticesLoading, error: noticesError } = useQuery(GET_NOTICES, {
    fetchPolicy: "cache-and-network",
    variables: { input: initialNoticeInput },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setNotices(data?.getNotices?.list ?? []);
    }
  });

  const { loading: faqsLoading, error: faqsError } = useQuery(GET_FAQS, {
    fetchPolicy: "cache-and-network",
    variables: { input: initialFaqInput },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setFaqs(data?.getFaqs?.list ?? []);
    }
  });

  const noticeList = useMemo(
    () => [...notices].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [notices]
  );

  const faqList = useMemo(
    () => [...faqs].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [faqs]
  );

  const isNoticesTab = activeTab === "notices";
  const isLoading = isNoticesTab ? noticesLoading : faqsLoading;
  const hasError = isNoticesTab ? !!noticesError : !!faqsError;

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

        {isLoading ? (
          <CenterStateBox>
            <CircularProgress />
          </CenterStateBox>
        ) : hasError ? (
          <StateText color="error.main">Failed to load {isNoticesTab ? "notices" : "FAQs"}.</StateText>
        ) : isNoticesTab ? (
          <ListStack>
            {noticeList.length === 0 ? (
              <StateText color="text.secondary">No notices yet.</StateText>
            ) : (
              noticeList.map((notice, index) => (
                <NoticeCard key={notice._id}>
                  <ListIndex>#{index + 1}</ListIndex>

                  <div>
                    <NoticeTitle>{notice.noticeTitle}</NoticeTitle>

                    <MetaRow direction="row">
                      <Typography color="text.secondary">{formatDate(notice.createdAt)}</Typography>
                      <Typography color="text.secondary">{notice.noticeCategory}</Typography>
                    </MetaRow>
                  </div>
                </NoticeCard>
              ))
            )}
          </ListStack>
        ) : (
          <ListStack>
            {faqList.length === 0 ? (
              <StateText color="text.secondary">No FAQs available yet.</StateText>
            ) : (
              faqList.map((faq, index) => (
                <FaqCard key={faq._id}>
                  <FaqRow>
                    <ListIndex>#{index + 1}</ListIndex>

                    <div>
                      <FaqTitle>{faq.faqQuestion}</FaqTitle>
                      <FaqAnswer>{faq.faqAnswer}</FaqAnswer>
                    </div>
                  </FaqRow>
                </FaqCard>
              ))
            )}
          </ListStack>
        )}
      </ContentContainer>
    </PageRoot>
  );
}
