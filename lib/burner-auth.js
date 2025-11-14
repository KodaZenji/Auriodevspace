// lib/burner-auth.js
import { ethers } from 'ethers';

export class BurnerWalletAuth {
  constructor() {
    const privateKey = process.env.BURNER_WALLET_PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error('BURNER_WALLET_PRIVATE_KEY not set in environment');
    }

    this.wallet = new ethers.Wallet(privateKey);
    this.authToken = process.env.SPAACE_AUTH_TOKEN || null;
    this.tokenExpiry = 0;
    
    // Parse existing token expiry if available
    if (this.authToken) {
      try {
        const payload = JSON.parse(Buffer.from(this.authToken.split('.')[1], 'base64').toString());
        this.tokenExpiry = payload.exp * 1000; // Convert to milliseconds
        console.log('🔥 Burner wallet initialized:', this.wallet.address);
        console.log('⏰ Token expires at:', new Date(this.tokenExpiry).toLocaleString());
      } catch (e) {
        console.warn('⚠️ Could not parse token expiry, will refresh on next request');
      }
    } else {
      console.log('🔥 Burner wallet initialized:', this.wallet.address);
      console.log('⚠️ No auth token found - will attempt to authenticate');
    }
  }

  async signMessage(message) {
    return await this.wallet.signMessage(message);
  }

  // Check if token is expired or about to expire (within 5 minutes)
  isTokenExpired() {
    if (!this.authToken) return true;
    const now = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    return now >= (this.tokenExpiry - bufferTime);
  }

  // Authenticate with Spaace.io using wallet signature
  async authenticate() {
    console.log('🔐 Attempting to authenticate with Spaace.io...');

    try {
      // Step 1: Request authentication challenge/nonce
      const challengeResponse = await fetch('https://internal-api-v2.spaace.io/auth/web3/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://spaace.io',
          'Referer': 'https://spaace.io/'
        },
        body: JSON.stringify({
          address: this.wallet.address.toLowerCase()
        })
      });

      if (!challengeResponse.ok) {
        const errorText = await challengeResponse.text();
        console.error('Challenge request failed:', errorText);
        throw new Error(`Failed to get auth challenge: ${challengeResponse.status}`);
      }

      const challengeData = await challengeResponse.json();
      const message = challengeData.message || challengeData.challenge || challengeData.nonce;

      if (!message) {
        console.error('No challenge message received:', challengeData);
        throw new Error('No challenge message in response');
      }

      console.log('📝 Got challenge, signing with burner wallet...');

      // Step 2: Sign the challenge message
      const signature = await this.signMessage(message);

      // Step 3: Submit signature to get auth token
      const authResponse = await fetch('https://internal-api-v2.spaace.io/auth/web3/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://spaace.io',
          'Referer': 'https://spaace.io/'
        },
        body: JSON.stringify({
          address: this.wallet.address.toLowerCase(),
          signature: signature,
          message: message
        })
      });

      if (!authResponse.ok) {
        const errorText = await authResponse.text();
        console.error('Verification failed:', errorText);
        throw new Error(`Authentication verification failed: ${authResponse.status}`);
      }

      const authData = await authResponse.json();
      const token = authData.token || authData.accessToken || authData.jwt;

      if (!token) {
        console.error('No token in auth response:', authData);
        throw new Error('No token received from authentication');
      }

      // Parse token expiry
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        this.tokenExpiry = payload.exp * 1000;
      } catch (e) {
        // Default to 24 hours if can't parse
        this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);
      }

      this.authToken = token;
      
      console.log('✅ Authentication successful!');
      console.log('🎟️  New token expires at:', new Date(this.tokenExpiry).toLocaleString());
      console.log('💡 Add this to .env.local to skip auth next time:');
      console.log(`SPAACE_AUTH_TOKEN=${token}`);

      return token;

    } catch (error) {
      console.error('❌ Authentication error:', error.message);
      
      // If auto-auth fails, fall back to manual token
      if (process.env.SPAACE_AUTH_TOKEN) {
        console.log('⚠️ Falling back to manual token from .env.local');
        this.authToken = process.env.SPAACE_AUTH_TOKEN;
        return this.authToken;
      }
      
      throw error;
    }
  }

  // Get authenticated headers, refresh token if needed
  async getAuthHeaders() {
    // Check if token needs refresh
    if (this.isTokenExpired()) {
      console.log('🔄 Token expired or missing, refreshing...');
      try {
        await this.authenticate();
      } catch (error) {
        console.error('Failed to refresh token:', error);
        // Continue with existing token (if any)
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      'Origin': 'https://spaace.io',
      'Referer': 'https://spaace.io/',
      'X-Wallet-Address': this.wallet.address
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    if (process.env.SPAACE_COOKIE) {
      headers['Cookie'] = process.env.SPAACE_COOKIE;
    }

    return headers;
  }

  getAddress() {
    return this.wallet.address;
  }

  // Get token info for debugging
  getTokenInfo() {
    if (!this.authToken) {
      return { exists: false };
    }

    try {
      const payload = JSON.parse(Buffer.from(this.authToken.split('.')[1], 'base64').toString());
      return {
        exists: true,
        expiresAt: new Date(payload.exp * 1000),
        isExpired: this.isTokenExpired(),
        subject: payload.sub,
        issuedAt: new Date(payload.iat * 1000)
      };
    } catch (e) {
      return { exists: true, error: 'Could not parse token' };
    }
  }
}

let burnerAuth = null;

export function getBurnerAuth() {
  if (!burnerAuth) {
    burnerAuth = new BurnerWalletAuth();
  }
  return burnerAuth;
}