import { gql } from "@apollo/client";

export const GET_REVIEWS = gql`
  query GetReviews($input: ReviewsInquiry!) {
    getReviews(input: $input) {
      list {
        _id
        productId
        memberId
        reviewRating
        reviewComment
        reviewImages
        reviewStatus
        reviewLikes
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
