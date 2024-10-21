export type SupportedSite = "goodreads";

export type CodeFormat = "asin" | "isbn";

export type GetReviewsMessage = {
  site: SupportedSite;
  code: string;
  format: CodeFormat;
};

export type StarRank = {
  link?: string;
  amount?: string;
  percentage?: number;
};

export type StarRanks = {
  five: StarRank;
  four: StarRank;
  three: StarRank;
  two: StarRank;
  one: StarRank;
};

export type GetReviewsResponse = {
  bookRating: string;
  reviewsAmount: string;
  reviewsSectionLink: string;
  stars: StarRanks;
};

export function createGetReviewsMessage(
  site: SupportedSite,
  code: string,
  format: CodeFormat,
): GetReviewsMessage {
  return {
    site: site,
    code: code,
    format: format,
  };
}
