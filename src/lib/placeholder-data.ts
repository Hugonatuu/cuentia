
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
  { href: '/cuentos/crear/aprendizaje', label: '💫 Crear Cuento' },
  { href: '/personajes', label: 'Personajes' },
  { href: '/comunidad', label: 'Cuentos de la comunidad' },
  { href: '/precios', label: 'Precios' },
];

export const pricingPlans = [
  {
    name: 'Pay as you go',
    price: '1€',
    credits: '1.000 créditos',
    features: ['Paga solo por lo que usas', 'Ideal para empezar'],
    isFeatured: false,
    cta: 'Comprar Créditos',
    stripePriceId: 'price_1PWTtPChy4xYm2argB3iH9mC', // Reemplazar con tu priceId de Stripe
    firebaseRole: 'payg',
  },
  {
    name: 'Plan Artista',
    price: '9,99€',
    credits: '12.000 créditos / mes',
    features: [
      'Acceso a todas las funciones',
      'Soporte prioritario',
      'Acceso anticipado a novedades',
      'Exportación en alta calidad'
    ],
    isFeatured: false,
    cta: 'Suscribirse',
    stripePriceId: 'price_1SOLjlArzx82mGRMHeoYsotv', // Reemplazar con tu priceId de Stripe
    firebaseRole: 'artist',
  },
  {
    name: 'Plan Mágico',
    price: '14,99€',
    credits: '19.000 créditos / mes',
    features: [
      'Acceso a todas las funciones',
      'Soporte prioritario',
      'Acceso anticipado a novedades',
      'Exportación en alta calidad'
    ],
    isFeatured: true,
    cta: 'Suscribirse',
    stripePriceId: 'price_1SOPcmArzx82mGRMotEgmX4s',
    firebaseRole: 'magic',
  },
  {
    name: 'Plan Especial',
    price: '23,99€',
    credits: '35.000 créditos / mes',
    features: [
      'Acceso a todas las funciones',
      'Soporte prioritario',
      'Acceso anticipado a novedades',
      'Exportación en alta calidad'
    ],
    isFeatured: false,
    cta: 'Suscribirse',
    stripePriceId: 'price_1SOPhIArzx82mGRMhfWnqmsQ',
    firebaseRole: 'special',
  },
  {
    name: 'Plan King',
    price: '39,99€',
    credits: '55.000 créditos / mes',
    features: [
      'Acceso a todas las funciones',
      'Soporte prioritario',
      'Acceso anticipado a novedades',
      'Exportación en alta calidad'
    ],
    isFeatured: false,
    cta: 'Suscribirse',
    stripePriceId: 'price_1SOPiZArzx82mGRMiKURQm8i',
    firebaseRole: 'king',
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
