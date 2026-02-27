import { gql } from "@apollo/client";

export const CHECK_COUPON = gql`
  query CheckCoupon($couponCode: String!) {
    checkCoupon(couponCode: $couponCode) {
      _id
      couponCode
      couponType
      discountType
      discountValue
      couponEndDate
      couponStatus
    }
  }
`;

export const CLAIM_COUPON = gql`
  mutation ClaimCoupon($couponCode: String!) {
    claimCoupon(couponCode: $couponCode) {
      _id
      memberCouponId
      memberCouponStatus
      memberCouponAssignedAt
    }
  }
`;
