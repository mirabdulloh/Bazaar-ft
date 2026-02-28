import { gql } from "@apollo/client";

// ─── Members ──────────────────────────────────────────────────────────────────

export const UPDATE_MEMBER_BY_ADMIN = gql`
  mutation UpdateMemberByAdmin($input: MemberUpdateByAdmin!) {
    updateMemberByAdmin(input: $input) {
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
    }
  }
`;

// ─── Brands ───────────────────────────────────────────────────────────────────

export const UPDATE_BRAND_BY_ADMIN = gql`
  mutation UpdateBrandByAdmin($input: BrandUpdateByAdmin!) {
    updateBrandByAdmin(input: $input) {
      _id
      brandStatus
      updatedAt
    }
  }
`;

// ─── Products ─────────────────────────────────────────────────────────────────

export const REMOVE_PRODUCT_BY_ADMIN = gql`
  mutation RemoveProductByAdmin($input: String!) {
    removeProductByAdmin(productId: $input) {
      _id
      memberId
      productType
      productCategoryId
      productStatus
      productTitle
      productPrice
      productDiscountPrice
      productViews
      productLikes
      productComments
      productRank
      productImages
      productRatingAverage
      productRatingCount
      productStockQuantity
      productDesc
      productSize
      productColor
      productMaterials
      createdAt
      updatedAt
    }
  }
`;

// ─── Orders ───────────────────────────────────────────────────────────────────

export const UPDATE_ORDER_BY_ADMIN = gql`
  mutation UpdateOrderByAdmin($input: OrderUpdate!) {
    updateOrderByAdmin(input: $input) {
      _id
      orderStatus
      orderPaymentStatus
      orderDeliveryStatus
      updatedAt
    }
  }
`;

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const UPDATE_REVIEW_BY_ADMIN = gql`
  mutation UpdateReviewByAdmin($input: ReviewUpdateByAdmin!) {
    updateReviewByAdmin(input: $input) {
      _id
      reviewStatus
      updatedAt
    }
  }
`;

export const REMOVE_REVIEW_BY_ADMIN = gql`
  mutation RemoveReviewByAdmin($reviewId: String!) {
    removeReviewByAdmin(reviewId: $reviewId) {
      _id
      reviewStatus
    }
  }
`;

// ─── Categories ───────────────────────────────────────────────────────────────

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      _id
      categoryName
      parentCategoryId
      categoryStatus
      createdAt
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($input: CategoryUpdate!) {
    updateCategory(input: $input) {
      _id
      categoryName
      categoryStatus
      updatedAt
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($categoryId: String!) {
    deleteCategory(categoryId: $categoryId) {
      _id
      categoryStatus
    }
  }
`;

// ─── Coupons ──────────────────────────────────────────────────────────────────

export const CREATE_COUPON_BY_ADMIN = gql`
  mutation CreateCouponByAdmin($input: CouponInput!) {
    createCouponByAdmin(input: $input) {
      _id
      couponCode
      discountType
      discountValue
      couponStartDate
      couponEndDate
      couponStatus
    }
  }
`;

export const UPDATE_COUPON_BY_ADMIN = gql`
  mutation UpdateCouponByAdmin($input: CouponUpdate!) {
    updateCouponByAdmin(input: $input) {
      _id
      couponCode
      discountType
      discountValue
      couponStatus
      updatedAt
    }
  }
`;

export const REMOVE_COUPON_BY_ADMIN = gql`
  mutation RemoveCouponByAdmin($couponId: String!) {
    removeCouponByAdmin(couponId: $couponId) {
      _id
      couponStatus
    }
  }
`;

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export const CREATE_FAQ_BY_ADMIN = gql`
  mutation CreateFaqByAdmin($input: FaqInput!) {
    createFaqByAdmin(input: $input) {
      _id
      faqCategory
      faqQuestion
      faqAnswer
      createdAt
    }
  }
`;

export const UPDATE_FAQ_BY_ADMIN = gql`
  mutation UpdateFaqByAdmin($input: FaqUpdate!) {
    updateFaqByAdmin(input: $input) {
      _id
      faqCategory
      faqStatus
      faqQuestion
      faqAnswer
      updatedAt
    }
  }
`;

export const REMOVE_FAQ_BY_ADMIN = gql`
  mutation RemoveFaqByAdmin($faqId: String!) {
    removeFaqByAdmin(faqId: $faqId) {
      _id
      faqStatus
    }
  }
`;

// ─── Notices ──────────────────────────────────────────────────────────────────

export const CREATE_NOTICE_BY_ADMIN = gql`
  mutation CreateNoticeByAdmin($input: NoticeInput!) {
    createNoticeByAdmin(input: $input) {
      _id
      noticeCategory
      noticeTitle
      noticeContent
      createdAt
    }
  }
`;

export const UPDATE_NOTICE_BY_ADMIN = gql`
  mutation UpdateNoticeByAdmin($input: NoticeUpdate!) {
    updateNoticeByAdmin(input: $input) {
      _id
      noticeCategory
      noticeStatus
      noticeTitle
      noticeContent
      updatedAt
    }
  }
`;

export const REMOVE_NOTICE_BY_ADMIN = gql`
  mutation RemoveNoticeByAdmin($noticeId: String!) {
    removeNoticeByAdmin(noticeId: $noticeId) {
      _id
      noticeStatus
    }
  }
`;

// ─── Brand Coupons ────────────────────────────────────────────────────────────

export const CREATE_BRAND_COUPON = gql`
  mutation CreateBrandCoupon($input: BrandCouponInput!) {
    createBrandCoupon(input: $input) {
      _id
      couponCode
      discountType
      discountValue
      couponStartDate
      couponEndDate
      couponStatus
    }
  }
`;

export const UPDATE_BRAND_COUPON = gql`
  mutation UpdateBrandCoupon($input: BrandCouponUpdate!) {
    updateBrandCoupon(input: $input) {
      _id
      couponCode
      discountType
      discountValue
      couponStatus
      updatedAt
    }
  }
`;
