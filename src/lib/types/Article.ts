export type ArticleCategory =
  | 'FASHIONGUIDES'
  | 'TIPS'
  | 'REVIEW'
  | 'NEWS'
  | 'OTHER';

export type ArticleStatus = 'ACTIVE' | 'DELETE';

export interface ArticleMemberData {
  _id: string;
  memberNick: string;
  memberImage: string;
}

export interface ArticleMeLiked {
  memberId: string;
  likeRefId: string;
  myFavorite: boolean;
}

export interface Article {
  _id: string;
  memberId: string;
  articleCategory: ArticleCategory;
  articleStatus: ArticleStatus;
  articleTitle: string;
  articleContent?: string;
  articleImages: string[];
  articleViews: number;
  articleLikes: number;
  articleComments: number;
  publishedAt: Date;
  createdAt: Date;
  memberData: ArticleMemberData;
  meLiked: ArticleMeLiked[];
}

export interface ArticlesData {
  list: Article[];
  metaData: {
    total: number;
    page: number;
    limit: number;
  };
}
