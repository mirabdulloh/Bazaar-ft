import { gql } from "@apollo/client";

const BRAND_FRAGMENT = `
  _id
  brandName
  brandLogo
  brandDesc
  brandStatus
  brandRating
  brandFollowersCount
  brandReviewsCount
  createdAt
  updatedAt
`;

export const GET_BRAND = gql`
  query GetBrand($brandId: String!) {
    getBrand(brandId: $brandId) {
      ${BRAND_FRAGMENT}
      memberData {
        _id
        memberNick
        memberImage
        memberFollowers
        memberProducts
      }
    }
  }
`;

export const GET_BRANDS_LIST = gql`
  query GetBrandsList($input: BrandsInquiry!) {
    getBrands(input: $input) {
      list {
        ${BRAND_FRAGMENT}
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

export const GET_MY_BRAND = gql`
  query GetMyBrand {
    getMyBrand {
      ${BRAND_FRAGMENT}
      memberData {
        _id
        memberNick
        memberPhone
        memberEmail
        memberImage
      }
    }
  }
`;
