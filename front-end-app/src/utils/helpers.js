/**
 * Utility functions for the health-share application
 */

/**
 * Capitalizes the first letter of a string
 * @param {string} string - The string to capitalize
 * @returns {string} The string with first letter capitalized
 */
export const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Formats a date to YYYY-MM-DD string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string or empty string if invalid
 */
export const formatDate = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) return '';
  
  try {
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}; 