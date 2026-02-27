import { gql } from "@apollo/client";

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: ReviewInput!) {
    createReview(input: $input) {
      _id
      reviewRating
      reviewComment
      reviewImages
      createdAt
    }
  }
`;

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($input: ReviewUpdate!) {
    updateReview(input: $input) {
      _id
      reviewRating
      reviewComment
      reviewImages
      updatedAt
    }
  }
`;
