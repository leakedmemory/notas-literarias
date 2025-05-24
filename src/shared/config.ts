export const config = {
  extension: {
    name: __NAME__,
    prefix: "notasliterarias-",
  },

  goodreads: {
    communityReviewsFilter: "#CommunityReviews",
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
    popoverAnimationDurationInMs: 200,
    popoverDelayBeforeHidingInMs: 350,
    ratingOf5: "de 5",
    stars: "estrelas",
  },
};

/**
 * Adiciona o prefixo da extensão a um ID fornecido.
 *
 * @param id - O ID ao qual será adicionado o prefixo da extensão
 * @returns O ID com o prefixo da extensão concatenado
 */
export function prefixID(id: string): string {
  return `${config.extension.prefix}${id}`;
}

/**
 * Constrói uma URL completa do Goodreads concatenando a origem com o caminho fornecido.
 *
 * @param path - O caminho relativo a ser concatenado com a URL base do Goodreads
 * @returns A URL completa do Goodreads
 */
export function goodreadsURL(path: string): string {
  return `${config.goodreads.origin}${path}`;
}
