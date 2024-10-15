const ASIN_INDEX = 1;
const ISBN13_INDEX = 9;

const product_details = Array.from(
  document
    .querySelectorAll("#detailBullets_feature_div > ul > li > span > span")
    .values(),
);

function getBookRating() {
  if (product_details.length > 1 && isKindle()) {
    console.log(`BOOK RATINGS: found book with ${getASIN()} ASIN code`);
  } else if (product_details.length > 1 && isPrinted()) {
    console.log(`BOOK RATINGS: found book with ${getISBN()} ISBN-13 code`);
  } else {
    console.log("BOOK RATINGS: product is not a book");
  }
}

function isKindle() {
  return product_details[ASIN_INDEX - 1].innerText === "ASIN  : ";
}

function getASIN() {
  return product_details[ASIN_INDEX].innerText;
}

function isPrinted() {
  return product_details[ISBN13_INDEX - 1].innerText === "ISBN-13  : ";
}

function getISBN() {
  return product_details[ISBN13_INDEX].innerText;
}

getBookRating();
