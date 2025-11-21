import { formatDate, formatTime, getTodayISO, isToday } from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format timestamp to date string', () => {
      const timestamp = new Date('2025-11-20T15:30:00').getTime();
      const formatted = formatDate(timestamp);

      expect(formatted).toContain('Nov');
      expect(formatted).toContain('20');
      expect(formatted).toContain('2025');
    });
  });

  describe('formatTime', () => {
    it('should format timestamp to time string', () => {
      const timestamp = new Date('2025-11-20T15:30:00').getTime();
      const formatted = formatTime(timestamp);

      expect(formatted).toBe('15:30');
    });
  });

  describe('getTodayISO', () => {
    it('should return ISO date string for today', () => {
      const today = getTodayISO();

      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('isToday', () => {
    it('should return true for today date', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });
});
