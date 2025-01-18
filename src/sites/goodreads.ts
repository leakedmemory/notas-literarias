import { roundRating } from "./utils";
import type { ReviewsParser } from "./reviews-parser";

import {
  type Reviews,
  type Star,
  CodeFormat,
  SupportedSite,
} from "../messages";

export class GoodreadsParser implements ReviewsParser {
  private readonly _origin = "https://www.goodreads.com";

  /**
   * @throws On fetch errors and query selections `null` returns.
   */
  public async getReviews(code: string, format: CodeFormat): Promise<Reviews> {
    switch (format) {
      case CodeFormat.ISBN:
        return this._getReviewsByISBN(code);
      case CodeFormat.ASIN:
        return this._getReviewsByASIN(code);
    }
  }

  private async _getReviewsByISBN(code: string): Promise<Reviews> {
    const url = `${this._origin}/search?q=${code}`;
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const reviews = this._getGoodreadsReviews(doc, response.url);

    return reviews;
  }

  private async _getReviewsByASIN(code: string): Promise<Reviews> {
    const url = `${this._origin}/search?q=${code}`;
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const bookAnchorElement = doc.querySelector(
      "a.bookTitle",
    ) as HTMLAnchorElement;
    if (!bookAnchorElement) {
      throw new Error("book not found for the given ASIN");
    }

    const href = bookAnchorElement.href;
    // the href's origin is the extension
    const bookURL = `${this._origin}${href.slice(href.indexOf("/book"))}`;
    const bookResponse = await fetch(bookURL);
    const bookHTML = await bookResponse.text();
    const bookDoc = parser.parseFromString(bookHTML, "text/html");

    const reviews = this._getGoodreadsReviews(bookDoc, bookURL);

    return reviews;
  }

  private _getGoodreadsReviews(doc: Document, bookURL: string): Reviews {
    const reviews: Reviews = {
      site: SupportedSite.Goodreads,
      rating: this._getRating(doc),
      amount: this._getAmountOfReviews(doc),
      sectionURL: `${bookURL}#CommunityReviews`,
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
