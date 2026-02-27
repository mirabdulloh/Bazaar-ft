import { gql } from "@apollo/client";

export const GET_MEMBER_FOLLOWINGS = gql`
  query GetMemberFollowings($input: FollowInquiry!) {
    getMemberFollowings(input: $input) {
      list {
        _id
        followingId
        followerId
        createdAt
        followingData {
          _id
          memberNick
          memberImage
          memberType
          memberFollowers
        }
        meFollowed {
          followerId
          followingId
          myFollowing
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

export const GET_MEMBER_FOLLOWERS = gql`
  query GetMemberFollowers($input: FollowInquiry!) {
    getMemberFollowers(input: $input) {
      list {
        _id
        followingId
        followerId
        createdAt
        followerData {
          _id
          memberNick
          memberImage
          memberType
        }
        meFollowed {
          followerId
          followingId
          myFollowing
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
