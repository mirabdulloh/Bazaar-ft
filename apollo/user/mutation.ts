import { gql } from '@apollo/client';

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberEmail
			memberImage
			memberAddress
			memberDesc
			memberArticles
			memberFollowers
			memberFollowings
			memberPoints
			memberLikes
			memberViews
			memberComments
			memberRank
			memberWarnings
			memberBlocks
			memberCouponId
			memberCouponStatus
			memberCouponUsedAt
			memberCouponAssignedAt
			lastLoginAt
			lastActiveAt
			deletedAt
			createdAt
			updatedAt
			accessToken
			memberProducts
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberEmail
			memberImage
			memberAddress
			memberDesc
			memberArticles
			memberFollowers
			memberFollowings
			memberPoints
			memberLikes
			memberViews
			memberComments
			memberRank
			memberWarnings
			memberProducts
			memberBlocks
			memberCouponId
			memberCouponStatus
			memberCouponUsedAt
			memberCouponAssignedAt
			lastLoginAt
			lastActiveAt
			deletedAt
			createdAt
			updatedAt
			accessToken
			refreshToken
		}
	}
`;
