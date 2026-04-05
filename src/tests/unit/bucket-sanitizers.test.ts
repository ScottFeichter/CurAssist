// #region ===================== IMPORTS =======================================
import {
  sanitizeName,
  sanitizeAlternateName,
  sanitizeWebsite,
  sanitizeEmail,
  sanitizeDescription,
  sanitizeInternalNotes,
  sanitizeAddress,
  sanitizeCity,
  sanitizeState,
  sanitizeZip,
  sanitizePhoneName,
  sanitizeOrganizationPhones,
  sanitizeOrganizationLegalStatus,
  sanitizeServiceShortDescription,
  sanitizeServiceCost,
  sanitizeServiceWaitTime,
  sanitizeServiceCategories,
  sanitizeServiceEligibilitiesList,
} from '../../server/helpers/bucket-sanitizers';
// #endregion ------------------------------------------------------------------

// #region ====================== TESTS ========================================

describe('bucket-sanitizers', () => {

  // ── sanitizeName ────────────────────────────────────────────────────────────
  describe('sanitizeName', () => {
    it('converts to title case', () => {
      expect(sanitizeName('mission food bank')).toBe('Mission Food Bank');
    });
    it('trims whitespace', () => {
      expect(sanitizeName('  test org  ')).toBe('Test Org');
    });
    it('handles empty string', () => {
      expect(sanitizeName('')).toBe('');
    });
    it('handles null/undefined', () => {
      expect(sanitizeName(null)).toBe('');
      expect(sanitizeName(undefined)).toBe('');
    });
  });

  // ── sanitizeOrganizationPhones ───────────────────────────────────────────────
  describe('sanitizeOrganizationPhones', () => {
    it('formats 10-digit number with dashes', () => {
      expect(sanitizeOrganizationPhones('4155551234')).toBe('415-555-1234');
    });
    it('strips non-digits before formatting', () => {
      expect(sanitizeOrganizationPhones('(415) 555-1234')).toBe('415-555-1234');
    });
    it('returns original if not 10 digits', () => {
      expect(sanitizeOrganizationPhones('555-1234')).toBe('555-1234');
    });
    it('handles empty string', () => {
      expect(sanitizeOrganizationPhones('')).toBe('');
    });
  });

  // ── sanitizeState ────────────────────────────────────────────────────────────
  describe('sanitizeState', () => {
    it('converts to uppercase', () => {
      expect(sanitizeState('ca')).toBe('CA');
    });
    it('trims and uppercases', () => {
      expect(sanitizeState('  ca  ')).toBe('CA');
    });
  });

  // ── sanitizeAddress ──────────────────────────────────────────────────────────
  describe('sanitizeAddress', () => {
    it('converts to title case', () => {
      expect(sanitizeAddress('123 main street')).toBe('123 Main Street');
    });
  });

  // ── sanitizeCity ─────────────────────────────────────────────────────────────
  describe('sanitizeCity', () => {
    it('converts to title case', () => {
      expect(sanitizeCity('san francisco')).toBe('San Francisco');
    });
  });

  // ── sanitizePhoneName ────────────────────────────────────────────────────────
  describe('sanitizePhoneName', () => {
    it('converts to sentence case', () => {
      expect(sanitizePhoneName('MAIN LINE')).toBe('Main line');
    });
    it('handles empty string', () => {
      expect(sanitizePhoneName('')).toBe('');
    });
  });

  // ── sanitizeServiceCategories ────────────────────────────────────────────────
  describe('sanitizeServiceCategories', () => {
    it('splits comma-separated values into array', () => {
      expect(sanitizeServiceCategories('Food, Shelter, Health')).toEqual(['Food', 'Shelter', 'Health']);
    });
    it('returns empty array for empty string', () => {
      expect(sanitizeServiceCategories('')).toEqual([]);
    });
    it('filters empty items', () => {
      expect(sanitizeServiceCategories('Food, , Health')).toEqual(['Food', 'Health']);
    });
  });

  // ── sanitizeServiceEligibilitiesList ─────────────────────────────────────────
  describe('sanitizeServiceEligibilitiesList', () => {
    it('splits comma-separated values into array', () => {
      expect(sanitizeServiceEligibilitiesList('Adults, Seniors')).toEqual(['Adults', 'Seniors']);
    });
    it('returns empty array for empty string', () => {
      expect(sanitizeServiceEligibilitiesList('')).toEqual([]);
    });
  });

  // ── pass-through sanitizers ──────────────────────────────────────────────────
  describe('pass-through sanitizers', () => {
    const cases: [string, Function][] = [
      ['sanitizeAlternateName',          sanitizeAlternateName],
      ['sanitizeWebsite',                sanitizeWebsite],
      ['sanitizeEmail',                  sanitizeEmail],
      ['sanitizeDescription',            sanitizeDescription],
      ['sanitizeInternalNotes',          sanitizeInternalNotes],
      ['sanitizeZip',                    sanitizeZip],
      ['sanitizeOrganizationLegalStatus', sanitizeOrganizationLegalStatus],
      ['sanitizeServiceShortDescription', sanitizeServiceShortDescription],
      ['sanitizeServiceCost',            sanitizeServiceCost],
      ['sanitizeServiceWaitTime',        sanitizeServiceWaitTime],
    ];

    cases.forEach(([name, fn]) => {
      it(`${name} trims and returns string`, () => {
        expect(fn('  hello  ')).toBe('hello');
        expect(fn('')).toBe('');
        expect(fn(null)).toBe('');
      });
    });
  });

});

// #endregion ------------------------------------------------------------------
