// tests/mocks/firebase-functions-v2-https.ts
export class HttpsError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'HttpsError';
    this.code = code;
  }
}
