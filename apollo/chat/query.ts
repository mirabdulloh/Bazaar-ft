import { gql } from "@apollo/client";

const CHAT_MEMBER_FIELDS = gql`
  fragment ChatMemberFields on Member {
    _id
    memberType
    memberStatus
    memberNick
    memberFullName
    memberImage
    memberEmail
  }
`;

const CHAT_BRAND_FIELDS = gql`
  fragment ChatBrandFields on Brand {
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
`;

const CHAT_LAST_MESSAGE_FIELDS = gql`
  fragment ChatLastMessageFields on ChatLastMessage {
    _id
    senderId
    senderType
    messageType
    message
    attachments
    createdAt
  }
`;

const CHAT_LIST_FIELDS = gql`
  fragment ChatListFields on Chat {
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
    lastMessageId
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
      ...ChatMemberFields
    }
    brandData {
      ...ChatBrandFields
    }
    assignedAdminData {
      ...ChatMemberFields
    }
    lastMessage {
      ...ChatLastMessageFields
    }
  }
  ${CHAT_MEMBER_FIELDS}
  ${CHAT_BRAND_FIELDS}
  ${CHAT_LAST_MESSAGE_FIELDS}
`;

const CHAT_MESSAGE_FIELDS = gql`
  fragment ChatMessageFields on MessageChat {
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
    deletedAt
    createdAt
    updatedAt
    senderData {
      ...ChatMemberFields
    }
    parentMessageData {
      _id
      senderId
      senderType
      messageType
      message
      attachments
      createdAt
    }
  }
  ${CHAT_MEMBER_FIELDS}
`;

export const GET_CHAT = gql`
  query GetChat($input: GetChatInput!) {
    getChat(input: $input) {
      ...ChatListFields
    }
  }
  ${CHAT_LIST_FIELDS}
`;

export const GET_CHAT_PRESENCE = gql`
  query GetChatPresence($chatId: String!) {
    getChatPresence(chatId: $chatId) {
      targetMemberId
      isOnline
      lastActiveAt
    }
  }
`;

export const GET_MY_CHATS = gql`
  query GetMyChats($input: ChatsInquiry!) {
    getMyChats(input: $input) {
      list {
        ...ChatListFields
      }
      metaCounter {
        total
      }
    }
  }
  ${CHAT_LIST_FIELDS}
`;

export const GET_BRAND_CHATS = gql`
  query GetBrandChats($input: ChatsInquiry!) {
    getBrandChats(input: $input) {
      list {
        ...ChatListFields
      }
      metaCounter {
        total
      }
    }
  }
  ${CHAT_LIST_FIELDS}
`;

export const GET_MY_SUPPORT_CHATS = gql`
  query GetMySupportChats($input: ChatsInquiry!) {
    getMySupportChats(input: $input) {
      list {
        ...ChatListFields
      }
      metaCounter {
        total
      }
    }
  }
  ${CHAT_LIST_FIELDS}
`;

export const GET_ADMIN_SUPPORT_CHATS = gql`
  query GetAdminSupportChats($input: ChatsInquiryByAdmin!) {
    getAdminSupportChats(input: $input) {
      list {
        ...ChatListFields
      }
      metaCounter {
        total
      }
    }
  }
  ${CHAT_LIST_FIELDS}
`;

export const GET_MESSAGES = gql`
  query GetMessages($input: MessagesInquiry!) {
    getMessages(input: $input) {
      list {
        ...ChatMessageFields
      }
      metaCounter {
        total
      }
    }
  }
  ${CHAT_MESSAGE_FIELDS}
`;

export const GET_ALL_MESSAGES_BY_ADMIN = gql`
  query GetAllMessagesByAdmin($input: MessagesInquiry!) {
    getAllMessagesByAdmin(input: $input) {
      list {
        ...ChatMessageFields
      }
      metaCounter {
        total
      }
    }
  }
  ${CHAT_MESSAGE_FIELDS}
`;

export const GET_MY_UNREAD_CHAT_COUNT = gql`
  query GetMyUnreadChatCount {
    getMyUnreadChatCount
  }
`;
