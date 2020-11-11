import crypto from 'crypto';

export function generateHash(data: string | NodeJS.ArrayBufferView): string {
  return crypto.createHash('md5').update(data).digest('hex').slice(0, 5);
}
