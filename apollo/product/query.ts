import { gql } from "@apollo/client";

const PRODUCT_FRAGMENT = `
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
`;

export const GET_PRODUCT = gql`
  query GetProduct($productId: String!) {
    getProduct(productId: $productId) {
      ${PRODUCT_FRAGMENT}
      memberData {
        _id
        memberNick
        memberImage
      }
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts($input: ProductsInquiry!) {
    getProducts(input: $input) {
      list {
        ${PRODUCT_FRAGMENT}
        memberData {
          _id
          memberNick
          memberImage
        }
        meLiked {
          memberId
          likeRefId
          myFavorite
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

export const GET_FAVORITE_PRODUCTS = gql`
  query GetFavoriteProducts($input: OrdinaryInquiry!) {
    getFavoriteProducts(input: $input) {
      list {
        ${PRODUCT_FRAGMENT}
        memberData {
          _id
          memberNick
          memberImage
        }
        meLiked {
          memberId
          likeRefId
          myFavorite
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

export const GET_VISITED_PRODUCTS = gql`
  query GetVisitedProducts($input: OrdinaryInquiry!) {
    getVisitedProducts(input: $input) {
      list {
        ${PRODUCT_FRAGMENT}
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

export const GET_BRAND_PRODUCTS = gql`
  query GetBrandProducts($input: BrandProductsInquiry!) {
    getBrandProducts(input: $input) {
      list {
        ${PRODUCT_FRAGMENT}
      }
      metaData {
        total
        page
        limit
      }
    }
  }
`;
