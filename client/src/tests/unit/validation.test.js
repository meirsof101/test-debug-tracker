// client/src/__tests__/unit/validation.test.js
import { validateEmail, validatePassword, validateUser } from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    test('returns true for valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    test('returns false for invalid email', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('returns true for valid password', () => {
      expect(validatePassword('Password123!')).toBe(true);
    });

    test('returns false for invalid password', () => {
      expect(validatePassword('weak')).toBe(false);
      expect(validatePassword('password')).toBe(false);
      expect(validatePassword('12345678')).toBe(false);
    });
  });

  describe('validateUser', () => {
    test('returns no errors for valid user', () => {
      const user = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!'
      };

      const errors = validateUser(user);
      expect(errors).toEqual({});
    });

    test('returns errors for invalid user', () => {
      const user = {
        name: '',
        email: 'invalid-email',
        password: 'weak'
      };

      const errors = validateUser(user);
      expect(errors.name).toBe('Name is required');
      expect(errors.email).toBe('Invalid email format');
      expect(errors.password).toBe('Password must be at least 8 characters with uppercase, lowercase, number and special character');
    });
  });
});