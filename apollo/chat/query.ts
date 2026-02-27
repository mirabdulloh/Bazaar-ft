import { gql } from "@apollo/client";

const CHAT_FRAGMENT = `
  _id
  memberId
  brandId
  chatStatus
  chatSubject
  createdAt
  updatedAt
`;

export const GET_MY_CHATS = gql`
  query GetMyChats($input: ChatsInquiry!) {
    getMyChats(input: $input) {
      list {
        ${CHAT_FRAGMENT}
        brandData {
          _id
          brandName
          brandLogo
        }
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

export const GET_BRAND_CHATS = gql`
  query GetBrandChats($input: ChatsInquiry!) {
    getBrandChats(input: $input) {
      list {
        ${CHAT_FRAGMENT}
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
