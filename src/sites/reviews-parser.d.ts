import type { Reviews, CodeFormat, ISBN, ASIN } from "../messages";

export interface ReviewsParser {
  getReviews(code: ISBN | ASIN, codeFormat: CodeFormat): Promise<Reviews>;
}
