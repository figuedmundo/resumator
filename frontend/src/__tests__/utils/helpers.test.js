import { validateEmail, validatePassword } from '../../utils/helpers';
import { VALIDATION_MESSAGES } from '../../utils/constants';
import { describe, it, expect } from 'vitest';

describe('validation helpers', () => {
  describe('validateEmail', () => {
    it('returns required message for empty email', () => {
      expect(validateEmail('')).toBe(VALIDATION_MESSAGES.REQUIRED_FIELD);
    });

    it('returns invalid message for invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(VALIDATION_MESSAGES.INVALID_EMAIL);
    });

    it('returns null for valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('returns required message for empty password', () => {
      expect(validatePassword('')).toBe(VALIDATION_MESSAGES.REQUIRED_FIELD);
    });

    it('returns weak message for weak password', () => {
      expect(validatePassword('short')).toBe(VALIDATION_MESSAGES.WEAK_PASSWORD);
    });

    it('returns null for valid password', () => {
      expect(validatePassword('Password123')).toBeNull();
    });
  });
});
