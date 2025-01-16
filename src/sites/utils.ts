export function roundRating(rating: string): string {
  const num = Number.parseFloat(rating);
  const scaled = num * 10;
  const rounded = Math.round(scaled);
  return (rounded / 10).toFixed(1);
}
