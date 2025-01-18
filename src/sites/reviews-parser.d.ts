import type { Reviews, CodeFormat } from "../messages";

export interface ReviewsParser {
  getReviews(code: string, format: CodeFormat): Promise<Reviews>;
}
