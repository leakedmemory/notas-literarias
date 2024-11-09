import browser from "webextension-polyfill";

import type { GetReviewsMessage, Reviews, Star } from "./messages";

browser.runtime.onMessage.addListener(messageHandler);

/**
 * @see Description of the function parameters: {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#parameters|runtime.onMessage#Parameters}
 */
function messageHandler(
  message: unknown,
  // @ts-ignore Unused parameter
  sender: browser.Runtime.MessageSender,
  sendResponse: (response: unknown) => void,
): true | Promise<unknown> | undefined {
  const reviewsMessage = message as GetReviewsMessage;

  if (reviewsMessage.site === "goodreads" && reviewsMessage.format === "isbn") {
    getGoodreadsReviewsByISBN(reviewsMessage.code)
      .then((reviews) => {
        sendResponse({ reviews: reviews, err: null });
      })
      .catch((error) => {
        sendResponse({ reviews: null, err: error });
      });

    return true;
  }
}

/**
 * @throws On fetch errors and query selections `null` returns.
 */
async function getGoodreadsReviewsByISBN(isbn: string): Promise<Reviews> {
  const url = `https://www.goodreads.com/search?q=${isbn}/`;
  const response = await fetch(url);
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const ratingElement = doc.querySelector(
    'div.RatingStatistics__rating[aria-hidden="true"]',
  ) as HTMLDivElement;
  if (!ratingElement) {
    throw new Error("rating not found");
  }

  const rating = roundRating(ratingElement.innerText);

  const ratingsCountElement = doc.querySelector(
    'span[data-testid="ratingsCount"][aria-hidden="true"]',
  ) as HTMLSpanElement;
  if (!ratingsCountElement) {
    throw new Error("ratings count not found");
  }

  const ratingsCount = ratingsCountElement.innerHTML.slice(
    0,
    ratingsCountElement.innerHTML.indexOf("<"),
  );

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
      amount: amount,
      percentage: percentage
        .slice(1, percentage.indexOf("%"))
        .replace(",", "."),
    };
  });

  const reviewsSectionLink = `${response.url}#CommunityReviews`;

  const reviews: Reviews = {
    site: "goodreads",
    rating: rating,
    ratingsCount: ratingsCount,
    reviewsSectionLink: reviewsSectionLink,
    stars: stars,
  };

  return reviews;
}

function roundRating(rating: string): string {
  const num = Number.parseFloat(rating);
  const scaled = num * 10;
  const rounded = Math.round(scaled);
  return (rounded / 10).toFixed(1);
}
