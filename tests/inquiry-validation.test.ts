import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { isValidPhone, normalizePhone, validateInquiry } from '../src/shared/inquiry.ts';
import { validInquiry } from './helpers/fixtures.ts';

describe('normalizePhone', () => {
  test('converts Arabic-Indic digits and a 00 prefix', () => {
    assert.equal(normalizePhone('٠٠٩٧١ ٥٠ ١٢٣ ٤٥٦٧'), '+971501234567');
  });
  test('converts Persian digits', () => {
    assert.equal(normalizePhone('+۹۷۱۵۰۱۲۳۴۵۶۷'), '+971501234567');
  });
  test('removes separators and invisible direction marks', () => {
    assert.equal(normalizePhone('‎+1 (202) 555-0123'), '+12025550123');
  });
  test('isValidPhone requires a country code', () => {
    assert.equal(isValidPhone('+971 50 123 4567'), true);
    assert.equal(isValidPhone('050 123 4567'), false);
  });
});

describe('validateInquiry', () => {
  test('accepts a complete inquiry', () => {
    const result = validateInquiry(validInquiry());
    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, {});
    assert.equal(result.data.phone, '+12025550123');
  });

  test('accepts empty optional fields', () => {
    assert.equal(validateInquiry({ ...validInquiry(), company: '', email: '', context: '', timeline: '' }).valid, true);
  });

  test('removes duplicate services', () => {
    assert.deepEqual(validateInquiry({ ...validInquiry(), services: ['booking', 'booking'] }).data.services, [
      'booking',
    ]);
  });

  test('defaults the language to Arabic', () => {
    assert.equal(validateInquiry({ ...validInquiry(), language: 'fr' }).data.language, 'ar');
  });

  const invalidCases: [string, Record<string, unknown>, string][] = [
    ['a one-letter name', { fullName: 'A' }, 'fullName'],
    ['a local phone number', { phone: '0501234567' }, 'phone'],
    ['a malformed email', { email: 'wrong-address' }, 'email'],
    ['no services', { services: [] }, 'services'],
    ['an unknown service', { services: ['unknown'] }, 'services'],
    ['a too-short brief', { brief: 'tiny' }, 'brief'],
    ['a too-long brief', { brief: 'a'.repeat(1801) }, 'brief'],
    ['a too-long context', { context: 'a'.repeat(401) }, 'context'],
    ['an unknown timeline', { timeline: 'tomorrow' }, 'timeline'],
    ['a missing submission id', { submissionId: '' }, 'submissionId'],
  ];
  for (const [name, change, field] of invalidCases) {
    test(`rejects ${name}`, () => {
      const result = validateInquiry({ ...validInquiry(), ...change });
      assert.equal(result.valid, false);
      assert.ok(field in result.errors, `expected an error for ${field}`);
    });
  }
});
