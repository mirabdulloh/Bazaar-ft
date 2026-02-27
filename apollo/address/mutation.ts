import { gql } from "@apollo/client";

const ADDRESS_FRAGMENT = `
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
`;

export const CREATE_ADDRESS = gql`
  mutation CreateAddress($input: AddressInput!) {
    createAddress(input: $input) {
      ${ADDRESS_FRAGMENT}
    }
  }
`;

export const UPDATE_ADDRESS = gql`
  mutation UpdateAddress($input: AddressUpdate!) {
    updateAddress(input: $input) {
      ${ADDRESS_FRAGMENT}
    }
  }
`;

export const DELETE_ADDRESS = gql`
  mutation DeleteAddress($addressId: String!) {
    deleteAddress(addressId: $addressId) {
      _id
      addressStatus
    }
  }
`;
