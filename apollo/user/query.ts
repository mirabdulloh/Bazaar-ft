import { gql } from "@apollo/client";

export const GET_MEMBER = gql`
  query GetMember($memberId: String!) {
    getMember(memberId: $memberId) {
      _id
      memberType
      memberStatus
      memberNick
      memberFullName
      memberImage
      memberDesc
      memberArticles
      memberFollowers
      memberFollowings
      memberPoints
      memberLikes
      memberViews
      memberRank
      createdAt
    }
  }
`;

export const GET_BRANDS = gql`
  query GetBrands($input: BrandInquiry!) {
    getBrands(input: $input) {
      list {
        _id
        memberType
        memberStatus
        memberNick
        memberFullName
        memberImage
        memberDesc
        memberFollowers
        memberFollowings
        memberProducts
        memberRank
        createdAt
      }
      metaData {
        total
        page
        limit
      }
    }
  }
`;
