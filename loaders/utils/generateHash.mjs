import crypto from 'node:crypto';

export function generateHash(data) {
  return crypto.createHash('md5').update(data).digest('hex').slice(0, 5);
}
