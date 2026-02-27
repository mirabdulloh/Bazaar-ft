export type NoticeCategory =
  | 'GENERAL'
  | 'PRODUCTS'
  | 'ORDERS'
  | 'PAYMENTS'
  | 'SHIPPING'
  | 'ACCOUNT'
  | 'OTHER';

export interface Notice {
  _id: string;
  noticeCategory: NoticeCategory;
  noticeTitle: string;
  noticeContent: string;
  createdAt: Date;
}

export interface NoticesData {
  list: Notice[];
  metaData: {
    total: number;
    page: number;
    limit: number;
  };
}
