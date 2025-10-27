
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
  },
  {
    name: 'Plan Artista',
    price: '9,99€',
    credits: '12.000 créditos / mes',
    features: ['Acceso a todas las funciones', 'Soporte prioritario', 'Personajes ilimitados'],
    isFeatured: false,
    cta: 'Suscribirse',
  },
  {
    name: 'Plan Mágico',
    price: '14,99€',
    credits: '19.000 créditos / mes',
    features: ['Todo en Artista', 'Generación más rápida', 'Acceso a estilos premium'],
    isFeatured: true,
    cta: 'Suscribirse',
  },
  {
    name: 'Plan Especial',
    price: '23,99€',
    credits: '30.000 créditos / mes',
    features: ['Todo en Mágico', 'Colaboración en cuentos', 'Exportación en alta calidad'],
    isFeatured: false,
    cta: 'Suscribirse',
  },
  {
    name: 'Plan King',
    price: '39,99€',
    credits: '55.000 créditos / mes',
    features: ['Todo en Especial', 'Consultoría personalizada', 'Acceso anticipado a novedades'],
    isFeatured: false,
    cta: 'Suscribirse',
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

    
