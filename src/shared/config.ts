export const config = {
  extension: {
    name: __NAME__,
    prefix: "notasliterarias-",
  },

  goodreads: {
    communityReviews: "#CommunityReviews",
    origin: "https://www.goodreads.com",
    searchQuery: "/search?q=",
  },

  selectors: {
    acrPopover: "span#notasliterarias-acrPopover",
    bookAnchor: "a.bookTitle",
    bookDetails: "div#detailBullets_feature_div > ul > li > span > span",
    bookPage: "div#detailBullets_feature_div",
    customerReviews: "a#notasliterarias-acrCustomerReviewLink",
    customerReviewsCount: "a#notasliterarias-acrCustomerReviewLink > span",
    popover: "div#notasliterarias-popover",
    popoverAcrLink: "a#notasliterarias-acrPopoverLink",
    popoverAriaHidden: "span#notasliterarias-ariaHidden",
    popoverAriaValueNow: "div#notasliterarias-popoverAriaValueNow",
    popoverAokOffscreen: "span#notasliterarias-aokOffscreen",
    popoverHistogramColumns: "div#notasliterarias-histogramColumns",
    popoverHistogramTable: "ul#notasliterarias-histogramTable",
    popoverPercentageWidth: "div#notasliterarias-popoverPercentageWidth",
    popoverRatingAnchor: "a#notasliterarias-popoverRatingAnchor",
    popoverRatingColumnStars: "div#notasliterarias-popoverRatingColumnStars",
    popoverStarsFilled: "i#notasliterarias-stars",
    popoverTotalReviewCount: "span#notasliterarias-total-review-count",
    popTitle: "span#notasliterarias-acrPopover",
    rating: 'div.RatingStatistics__rating[aria-hidden="true"]',
    ratingContainer:
      "div#averageCustomerReviews, div#averageCustomerReviews_feature_div",
    ratingStars: "a > i.a-icon-star",
    ratingStarsAlt: "a > i.a-icon-star > span",
    ratingStarsMini: "a > i.a-icon-star-mini",
    ratingStarsMiniAlt: "a > i.a-icon-star-mini > span",
    ratingValue: "a > span",
    ratingsCount: 'span[data-testid="ratingsCount"][aria-hidden="true"]',
    stars:
      "div.RatingsHistogram.RatingsHistogram__interactive > div > div.RatingsHistogram__labelTotal",
  },

  ui: {
    averageRating: "Classificação média",
    globalRatings: "classificações globais",
    goodreadsSource: "(goodreads)",
    loading: "Buscando classificações do Goodreads...",
    popoverDelayInMs: 200,
    ratingOf5: "de 5",
    stars: "estrelas",
  },
};

export function prefixID(id: string): string {
  return `${config.extension.prefix}${id}`;
}

export function goodreadsURL(path: string): string {
  return `${config.goodreads.origin}${path}`;
}
