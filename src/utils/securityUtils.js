// src/utils/securityUtils.js

/**
 * Generates a deterministic, unpredictable 6-character hex code based on time windows.
 * @param {string} institutionId - The unique ID of the school
 * @param {string} role - 'teacher' or 'student'
 * @param {number} intervalHours - How often the code should change (e.g., 1 or 24)
 * @returns {string} - A 6-character uppercase hex code (e.g., "A8F9B2")
 */
export const generateDynamicCode = (institutionId, role, intervalHours) => {
  if (!institutionId || !intervalHours) return '------';
  
  // 1. Calculate the current time window
  const now = Date.now();
  const windowMs = intervalHours * 60 * 60 * 1000;
  const currentWindow = Math.floor(now / windowMs);

  // 2. Create the seed string (Adding a hidden salt makes it unguessable)
  const seed = `${institutionId}-${role}-${currentWindow}-DLP_SECRET_SALT_2026`;

  // 3. Simple but effective 32-bit integer hash function
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // 4. Convert to positive Hexadecimal and ensure it's exactly 6 characters
  let hexCode = Math.abs(hash).toString(16).toUpperCase();
  return hexCode.padStart(6, '0').slice(0, 6);
};