import {NextRequest, NextResponse} from 'next/server';
import {routing} from './i18n/routing';

const {locales, defaultLocale} = routing;

const countryToLocaleMap: {[key: string]: string} = {
  // Portuguese
  PT: 'pt',
  BR: 'pt',
  // Spanish & LatAm
  ES: 'es',
  AR: 'es',
  BO: 'es',
  CL: 'es',
  CO: 'es',
  CR: 'es',
  CU: 'es',
  DO: 'es',
  EC: 'es',
  SV: 'es',
  GT: 'es',
  HN: 'es',
  MX: 'es',
  NI: 'es',
  PA: 'es',
  PY: 'es',
  PE: 'es',
  PR: 'es',
  UY: 'es',
  VE: 'es',
  // German
  DE: 'de',
  // French
  FR: 'fr',
  // Italian
  IT: 'it',
};

function getLocale(request: NextRequest): string {
  const country = request.geo?.country?.toUpperCase();
  if (country && countryToLocaleMap[country]) {
    return countryToLocaleMap[country];
  }
  return defaultLocale; // English
}

export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect if there is no locale
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip all paths that should not be internationalized. This example skips
  // certain folders and all pathnames with a dot (e.g. favicon.ico)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
