export type BrandStatus = 'PENDING' | 'ACTIVE' | 'BLOCKED' | 'DELETE';

export interface BrandMemberData {
  _id: string;
  memberNick: string;
  memberImage: string;
  memberFollowers?: number;
  memberProducts?: number;
}

export interface Brand {
  _id: string;
  brandName: string;
  brandLogo: string;
  brandDesc: string;
  brandStatus: BrandStatus;
  brandRating: number;
  brandFollowersCount: number;
  brandReviewsCount: number;
  createdAt: Date;
  memberData: BrandMemberData;
}

export interface BrandsData {
  list: Brand[];
  metaData: {
    total: number;
    page: number;
    limit: number;
  };
}
