import { isNullOrUndefined, removeNullOrUndefined, sleep } from '../../src/utils';

describe('Utils', () => {
  describe('isNullOrUndefined', () => {
    it('should return true for null', () => {
      expect(isNullOrUndefined(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(isNullOrUndefined(undefined)).toBe(true);
    });

    it('should return false for other values', () => {
      expect(isNullOrUndefined(0)).toBe(false);
      expect(isNullOrUndefined('')).toBe(false);
      expect(isNullOrUndefined(false)).toBe(false);
      expect(isNullOrUndefined({})).toBe(false);
    });
  });

  describe('removeNullOrUndefined', () => {
    it('should remove null and undefined values from object', () => {
      const input = {
        a: 1,
        b: null,
        c: undefined,
        d: 'test',
        e: false,
        f: 0,
      };

      const expected = {
        a: 1,
        d: 'test',
        e: false,
        f: 0,
      };

      expect(removeNullOrUndefined(input)).toEqual(expected);
    });

    it('should return empty object for all null/undefined values', () => {
      const input = {
        a: null,
        b: undefined,
      };

      expect(removeNullOrUndefined(input)).toEqual({});
    });
  });

  describe('sleep', () => {
    it('should wait for specified time', async () => {
      const start = Date.now();
      const waitTime = 100;

      await sleep(waitTime);

      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(waitTime);
    });

    it('should resolve after timeout', async () => {
      const promise = sleep(50);
      expect(promise).resolves.toBeUndefined();
    });
  });
});
