import crypto from 'node:crypto';

interface SignatureOptions {
  method: string;
  clientSecret: string;
  url: string;
  requestBody: string;
}

interface SignatureV2Options extends SignatureOptions {
  signatureVersion: 'v2';
}

interface SignatureV3Options extends SignatureOptions {
  signatureVersion: 'v3';
  timestamp: number;
}

export const getSignature = (options: SignatureV2Options | SignatureV3Options) => {
  const { method, clientSecret, url, requestBody, signatureVersion } = options;

  if (signatureVersion === 'v2') {
    const sourceString = clientSecret + method + url + requestBody;
    return crypto.createHash('sha256').update(sourceString).digest('hex');
  }

  if (signatureVersion === 'v3') {
    const sourceString = method + url + requestBody + options.timestamp;
    return crypto.createHmac('sha256', clientSecret).update(sourceString).digest('base64');
  }

  throw new TypeError('Unsupported signature version');
};
