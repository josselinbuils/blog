const { HTTP_PREFIX } = process.env;

export const BASE_URL =
  HTTP_PREFIX && HTTP_PREFIX.length > 1 ? HTTP_PREFIX : '';
