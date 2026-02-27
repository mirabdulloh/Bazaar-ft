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
      updatedAt
    }
  }
`;

// ─── Products ─────────────────────────────────────────────────────────────────

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      _id
      productType
      productStatus
      productTitle
      productPrice
      productDiscountPrice
      productImages
      productStockQuantity
      productSize
      productColor
      createdAt
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($input: ProductUpdate!) {
    updateProduct(input: $input) {
      _id
      productType
      productStatus
      productTitle
      productPrice
      productDiscountPrice
      productImages
      productStockQuantity
      productDesc
      productSize
      productColor
      productMaterials
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
