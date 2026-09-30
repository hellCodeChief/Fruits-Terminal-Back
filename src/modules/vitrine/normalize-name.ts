/** Collapse spaces and Arabic/Persian lookalikes so one product name matches once. */
export function normalizePersianName(input: string): string {
  return (input ?? '')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u200c\u200d]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function escapeLike(input: string): string {
  return input.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}
