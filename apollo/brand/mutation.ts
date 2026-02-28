import { gql } from "@apollo/client";

// ─── Brand Profile ────────────────────────────────────────────────────────────

export const UPDATE_BRAND = gql`
  mutation UpdateBrand($input: BrandUpdate!) {
    updateBrand(input: $input) {
      _id
      brandName
      brandLogo
      brandDesc
      brandStatus
      brandRating
      brandFollowersCount
      brandReviewsCount
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

// ─── Products ─────────────────────────────────────────────────────────────────

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
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

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($input: ProductUpdate!) {
    updateProduct(input: $input) {
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

// ─── Coupons ──────────────────────────────────────────────────────────────────

export const CREATE_BRAND_COUPON = gql`
  mutation CreateBrandCoupon($input: BrandCouponInput!) {
    createBrandCoupon(input: $input) {
      _id
      couponCode
      couponType
      brandId
      discountType
      discountValue
      couponMaxUsage
      couponUsageCount
      minOrderCount
      couponStartDate
      couponEndDate
      couponStatus
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_BRAND_COUPON = gql`
  mutation UpdateBrandCoupon($input: BrandCouponUpdate!) {
    updateBrandCoupon(input: $input) {
      _id
      couponCode
      couponType
      brandId
      discountType
      discountValue
      couponMaxUsage
      couponUsageCount
      minOrderCount
      couponStartDate
      couponEndDate
      couponStatus
      createdAt
      updatedAt
    }
  }
`;
