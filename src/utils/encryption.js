// Simple encryption utility for localStorage
// Note: This is for basic obfuscation. For production, consider more robust encryption.

const ENCRYPTION_KEY = 'ramdev-dairy-2025-key'; // You should use environment variable in production

// Simple XOR encryption
const encrypt = (text) => {
    try {
        const data = JSON.stringify(text);
        let encrypted = '';

        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
            encrypted += String.fromCharCode(charCode);
        }

        // Convert to base64 for safe storage
        return btoa(encrypted);
    } catch (error) {
        console.error('Encryption failed:', error);
        return null;
    }
};

const decrypt = (encryptedData) => {
    try {
        if (!encryptedData) return null;

        // Decode from base64
        const encrypted = atob(encryptedData);
        let decrypted = '';

        for (let i = 0; i < encrypted.length; i++) {
            const charCode = encrypted.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
            decrypted += String.fromCharCode(charCode);
        }

        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
};

// Secure localStorage wrapper
export const secureStorage = {
    setItem: (key, value) => {
        try {
            const encrypted = encrypt(value);
            if (encrypted) {
                localStorage.setItem(key, encrypted);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Secure storage set failed:', error);
            return false;
        }
    },

    getItem: (key) => {
        try {
            const encrypted = localStorage.getItem(key);
            return decrypt(encrypted);
        } catch (error) {
            console.error('Secure storage get failed:', error);
            return null;
        }
    },

    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Secure storage remove failed:', error);
            return false;
        }
    },

    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Secure storage clear failed:', error);
            return false;
        }
    }
};

export { encrypt, decrypt };
