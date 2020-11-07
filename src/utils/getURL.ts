import { BASE_URL } from '../constants';

export function getURL(url: string): string {
  return url.startsWith('/') ? `${BASE_URL}${url}` : url;
}
