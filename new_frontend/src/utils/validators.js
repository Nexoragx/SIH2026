/**
 * Input Validators
 */

export const validators = {
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    // Standard RFC-compliant email regex
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.trim());
  },

  isValidPassword(password) {
    return Boolean(password && typeof password === 'string' && password.length >= 6);
  },

  isNonEmptyString(str) {
    return Boolean(str && typeof str === 'string' && str.trim().length > 0);
  },

  validateRegistrationForm({ email, password, fullName }) {
    const errors = {};
    if (!this.isNonEmptyString(fullName)) {
      errors.fullName = 'Full Name is required.';
    }
    if (!this.isValidEmail(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!this.isValidPassword(password)) {
      errors.password = 'Password must be at least 6 characters.';
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  validateLoginForm({ email, password }) {
    const errors = {};
    if (!this.isValidEmail(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    }
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};
