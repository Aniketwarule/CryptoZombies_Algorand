import CryptoJS from 'crypto-js';

// Encryption/Decryption utilities
export class CryptoUtils {
  private static readonly DEFAULT_KEY_SIZE = 256;
  private static readonly DEFAULT_IV_SIZE = 128;
  private static readonly DEFAULT_SALT_SIZE = 256;
  private static readonly DEFAULT_ITERATIONS = 1000;

  // Generate a random key
  static generateKey(size: number = this.DEFAULT_KEY_SIZE): string {
    return CryptoJS.lib.WordArray.random(size / 8).toString();
  }

  // Generate a random IV
  static generateIV(size: number = this.DEFAULT_IV_SIZE): string {
    return CryptoJS.lib.WordArray.random(size / 8).toString();
  }

  // Generate a random salt
  static generateSalt(size: number = this.DEFAULT_SALT_SIZE): string {
    return CryptoJS.lib.WordArray.random(size / 8).toString();
  }

  // Derive key from password using PBKDF2
  static deriveKey(password: string, salt: string, iterations: number = this.DEFAULT_ITERATIONS): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: this.DEFAULT_KEY_SIZE / 32,
      iterations,
    }).toString();
  }

  // Encrypt data using AES
  static encrypt(data: string, password: string): { encrypted: string; salt: string; iv: string } {
    const salt = this.generateSalt();
    const key = this.deriveKey(password, salt);
    const iv = this.generateIV();
    
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();

    return { encrypted, salt, iv };
  }

  // Decrypt data using AES
  static decrypt(encryptedData: string, password: string, salt: string, iv: string): string {
    try {
      const key = this.deriveKey(password, salt);
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('Failed to decrypt data. Invalid password or corrupted data.');
    }
  }

  // Hash data using SHA256
  static hash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  // Create HMAC signature
  static createHMAC(data: string, secret: string): string {
    return CryptoJS.HmacSHA256(data, secret).toString();
  }

  // Verify HMAC signature
  static verifyHMAC(data: string, signature: string, secret: string): boolean {
    const expectedSignature = this.createHMAC(data, secret);
    return expectedSignature === signature;
  }

  // Generate a secure random string
  static generateRandomString(length: number = 32): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomValues = new Uint8Array(length);
    
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(randomValues);
    } else {
      // Fallback for non-browser environments
      for (let i = 0; i < length; i++) {
        randomValues[i] = Math.floor(Math.random() * 256);
      }
    }
    
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
    
    return result;
  }

  // Base64 encoding/decoding
  static base64Encode(data: string): string {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data));
  }

  static base64Decode(encodedData: string): string {
    return CryptoJS.enc.Base64.parse(encodedData).toString(CryptoJS.enc.Utf8);
  }

  // URL-safe Base64 encoding/decoding
  static base64UrlEncode(data: string): string {
    return this.base64Encode(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  static base64UrlDecode(encodedData: string): string {
    let data = encodedData.replace(/-/g, '+').replace(/_/g, '/');
    while (data.length % 4) {
      data += '=';
    }
    return this.base64Decode(data);
  }
}

// Secure storage utilities
export class SecureStorage {
  private static readonly STORAGE_PREFIX = 'algozombies_secure_';

  // Store encrypted data
  static setItem(key: string, value: any, password: string): void {
    try {
      const serializedValue = JSON.stringify(value);
      const { encrypted, salt, iv } = CryptoUtils.encrypt(serializedValue, password);
      
      const secureData = {
        encrypted,
        salt,
        iv,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(secureData));
    } catch (error) {
      throw new Error('Failed to store secure data');
    }
  }

  // Retrieve and decrypt data
  static getItem<T>(key: string, password: string): T | null {
    try {
      const storedData = localStorage.getItem(this.STORAGE_PREFIX + key);
      if (!storedData) return null;

      const secureData = JSON.parse(storedData);
      const decrypted = CryptoUtils.decrypt(
        secureData.encrypted,
        password,
        secureData.salt,
        secureData.iv
      );
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to retrieve secure data:', error);
      return null;
    }
  }

  // Remove secure data
  static removeItem(key: string): void {
    localStorage.removeItem(this.STORAGE_PREFIX + key);
  }

  // Clear all secure data
  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  // Check if secure data exists
  static hasItem(key: string): boolean {
    return localStorage.getItem(this.STORAGE_PREFIX + key) !== null;
  }
}

// Algorand-specific crypto utilities
export class AlgorandCrypto {
  // Validate Algorand address checksum
  static validateAddress(address: string): boolean {
    if (!address || address.length !== 58) return false;
    
    try {
      // This is a simplified validation - in real app, use algosdk
      const addressRegex = /^[A-Z2-7]+$/;
      return addressRegex.test(address);
    } catch {
      return false;
    }
  }

  // Generate a mnemonic phrase (simplified - use algosdk in real app)
  static generateMnemonic(): string[] {
    const wordList = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
      // ... more words would be here in a real implementation
    ];
    
    const mnemonic: string[] = [];
    for (let i = 0; i < 25; i++) {
      const randomIndex = Math.floor(Math.random() * wordList.length);
      mnemonic.push(wordList[randomIndex]);
    }
    
    return mnemonic;
  }

  // Simple transaction hash generation (use algosdk in real app)
  static generateTransactionHash(txData: any): string {
    const serialized = JSON.stringify(txData);
    return CryptoUtils.hash(serialized);
  }

  // Sign data (simplified - use algosdk in real app)
  static signData(data: string, privateKey: string): string {
    return CryptoJS.HmacSHA256(data, privateKey).toString();
  }

  // Verify signature (simplified - use algosdk in real app)
  static verifySignature(data: string, signature: string, publicKey: string): boolean {
    const expectedSignature = CryptoJS.HmacSHA256(data, publicKey).toString();
    return expectedSignature === signature;
  }
}

// Password strength validation
export class PasswordSecurity {
  static readonly MIN_LENGTH = 8;
  static readonly RECOMMENDED_LENGTH = 12;

  static checkStrength(password: string): {
    score: number;
    strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
    suggestions: string[];
  } {
    let score = 0;
    const suggestions: string[] = [];

    // Length check
    if (password.length >= this.MIN_LENGTH) {
      score += 1;
    } else {
      suggestions.push(`Use at least ${this.MIN_LENGTH} characters`);
    }

    if (password.length >= this.RECOMMENDED_LENGTH) {
      score += 1;
    } else {
      suggestions.push(`Use ${this.RECOMMENDED_LENGTH} or more characters for better security`);
    }

    // Character variety checks
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Include lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Include uppercase letters');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Include numbers');
    }

    if (/[^a-zA-Z0-9]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Include special characters');
    }

    // Bonus points for length
    if (password.length >= 16) score += 1;
    if (password.length >= 20) score += 1;

    // Determine strength
    let strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
    if (score <= 2) strength = 'very-weak';
    else if (score <= 3) strength = 'weak';
    else if (score <= 4) strength = 'fair';
    else if (score <= 6) strength = 'good';
    else strength = 'strong';

    return { score, strength, suggestions };
  }

  static generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';

    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

// Rate limiting utility
export class RateLimiter {
  private static requests: Map<string, number[]> = new Map();

  static isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, [now]);
      return true;
    }

    const timestamps = this.requests.get(key)!;
    
    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
    
    if (validTimestamps.length < maxRequests) {
      validTimestamps.push(now);
      this.requests.set(key, validTimestamps);
      return true;
    }

    this.requests.set(key, validTimestamps);
    return false;
  }

  static getRemainingRequests(key: string, maxRequests: number, windowMs: number): number {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      return maxRequests;
    }

    const timestamps = this.requests.get(key)!;
    const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, maxRequests - validTimestamps.length);
  }

  static getResetTime(key: string, windowMs: number): number {
    if (!this.requests.has(key)) {
      return 0;
    }

    const timestamps = this.requests.get(key)!;
    const oldestTimestamp = Math.min(...timestamps);
    
    return oldestTimestamp + windowMs;
  }
}