import { type Reviews, type Star, CodeFormat } from "../shared/messages";

const GOODREADS_ORIGIN = "https://www.goodreads.com";

/**
 * Fetches and parses reviews from Goodreads based on the product code and format.
 *
 * @param code - The ISBN or ASIN code of the product
 * @param format - The format type (ISBN or ASIN)
 * @returns A promise that resolves to the Reviews object
 * @throws On fetch errors and query selections `null` returns
 */
export async function getGoodreadsReviews(
  code: string,
  format: CodeFormat,
): Promise<Reviews> {
  switch (format) {
    case CodeFormat.ISBN:
      return getReviewsByISBN(code);
    case CodeFormat.ASIN:
      return getReviewsByASIN(code);
  }
}

/**
 * Gets reviews for a book using its ISBN code.
 *
 * @param code - The ISBN code of the book
 * @returns A promise that resolves to the Reviews object
 */
async function getReviewsByISBN(code: string): Promise<Reviews> {
  const url = `${GOODREADS_ORIGIN}/search?q=${code}`;
  const response = await fetch(url);
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  return parseGoodreadsReviews(doc, response.url);
}

/**
 * Gets reviews for a book using its ASIN code.
 *
 * @param code - The ASIN code of the book
 * @returns A promise that resolves to the Reviews object
 * @throws If the book is not found for the given ASIN
 */
async function getReviewsByASIN(code: string): Promise<Reviews> {
  const url = `${GOODREADS_ORIGIN}/search?q=${code}`;
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
  const bookURL = `${GOODREADS_ORIGIN}${href.slice(href.indexOf("/book"))}`;
  const bookResponse = await fetch(bookURL);
  const bookHTML = await bookResponse.text();
  const bookDoc = parser.parseFromString(bookHTML, "text/html");

  return parseGoodreadsReviews(bookDoc, bookURL);
}

/**
 * Parses Goodreads reviews from a document.
 *
 * @param doc - The document to parse
 * @param bookURL - The URL of the book
 * @returns The Reviews object
 */
function parseGoodreadsReviews(doc: Document, bookURL: string): Reviews {
  const reviews: Reviews = {
    rating: getRating(doc),
    amount: getAmountOfReviews(doc),
    sectionURL: `${bookURL}#CommunityReviews`,
    stars: getStars(doc),
  };

  return reviews;
}

/**
 * Gets the rating from a Goodreads document.
 *
 * @param doc - The document to parse
 * @returns The rating as a string
 * @throws If the rating is not found
 */
function getRating(doc: Document): string {
  const ratingElement = doc.querySelector(
    'div.RatingStatistics__rating[aria-hidden="true"]',
  ) as HTMLDivElement;
  if (!ratingElement) {
    throw new Error("rating not found");
  }

  return roundRating(ratingElement.innerText).replace(".", ",");
}

/**
 * Rounds a rating to a single decimal place.
 *
 * @param rating - The rating to round
 * @returns The rounded rating as a string
 */
function roundRating(rating: string): string {
  const num = Number.parseFloat(rating);
  const scaled = num * 10;
  const rounded = Math.round(scaled);
  return (rounded / 10).toFixed(1);
}

/**
 * Gets the amount of reviews from a Goodreads document.
 *
 * @param doc - The document to parse
 * @returns The amount of reviews
 * @throws If the ratings count is not found
 */
function getAmountOfReviews(doc: Document): number {
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

/**
 * Gets stars information from a Goodreads document.
 *
 * @param doc - The document to parse
 * @returns An array of Star objects
 * @throws If the star ranks are not found
 */
function getStars(doc: Document): Star[] {
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
