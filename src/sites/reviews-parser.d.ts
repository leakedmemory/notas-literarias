import type { Reviews, ISBN } from "../messages";

export interface ReviewsParser {
  getReviewsByISBN(isbn: ISBN): Promise<Reviews>;
}
