// tests/mocks/firebase-functions-v2-https.js
export class HttpsError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'HttpsError';
    this.code = code;
  }
}
