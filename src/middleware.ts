
import createIntlMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createIntlMiddleware({
  // A list of all locales that are supported
  locales: routing.locales,
 
  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale: routing.defaultLocale
});
 
export const config = {
  // Skip all paths that should not be internationalized. This example skips
  // certain folders and all pathnames with a dot (e.g. favicon.ico)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
