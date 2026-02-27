import { gql } from "@apollo/client";

export const GET_NOTICES = gql`
  query GetNotices($input: NoticesInquiry!) {
    getNotices(input: $input) {
      list {
        _id
        noticeCategory
        noticeStatus
        noticeTitle
        noticeContent
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
