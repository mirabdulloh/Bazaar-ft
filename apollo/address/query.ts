import { gql } from "@apollo/client";

export const GET_ADDRESSES = gql`
  query GetAddresses {
    getAddresses {
      _id
      memberId
      addressName
      addressPhone
      addressCountry
      addressCity
      addressZipCode
      addressLine1
      addressLine2
      isDefault
      addressStatus
      createdAt
      updatedAt
    }
  }
`;
