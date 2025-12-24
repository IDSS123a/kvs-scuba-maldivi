/**
 * Browser-compatible PIN hashing using Web Crypto API
 * Replaces bcryptjs which requires Node.js crypto module
 */

/**
 * Hash a PIN using PBKDF2 with SHA-256
 * @param pin - The PIN to hash
 * @returns Base64-encoded hash
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  
  // Import the PIN as a key
  const key = await crypto.subtle.importKey('raw', data, 'PBKDF2', false, ['deriveBits']);
  
  // Derive bits directly (not a key)
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256
  );
  
  const hashArray = new Uint8Array(hashBuffer);
  const saltArray = new Uint8Array(salt);
  
  // Combine salt + hash for storage
  const combined = new Uint8Array(saltArray.length + hashArray.length);
  combined.set(saltArray, 0);
  combined.set(hashArray, saltArray.length);
  
  return btoa(String.fromCharCode.apply(null, Array.from(combined)));
}

/**
 * Verify a PIN against a stored hash
 * @param pin - The PIN to verify
 * @param storedHash - The stored hash from the database
 * @returns true if PIN matches, false otherwise
 */
export async function comparePin(pin: string, storedHash: string): Promise<boolean> {
  try {
    // Decode the stored hash
    const combined = Uint8Array.from(atob(storedHash), c => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const storedHashBytes = combined.slice(16);
    
    // Hash the input PIN with the same salt
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    
    // Import the PIN as a key
    const key = await crypto.subtle.importKey('raw', data, 'PBKDF2', false, ['deriveBits']);
    
    // Derive bits directly (not a key)
    const inputHashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      key,
      256
    );
    
    const inputHashBytes = new Uint8Array(inputHashBuffer);
    
    // Compare hashes
    return arraysEqual(storedHashBytes, inputHashBytes);
  } catch (error) {
    console.error('PIN comparison error:', error);
    return false;
  }
}

/**
 * Constant-time array comparison to prevent timing attacks
 */
function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}
