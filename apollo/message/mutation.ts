import { gql } from "@apollo/client";

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      _id
      conversationId
      senderId
      message
      attachments
      replyToId
      createdAt
    }
  }
`;

export const UPDATE_MESSAGE_CHAT = gql`
  mutation UpdateMessageChat($input: MessageChatUpdate!) {
    updateMessageChat(input: $input) {
      _id
      message
      updatedAt
    }
  }
`;

export const REMOVE_MESSAGE_CHAT = gql`
  mutation RemoveMessageChat($input: RemoveMessageInput!) {
    removeMessageChat(input: $input) {
      _id
      deletedAt
    }
  }
`;
