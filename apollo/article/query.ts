import { gql } from "@apollo/client";

const ARTICLE_FRAGMENT = `
  _id
  memberId
  articleCategory
  articleStatus
  articleTitle
  articleContent
  articleImages
  articleViews
  articleLikes
  articleComments
  publishedAt
  createdAt
  updatedAt
`;

export const GET_BOARD_ARTICLE = gql`
  query GetBoardArticle($articleId: String!) {
    getBoardArticle(articleId: $articleId) {
      ${ARTICLE_FRAGMENT}
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

export const GET_BOARD_ARTICLES = gql`
  query GetBoardArticles($input: ArticlesInquiry!) {
    getBoardArticles(input: $input) {
      list {
        ${ARTICLE_FRAGMENT}
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
