export type SupportedSite = "goodreads";

export type CodeFormat = "asin" | "isbn";

export type GetReviewsMessage = {
  site: SupportedSite;
  code: string;
  format: CodeFormat;
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
  sectionLink: string;
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
