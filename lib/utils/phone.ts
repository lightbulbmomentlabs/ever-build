/**
 * Phone Number Utility Functions
 *
 * These functions handle phone number formatting and validation
 * for SMS functionality and contact management.
 */

/**
 * Format phone number to E.164 format for Twilio
 * E.164: +[country code][number] (e.g., +11234567890)
 */
export function toE164(phoneNumber: string): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // If it starts with 1 and has 11 digits, it already includes country code
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // If it has 10 digits, add US country code
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // If it already starts with +, return as-is
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }

  // Default: assume US number and add country code
  return `+1${digits}`;
}

/**
 * Format phone number for display
 * Output: (123) 456-7890
 */
export function formatPhoneDisplay(phoneNumber: string): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // Extract last 10 digits (remove country code if present)
  const last10 = digits.slice(-10);

  if (last10.length !== 10) {
    return phoneNumber; // Return original if not valid
  }

  // Format as (XXX) XXX-XXXX
  return `(${last10.slice(0, 3)}) ${last10.slice(3, 6)}-${last10.slice(6)}`;
}

/**
 * Validate US phone number format
 */
export function isValidUSPhone(phoneNumber: string): boolean {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // Check if it's 10 digits (US number) or 11 digits starting with 1 (US with country code)
  return (
    (digits.length === 10) ||
    (digits.length === 11 && digits.startsWith('1'))
  );
}

/**
 * Strip phone number to digits only
 */
export function stripPhone(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, '');
}

/**
 * Check if phone number is a Twilio test number
 * Test numbers: https://www.twilio.com/docs/iam/test-credentials
 */
export function isTwilioTestNumber(phoneNumber: string): boolean {
  const testNumbers = [
    '+15005550006', // Test number that succeeds
    '+15005550001', // Test number that fails (invalid)
    '+15005550007', // Test number that fails (full queue)
  ];

  const e164 = toE164(phoneNumber);
  return testNumbers.includes(e164);
}
