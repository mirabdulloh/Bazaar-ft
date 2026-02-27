import { gql } from "@apollo/client";

export const CREATE_BOARD_ARTICLE = gql`
  mutation CreateBoardArticle($input: ArticleInput!) {
    createBoardArticle(input: $input) {
      _id
      articleCategory
      articleTitle
      articleContent
      articleImages
      createdAt
    }
  }
`;

export const UPDATE_BOARD_ARTICLE = gql`
  mutation UpdateBoardArticle($input: ArticleUpdate!) {
    updateBoardArticle(input: $input) {
      _id
      articleCategory
      articleStatus
      articleTitle
      articleContent
      articleImages
      updatedAt
    }
  }
`;

export const LIKE_TARGET_BOARD_ARTICLE = gql`
  mutation LikeTargetBoardArticle($articleId: String!) {
    likeTargetBoardArticle(articleId: $articleId) {
      _id
      articleLikes
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
    }
  }
`;
