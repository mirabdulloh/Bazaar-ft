import { gql } from "@apollo/client";

// ─── Brand Profile ────────────────────────────────────────────────────────────

export const GET_MY_BRAND = gql`
  query GetMyBrand {
    getMyBrand {
      _id
      brandName
      brandLogo
      brandDesc
      brandStatus
      brandRating
      brandFollowersCount
      brandReviewsCount
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

// ─── Brand Products ───────────────────────────────────────────────────────────

// ─── Brand Chats ──────────────────────────────────────────────────────────────

export const GET_BRAND_CHATS = gql`
  query GetBrandChats($input: ChatsInquiry!) {
    getBrandChats(input: $input) {
      list {
        _id
        memberId
        brandId
        chatStatus
        chatSubject
        createdAt
        updatedAt
        memberData {
          _id
          memberNick
          memberImage
        }
      }
      metaData {
        total
        page
        limit
      }
    }
  }
`;
