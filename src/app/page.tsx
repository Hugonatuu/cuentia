import {redirect} from 'next/navigation';
import {routing} from '@/i18n/routing';

// This page only renders when the app is built statically (output: 'export')
// or when the middleware is not applied to the root.
// The middleware should handle the redirection for all dynamic requests.
export default function RootPage() {
  redirect(routing.defaultLocale);
}
