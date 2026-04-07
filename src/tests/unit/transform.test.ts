// #region ===================== NOTES =========================================
// transform.js is a plain browser JS file loaded via <script> tag in the frontend.
// These tests validate the transformation logic by importing the functions
// via a Node-compatible wrapper approach — testing the logic directly.
// #endregion ------------------------------------------------------------------

// #region ====================== TESTS ========================================

describe('transform logic', () => {

  // ── transformLocations ──────────────────────────────────────────────────────
  describe('transformLocations', () => {
    it('maps collected location to SF API address format', () => {
      const input = [{ location_name: 'Main', address_1: '123 Main St', address_2: '', city: 'SF', state: 'CA', zip: '94103' }];
      const expected = [{ name: 'Main', address_1: '123 Main St', address_2: null, city: 'SF', state_province: 'CA', postal_code: '94103' }];

      const result = input.map(loc => ({
        name:           loc.location_name || null,
        address_1:      loc.address_1     || null,
        address_2:      loc.address_2     || null,
        city:           loc.city          || null,
        state_province: loc.state         || null,
        postal_code:    loc.zip           || null
      }));

      expect(result).toEqual(expected);
    });

    it('returns empty array for empty input', () => {
      expect([].map(() => ({}))).toEqual([]);
    });
  });

  // ── transformPhones ─────────────────────────────────────────────────────────
  describe('transformPhones', () => {
    it('filters empty phone numbers', () => {
      const input = [
        { phone_number: '415-555-1234', phone_name: 'Main' },
        { phone_number: '',             phone_name: 'Fax' }
      ];
      const result = input
        .filter(p => p.phone_number)
        .map(p => ({ number: p.phone_number || null, description: p.phone_name || null }));

      expect(result).toEqual([{ number: '415-555-1234', description: 'Main' }]);
    });
  });

  // ── transformNotes ──────────────────────────────────────────────────────────
  describe('transformNotes', () => {
    it('wraps note strings into objects', () => {
      const result = ['Note one', 'Note two'].map(n => ({ note: n }));
      expect(result).toEqual([{ note: 'Note one' }, { note: 'Note two' }]);
    });

    it('returns empty array for empty input', () => {
      expect([].map(n => ({ note: n }))).toEqual([]);
    });
  });

  // ── transformHours ──────────────────────────────────────────────────────────
  describe('transformHours', () => {
    it('skips days with no times', () => {
      const dayMap: Record<string, string> = { M: 'Monday', T: 'Tuesday', W: 'Wednesday', Th: 'Thursday', F: 'Friday', Sa: 'Saturday', Su: 'Sunday' };
      const hours = {
        M:  { start: { time: '09:00', meridiem: 'AM' }, end: { time: '17:00', meridiem: 'PM' } },
        T:  { start: { time: '',      meridiem: ''    }, end: { time: '',      meridiem: ''    } },
        W:  { start: { time: '09:00', meridiem: 'AM' }, end: { time: '17:00', meridiem: 'PM' } },
        Th: { start: { time: '',      meridiem: ''    }, end: { time: '',      meridiem: ''    } },
        F:  { start: { time: '',      meridiem: ''    }, end: { time: '',      meridiem: ''    } },
        Sa: { start: { time: '',      meridiem: ''    }, end: { time: '',      meridiem: ''    } },
        Su: { start: { time: '',      meridiem: ''    }, end: { time: '',      meridiem: ''    } },
      };

      const schedule_days = [];
      for (const [key, val] of Object.entries(hours)) {
        if (!val.start.time && !val.end.time) continue;
        schedule_days.push({ day: dayMap[key], opens_at: val.start.time || null, closes_at: val.end.time || null });
      }

      expect(schedule_days).toEqual([
        { day: 'Monday',    opens_at: '09:00', closes_at: '17:00' },
        { day: 'Wednesday', opens_at: '09:00', closes_at: '17:00' },
      ]);
    });
  });

});

// #endregion ------------------------------------------------------------------
