import { normalizePersianName } from './normalize-name';

describe('normalizePersianName', () => {
  it('collapses extra spaces and Arabic yeh/kaf', () => {
    expect(normalizePersianName('  سيب   زميني  ')).toBe('سیب زمینی');
    expect(normalizePersianName('\u0643\u062a\u0627\u0628')).toBe('کتاب');
  });

  it('treats a zero-width non-joiner like a space', () => {
    expect(normalizePersianName('سیب‌زمینی')).toBe('سیب زمینی');
  });

  it('returns empty for blank input', () => {
    expect(normalizePersianName('   ')).toBe('');
  });
});
