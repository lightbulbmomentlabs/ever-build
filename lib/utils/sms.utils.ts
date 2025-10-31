/**
 * SMS Utilities (Client-Safe)
 *
 * Utility functions for SMS that can be used in both client and server components.
 * Does not import any Node.js-specific libraries like Twilio.
 */

/**
 * Message templates for common scenarios
 */
export const SMS_TEMPLATES = {
  PHASE_CONFIRMATION: (
    contactName: string,
    phaseName: string,
    address: string,
    date: string
  ) =>
    `Hi ${contactName}, just confirming you're scheduled for ${phaseName} at ${address} on ${date}. Let me know if you have any questions.`,

  PHASE_DELAY: (phaseName: string, address: string, newDate: string) =>
    `Quick update: ${phaseName} at ${address} has been pushed back to ${newDate}. I'll keep you posted on any other changes.`,

  READY_TO_START: (contactName: string, phaseName: string, address: string) =>
    `Hi ${contactName}, we're ready for ${phaseName} at ${address}. Can you confirm when you'll be able to start?`,

  CUSTOM: '',
};

/**
 * Calculate SMS message segment count
 * Standard SMS is 160 characters, extended is 153 characters per segment
 */
export function calculateSMSSegments(message: string): {
  length: number;
  segments: number;
} {
  const length = message.length;

  if (length === 0) {
    return { length: 0, segments: 0 };
  }

  // Check if message contains extended characters (non-GSM-7)
  const extendedCharRegex = /[^\x00-\x7F]/;
  const hasExtendedChars = extendedCharRegex.test(message);

  if (hasExtendedChars) {
    // UCS-2 encoding: 70 chars for single, 67 for multiple segments
    const segments = length <= 70 ? 1 : Math.ceil(length / 67);
    return { length, segments };
  } else {
    // GSM-7 encoding: 160 chars for single, 153 for multiple segments
    const segments = length <= 160 ? 1 : Math.ceil(length / 153);
    return { length, segments };
  }
}
