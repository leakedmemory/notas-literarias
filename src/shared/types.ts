export enum CodeFormat {
  ISBN = "ISBN",
  ASIN = "ASIN",
}

export type Book = {
  code: string;
  format: CodeFormat;
};

export type Star = {
  rank: number;
  amount: number;
  percentage: string;
};

export type Reviews = {
  rating: string;
  amount: number;
  stars: Star[];
  url: string;
};

export enum MessageType {
  SearchCode = "SEARCH_CODE",
  FetchURL = "FETCH_URL",
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
