
import placeholderImages from './placeholder-images.json';
import { subMonths } from 'date-fns';

const getImage = (id: string) => {
    const image = placeholderImages.placeholderImages.find(img => img.id === id);
    if (!image) {
        // Fallback image
        return {
            id: 'fallback',
            description: 'Placeholder image',
            imageUrl: 'https://picsum.photos/seed/fallback/400/400',
            imageHint: 'image'
        };
    }
    return image;
};

// This is now the single source of truth for navigation.
export const mainNavLinks = [
  { href: '/cuentos/crear/aprendizaje', label: 'Crear Cuento' },
  { href: '/personajes', label: 'Personajes' },
  { href: '/comunidad', label: 'Cuentos de la comunidad' },
  { href: '/precios', label: 'Precios' },
];

export const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR',
  'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL',
  'PT', 'RO', 'SE', 'SI', 'SK'
];

export const pricingPlans = [
  {
    id: 'artista',
    firebaseRole: 'artist',
    prices: {
      eur: { price: '6,99€', stripePriceId: 'price_1SP1TBArzx82mGRMjNgh561W' },
      usd: { price: '$6.99', stripePriceId: 'price_1SP1TBArzx82mGRMjNgh561W' }
    }
  },
  {
    id: 'magic',
    firebaseRole: 'magic',
    prices: {
      eur: { price: '11,99€', stripePriceId: 'price_1SYXltArzx82mGRMgXmSTejz' },
      usd: { price: '$11.99', stripePriceId: 'price_1SYXltArzx82mGRMgXmSTejz' }
    }
  },
  {
    id: 'special',
    firebaseRole: 'special',
    prices: {
      eur: { price: '14,99€', stripePriceId: 'price_1SP1UuArzx82mGRMlMWtlyP6' },
      usd: { price: '$14.99', stripePriceId: 'price_1SP1UuArzx82mGRMlMWtlyP6' }
    }
  },
  {
    id: 'king',
    firebaseRole: 'king',
    prices: {
      eur: { price: '23,99€', stripePriceId: 'price_1SP1VOArzx82mGRMBZARNcXz' },
      usd: { price: '$23.99', stripePriceId: 'price_1SP1VOArzx82mGRMBZARNcXz' }
    }
  },
];


export const exampleStories = [
  { id: '6', title: 'Los tres amigos', image: getImage('story-cover-6'), pdfUrl: '/cuentos/cuento-lostresamigos.pdf' },
];

export const userProfile = {
  name: 'Ana García',
  email: 'ana.garcia@email.com',
  avatar: getImage('user-avatar'),
  subscription: 'Plan Mágico',
  billingStartDate: subMonths(new Date(), 2),
  subscriptionCredits: {
    current: 8500,
    total: 19000,
  },
  payAsYouGoCredits: {
    current: 1200,
  },
  stories: exampleStories.slice(0, 3),
};

export const characterSubNav = [
  { href: '/personajes/predefinidos', label: 'Personajes Predefinidos' },
  { href: '/personajes/mis-personajes', label: 'Mis Personajes' },
  { href: '/personajes/crear-avatar', label: 'Crear Avatar' },
]
