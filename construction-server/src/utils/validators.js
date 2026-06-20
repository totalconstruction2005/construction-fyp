const mongoose = require("mongoose");

/**
 * Validation utility functions for backend
 */

const validators = {
  /**
   * Validate required fields
   */
  validateRequired: (data, fields) => {
    const missing = [];
    fields.forEach((field) => {
      if (!data[field] || (typeof data[field] === "string" && !data[field].trim())) {
        missing.push(field);
      }
    });
    return missing;
  },

  /**
   * Validate email format
   */
  validateEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * Validate phone format (basic)
   */
  validatePhone: (phone) => {
    const regex = /^[\d\s+\-()]+$/;
    return phone.length >= 7 && regex.test(phone);
  },

  /**
   * Validate MongoDB ObjectId
   */
  validateObjectId: (id) => {
    return mongoose.Types.ObjectId.isValid(id);
  },

  /**
   * Validate numeric value
   */
  validateNumber: (value, { min = null, max = null } = {}) => {
    const num = Number(value);
    if (isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
  },

  /**
   * Validate enum value
   */
  validateEnum: (value, allowedValues) => {
    return allowedValues.includes(value);
  },

  /**
   * Sanitize string input
   */
  sanitizeString: (str) => {
    if (typeof str !== "string") return "";
    return str.trim().substring(0, 1000); // Limit to 1000 chars
  },

  /**
   * Validate URL format
   */
  validateUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};

module.exports = validators;
