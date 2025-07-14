// Email validation using regex
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation - at least 8 chars with uppercase, lowercase, number, special char
export const validatePassword = (password) => {
  if (!password || password.length < 8) return false;
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
};

// User validation - returns object with error messages
export const validateUser = (user) => {
  const errors = {};
  
  // Name validation
  if (!user.name || user.name.trim().length === 0) {
    errors.name = 'Name is required';
  }
  
  // Email validation
  if (!user.email || !validateEmail(user.email)) {
    errors.email = 'Invalid email format';
  }
  
  // Password validation
  if (!user.password || !validatePassword(user.password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number and special character';
  }
  
  return errors;
};