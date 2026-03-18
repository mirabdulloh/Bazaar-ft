import { gql } from "@apollo/client";

export const OPEN_OR_GET_BRAND_CHAT = gql`
  mutation OpenOrGetBrandChat($input: OpenBrandChatInput!) {
    openOrGetBrandChat(input: $input) {
      _id
      chatScope
      chatStatus
      requesterId
      requesterType
      brandId
      assignedAdminId
      chatSubject
      supportTopic
      sourcePath
      lastMessageAt
      lastMessageText
      lastMessageSenderId
      unreadRequesterCount
      unreadResponderCount
      unreadCount
      canReply
      createdAt
      updatedAt
      requesterData {
        _id
        memberType
        memberStatus
        memberNick
        memberFullName
        memberImage
        memberEmail
      }
      brandData {
        _id
        brandName
        brandLogo
        brandStatus
        memberData {
          _id
          memberNick
          memberImage
        }
      }
      assignedAdminData {
        _id
        memberType
        memberStatus
        memberNick
        memberFullName
        memberImage
        memberEmail
      }
    }
  }
`;

export const OPEN_OR_GET_SUPPORT_CHAT = gql`
  mutation OpenOrGetSupportChat($input: OpenSupportChatInput!) {
    openOrGetSupportChat(input: $input) {
      _id
      chatScope
      chatStatus
      requesterId
      requesterType
      brandId
      assignedAdminId
      chatSubject
      supportTopic
      sourcePath
      lastMessageAt
      lastMessageText
      lastMessageSenderId
      unreadRequesterCount
      unreadResponderCount
      unreadCount
      canReply
      createdAt
      updatedAt
      requesterData {
        _id
        memberType
        memberStatus
        memberNick
        memberFullName
        memberImage
        memberEmail
      }
      assignedAdminData {
        _id
        memberType
        memberStatus
        memberNick
        memberFullName
        memberImage
        memberEmail
      }
    }
  }
`;

export const SEND_CHAT_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      _id
      conversationId
      senderId
      senderType
      messageType
      message
      attachments
      replyToId
      readByMemberIds
      isReadByMe
      isOwnMessage
      createdAt
      updatedAt
      senderData {
        _id
        memberType
        memberStatus
        memberNick
        memberFullName
        memberImage
      }
    }
  }
`;

export const UPDATE_CHAT_MESSAGE = gql`
  mutation UpdateMessageChat($input: MessageChatUpdate!) {
    updateMessageChat(input: $input) {
      _id
      conversationId
      senderId
      senderType
      messageType
      message
      attachments
      replyToId
      readByMemberIds
      isReadByMe
      isOwnMessage
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_CHAT_MESSAGE = gql`
  mutation RemoveMessageChat($input: RemoveMessageInput!) {
    removeMessageChat(input: $input) {
      _id
      conversationId
      senderId
      senderType
      messageType
      message
      attachments
      deletedAt
      createdAt
      updatedAt
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

export const MARK_CHAT_MESSAGES_AS_READ = gql`
  mutation MarkChatMessagesAsRead($chatId: String!) {
    markChatMessagesAsRead(chatId: $chatId) {
      _id
      unreadCount
      unreadRequesterCount
      unreadResponderCount
    }
  }
`;

export const CLAIM_SUPPORT_CHAT = gql`
  mutation ClaimSupportChat($chatId: String!) {
    claimSupportChat(chatId: $chatId) {
      _id
      chatStatus
      assignedAdminId
      canReply
    }
  }
`;

export const CLOSE_CHAT = gql`
  mutation CloseChat($chatId: String!) {
    closeChat(chatId: $chatId) {
      _id
      chatStatus
      canReply
    }
  }
`;
