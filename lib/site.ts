export const SITE_URL = 'https://app.nagotosha.com';
export const SITE_NAME = 'なごとしゃ';
export const OFFICIAL_INSTAGRAM_URL = 'https://www.instagram.com/nagotosya/';
export const CONTACT_EMAIL = 'hello@nagotosha.com';

export function siteUrl(path = '/') {
  return new URL(path, SITE_URL).toString();
}
