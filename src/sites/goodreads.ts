import type { Reviews, Star, ISBN } from "../messages";
import { roundRating } from "./utils";
import type { ReviewsParser } from "./reviews-parser";

export class GoodreadsParser implements ReviewsParser {
  /**
   * @throws On fetch errors and query selections `null` returns.
   */
  public async getReviewsByISBN(isbn: ISBN): Promise<Reviews> {
    const url = `https://www.goodreads.com/search?q=${isbn}/`;
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const reviews = this._getGoodreadsReviews(doc, response.url);

    return reviews;
  }

  private _getGoodreadsReviews(doc: Document, bookURL: string): Reviews {
    const reviews: Reviews = {
      site: "goodreads",
      rating: this._getRating(doc),
      amount: this._getAmountOfReviews(doc),
      sectionLink: `${bookURL}#CommunityReviews`,
      stars: this._getStars(doc),
    };

    return reviews;
  }

  private _getRating(doc: Document): string {
    const ratingElement = doc.querySelector(
      'div.RatingStatistics__rating[aria-hidden="true"]',
    ) as HTMLDivElement;
    if (!ratingElement) {
      throw new Error("rating not found");
    }

    return roundRating(ratingElement.innerText);
  }

  private _getAmountOfReviews(doc: Document): number {
    const ratingsCountElement = doc.querySelector(
      'span[data-testid="ratingsCount"][aria-hidden="true"]',
    ) as HTMLSpanElement;
    if (!ratingsCountElement) {
      throw new Error("ratings count not found");
    }

    const amount = Number.parseInt(
      ratingsCountElement.innerHTML
        .slice(0, ratingsCountElement.innerHTML.indexOf("<"))
        .replace(",", ""),
    );

    return amount;
  }

  private _getStars(doc: Document): Star[] {
    const starsElement = Array.from(
      doc.querySelectorAll(
        "div.RatingsHistogram.RatingsHistogram__interactive > div > div.RatingsHistogram__labelTotal",
      ),
    ) as HTMLDivElement[];
    if (!starsElement) {
      throw new Error("star ranks not found");
    }

    const stars: Star[] = starsElement.map((starRankElement, idx) => {
      const selector = `div.RatingsHistogram.RatingsHistogram__interactive > div:nth-child(${idx + 1}) > div.RatingsHistogram__labelTotal`;
      const [amount, percentage] = starRankElement.innerText.split(" ");

      return {
        rank: 5 - idx,
        selector: selector,
        amount: Number.parseInt(amount.replace(",", "")),
        percentage: percentage.slice(1, percentage.indexOf("%")),
      };
    });

    return stars;
  }
}
