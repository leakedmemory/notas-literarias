// NOTE(leaked): string representation needed when logging
export enum SupportedSite {
  Goodreads = "Goodreads",
}

export enum CodeFormat {
  ISBN,
  ASIN,
}

export type Product = {
  code: string;
  format: CodeFormat;
};

export type GetReviewsMessage = {
  site: SupportedSite;
  product: Product;
};

export type Star = {
  rank: number;
  selector: string;
  amount: number;
  percentage: string;
};

export type Reviews = {
  site: SupportedSite;
  rating: string;
  amount: number;
  sectionURL: string;
  stars?: Star[];
};

export type GetReviewsResponse =
  | {
      reviews: Reviews;
      err: null;
    }
  | {
      reviews: null;
      err: Error;
    };
