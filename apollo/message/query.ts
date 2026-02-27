import { gql } from "@apollo/client";

export const GET_MESSAGES = gql`
  query GetMessages($input: MessagesInquiry!) {
    getMessages(input: $input) {
      list {
        _id
        conversationId
        senderId
        message
        attachments
        replyToId
        readAt
        createdAt
        updatedAt
        senderData {
          _id
          memberNick
          memberImage
        }
        parentMessageData {
          _id
          message
          senderId
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
