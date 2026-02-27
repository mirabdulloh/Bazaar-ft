import { gql } from "@apollo/client";

export const LIKE_TARGET_PRODUCT = gql`
  mutation LikeTargetProduct($productId: String!) {
    likeTargetProduct(productId: $productId) {
      _id
      productLikes
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      _id
      productStatus
      productTitle
      productPrice
      productImages
      createdAt
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($input: ProductUpdate!) {
    updateProduct(input: $input) {
      _id
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
