export const GOODREADS_ORIGIN = "https://www.goodreads.com";

export enum CodeFormat {
  ISBN,
  ASIN,
}

export type Product = {
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
  rating: string;
  amount: number;
  sectionURL: string;
  stars?: Star[];
};

export enum MessageType {
  SearchCode,
  FetchURL,
}

export type SearchCodeMessage = {
  msg: MessageType.SearchCode;
  code: string;
};

export type FetchURLMessage = {
  msg: MessageType.FetchURL;
  url: string;
};

export type ContentMessage = SearchCodeMessage | FetchURLMessage;

export type BackgroundResponse = {
  pageHTML?: string;
  url?: string;
  err?: Error;
};
