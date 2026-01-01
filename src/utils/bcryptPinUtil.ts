
import { hashPin as pbkdf2HashPin, comparePin } from './pinCrypto';

/**
 * Hash a PIN using PBKDF2 (Browser-compatible)
 * @param pin - The plain-text PIN (6 digits)
 * @returns Promise<string> - The hashed PIN
 */
export async function hashPin(pin: string): Promise<string> {
    try {
        return await pbkdf2HashPin(pin);
    } catch (error) {
        console.error('❌ Error hashing PIN:', error);
        throw error;
    }
}

/**
 * Verify a PIN against its hash
 * @param pin - The plain-text PIN to verify
 * @param hash - The stored PBKDF2 hash
 * @returns Promise<boolean> - True if PIN matches hash
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
    try {
        if (!pin || !hash) {
            console.warn('⚠️ PIN or hash is missing');
            return false;
        }

        // Check if it's a bcrypt hash (starts with $2)
        if (hash.startsWith('$2')) {
            console.warn('⚠️ bcrypt hash detected. Needs migration. Use password bypass if needed.');
            return false;
        }

        return await comparePin(pin.trim(), hash);
    } catch (error) {
        console.error('❌ Error verifying PIN:', error);
        return false;
    }
}

/**
 * Generate a hash for a PIN and return both PIN and hash
 * @param pin - The plain-text PIN (or random if not provided)
 * @returns Promise<{pin: string, hash: string}>
 */
export async function generatePinWithHash(pin?: string): Promise<{ pin: string; hash: string }> {
    try {
        const generatedPin = pin || Math.floor(100000 + Math.random() * 900000).toString();
        const hash = await hashPin(generatedPin);

        console.log(`✅ PIN generated and hashed: ${generatedPin}`);

        return {
            pin: generatedPin,
            hash
        };
    } catch (error) {
        console.error('❌ Error generating PIN hash:', error);
        throw error;
    }
}
