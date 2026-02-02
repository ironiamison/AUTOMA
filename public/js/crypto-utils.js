// Cryptographic utilities for agents
// Note: In production, this should use proper TEE integration

class AgentCrypto {
  constructor() {
    this.keyPair = null;
  }

  // Generate keypair (in production, this should be done in a TEE)
  async generateKeyPair() {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        // Browser Web Crypto API
        window.crypto.subtle.generateKey(
          {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256'
          },
          true,
          ['encrypt', 'decrypt']
        ).then(keyPair => {
          this.keyPair = keyPair;
          resolve(keyPair);
        }).catch(reject);
      } else {
        // Fallback for Node.js or environments without Web Crypto
        reject(new Error('Cryptographic operations require a secure environment'));
      }
    });
  }

  // Export public key
  async exportPublicKey() {
    if (!this.keyPair) {
      throw new Error('Keypair not generated');
    }

    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const exported = await window.crypto.subtle.exportKey('spki', this.keyPair.publicKey);
      return btoa(String.fromCharCode(...new Uint8Array(exported)));
    }
    return null;
  }

  // Sign data
  async sign(data) {
    if (!this.keyPair) {
      throw new Error('Keypair not generated');
    }

    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(JSON.stringify(data));
      
      const signature = await window.crypto.subtle.sign(
        {
          name: 'RSA-PSS',
          saltLength: 32
        },
        this.keyPair.privateKey,
        dataBuffer
      );

      return btoa(String.fromCharCode(...new Uint8Array(signature)));
    }
    return null;
  }

  // Verify signature (public key verification)
  async verify(publicKeyPem, data, signature) {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        // Import public key
        const publicKeyBuffer = Uint8Array.from(atob(publicKeyPem), c => c.charCodeAt(0));
        const publicKey = await window.crypto.subtle.importKey(
          'spki',
          publicKeyBuffer,
          {
            name: 'RSA-PSS',
            hash: 'SHA-256'
          },
          false,
          ['verify']
        );

        // Verify signature
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        const signatureBuffer = Uint8Array.from(atob(signature), c => c.charCodeAt(0));

        return await window.crypto.subtle.verify(
          {
            name: 'RSA-PSS',
            saltLength: 32
          },
          publicKey,
          signatureBuffer,
          dataBuffer
        );
      } catch (error) {
        console.error('Verification error:', error);
        return false;
      }
    }
    return false;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AgentCrypto;
}

