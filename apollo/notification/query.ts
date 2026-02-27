import { gql } from "@apollo/client";

export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications($input: NotificationsInquiry!) {
    getMyNotifications(input: $input) {
      list {
        _id
        memberId
        authorId
        receiverId
        notificationType
        notificationStatus
        notificationGroup
        targetId
        notificationTitle
        notificationContent
        readAt
        createdAt
        authorData {
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
