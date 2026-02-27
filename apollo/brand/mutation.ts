import { gql } from "@apollo/client";

export const UPDATE_BRAND = gql`
  mutation UpdateBrand($input: BrandUpdate!) {
    updateBrand(input: $input) {
      _id
      brandName
      brandLogo
      brandDesc
      brandStatus
      updatedAt
    }
  }
`;
