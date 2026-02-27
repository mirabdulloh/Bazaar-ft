import { gql } from "@apollo/client";

export const OPEN_OR_GET_CHAT = gql`
  mutation OpenOrGetChat($input: OpenChatInput!) {
    openOrGetChat(input: $input) {
      _id
      memberId
      brandId
      chatStatus
      chatSubject
      createdAt
    }
  }
`;

export const DELETE_CHAT = gql`
  mutation DeleteChat($chatId: String!) {
    deleteChat(chatId: $chatId) {
      _id
      chatStatus
    }
  }
`;
