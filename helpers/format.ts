/**
 * Format number as Vietnamese currency with thousand separators
 * @param value - String containing numeric value
 * @returns Formatted string with thousand separators (e.g., "1.000.000")
 */
export const formatCurrency = (value: string): string => {
  const numericValue = value.replace(/[^0-9]/g, "");
  if (!numericValue) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(numericValue));
};

/**
 * Parse formatted currency string to numeric string
 * @param value - Formatted string (e.g., "1.000.000")
 * @returns Numeric string (e.g., "1000000")
 */
export const parseCurrency = (value: string): string => {
  return value.replace(/[^0-9]/g, "");
};
