import { tehranDayRange } from './tehran-day';

describe('tehranDayRange', () => {
  it('starts the Tehran day at 20:30 UTC', () => {
    const midnight = tehranDayRange(new Date('2026-09-29T20:30:00.000Z'));
    expect(midnight.start.toISOString()).toBe('2026-09-29T20:30:00.000Z');
    expect(midnight.end.toISOString()).toBe('2026-09-30T20:30:00.000Z');

    const justBefore = tehranDayRange(new Date('2026-09-29T20:29:59.000Z'));
    expect(justBefore.start.toISOString()).toBe('2026-09-28T20:30:00.000Z');
    expect(justBefore.end.toISOString()).toBe('2026-09-29T20:30:00.000Z');
  });
});
