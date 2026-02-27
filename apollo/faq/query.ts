import { gql } from "@apollo/client";

export const GET_FAQS = gql`
  query GetFaqs($input: FaqsInquiry!) {
    getFaqs(input: $input) {
      list {
        _id
        faqCategory
        faqStatus
        faqQuestion
        faqAnswer
        createdAt
      }
      metaData {
        total
        page
        limit
      }
    }
  }
`;
