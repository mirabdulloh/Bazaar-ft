import { gql } from "@apollo/client";

export const GET_CATEGORIES = gql`
  query GetCategories($input: CategoriesInquiry!) {
    getCategories(input: $input) {
      list {
        _id
        categoryName
        parentCategoryId
        categoryStatus
        createdAt
        subCategories {
          _id
          categoryName
          categoryStatus
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
