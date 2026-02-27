export type FaqCategory =
  | 'GENERAL'
  | 'PRODUCTS'
  | 'ORDERS'
  | 'PAYMENTS'
  | 'SHIPPING'
  | 'ACCOUNT'
  | 'OTHER';

export interface Faq {
  _id: string;
  faqCategory: FaqCategory;
  faqQuestion: string;
  faqAnswer: string;
  createdAt: Date;
}

export interface FaqsData {
  list: Faq[];
  metaData: {
    total: number;
    page: number;
    limit: number;
  };
}
