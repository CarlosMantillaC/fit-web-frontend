import {
  BarChart3,
  Banknote,
  Bot,
  CalendarDays,
  Clock,
  Eye,
  Gift,
  Gauge,
  Headphones,
  Heart,
  Maximize,
  Rocket,
  ShieldCheck,
  Target,
  TrendingUp,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react'

/* ------------------------------- Home ---------------------------------- */

export interface IconCard {
  icon: LucideIcon
  title: string
  description: string
}

export const problemCards: IconCard[] = [
  {
    icon: Bot,
    title: 'Automatización Integral',
    description:
      'Elimina procesos manuales en reservas, pagos y control de acceso con nuestra plataforma todo-en-uno',
  },
  {
    icon: TrendingUp,
    title: 'Toma de Decisiones Inteligente',
    description: 'Dashboard ejecutivo con métricas clave para una gestión basada en datos reales',
  },
  {
    icon: Maximize,
    title: 'Escalabilidad Garantizada',
    description:
      'Solución adaptable para gimnasios pequeños y medianos sin costos adicionales por crecimiento',
  },
]

export interface ImageFeature {
  image: string
  alt: string
  icon: LucideIcon
  category: string
  title: string
}

export const homeFeatures: ImageFeature[] = [
  {
    image: '/img/classes/dashboard.webp',
    alt: 'Panel de Control',
    icon: Gauge,
    category: 'Dashboard Inteligente',
    title: 'Métricas en Tiempo Real',
  },
  {
    image: '/img/classes/customer-management.webp',
    alt: 'Gestión de Clientes',
    icon: Users,
    category: 'Gestión de Clientes',
    title: 'Perfiles Detallados + Historial Completo',
  },
  {
    image: '/img/classes/calender.webp',
    alt: 'Calendario Interactivo',
    icon: CalendarDays,
    category: 'Calendario Interactivo',
    title: 'Programación + Reservas',
  },
]

export interface Benefit {
  icon: LucideIcon
  title: string
  subtitle: string
}

export const benefits: Benefit[] = [
  { icon: Clock, title: '+ Eficiencia', subtitle: 'Automatización de procesos' },
  { icon: Banknote, title: '- Errores', subtitle: 'Gestión financiera precisa' },
  { icon: TrendingUp, title: '+ Retención', subtitle: 'Clientes satisfechos' },
]

export const businessModel: IconCard[] = [
  {
    icon: Rocket,
    title: 'Plan Único',
    description:
      'Incluye todas las funcionalidades para administradores, sin límite de usuarios o transacciones.',
  },
  {
    icon: Gift,
    title: 'Garantía de Satisfacción',
    description: '30 días de prueba totalmente gratuita.',
  },
  {
    icon: Headphones,
    title: 'Soporte Prioritario',
    description: 'Asistencia técnica 24/7, capacitación inicial y actualizaciones gratuitas.',
  },
]

export interface GalleryImage {
  src: string
  alt: string
  title: string
  wide?: boolean
}

export const galleryImages: GalleryImage[] = [
  {
    src: '/img/gallery/gallery-9.jpg',
    alt: 'Instalaciones modernas',
    title: 'Instalaciones modernas',
    wide: true,
  },
  {
    src: '/img/gallery/gallery-2.jpg',
    alt: 'Tecnología avanzada',
    title: 'Tecnología avanzada',
  },
  {
    src: '/img/gallery/gallery-3.jpg',
    alt: 'Entrenamiento personalizado',
    title: 'Entrenamiento personalizado',
  },
  {
    src: '/img/gallery/gallery-4.jpg',
    alt: 'Comunidad fitness',
    title: 'Comunidad fitness',
  },
  {
    src: '/img/gallery/gallery-5.jpg',
    alt: 'Equipo profesional',
    title: 'Equipo profesional',
  },
  {
    src: '/img/gallery/gallery-6.jpg',
    alt: 'Resultados comprobados',
    title: 'Resultados comprobados',
    wide: true,
  },
]

/* ---------------------------- Funcionalidades --------------------------- */

export interface FeatureCard {
  icon: LucideIcon
  title: string
  items: string[]
}

export const featureCards: FeatureCard[] = [
  {
    icon: Gauge,
    title: 'Panel de Control',
    items: [
      'Métricas en tiempo real',
      'Seguimiento de ingresos',
      'Análisis de tendencias',
      'Acceso rápido',
    ],
  },
  {
    icon: Users,
    title: 'Gestión de Clientes',
    items: [
      'Perfiles detallados',
      'Control de membresías',
      'Registro de asistencia',
      'Renovaciones automáticas',
    ],
  },
  {
    icon: UserCog,
    title: 'Gestión de Empleados',
    items: [
      'Horarios personalizados',
      'Control de disponibilidad',
      'Sistema de check-in',
      'Optimización de recursos',
    ],
  },
  {
    icon: CalendarDays,
    title: 'Programación',
    items: [
      'Calendario interactivo',
      'Reservas en tiempo real',
      'Control de cupos',
      'Notificaciones automáticas',
    ],
  },
  {
    icon: BarChart3,
    title: 'Reportes Avanzados',
    items: [
      'Gráficos interactivos',
      'Comparativas mensuales',
      'Análisis de horas pico',
      'Exportación de datos',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Seguridad Integral',
    items: [
      'Encriptación de datos',
      'Copias de seguridad',
      'Acceso multi-nivel',
      'Protección anti-fraude',
    ],
  },
]

/* ------------------------------ Nosotros -------------------------------- */

export const missionCards: IconCard[] = [
  {
    icon: Target,
    title: 'Misión',
    description:
      'Empoderar a los gimnasios con herramientas tecnológicas que optimicen su gestión y mejoren la experiencia de sus clientes.',
  },
  {
    icon: Eye,
    title: 'Visión',
    description:
      'Ser líderes globales en soluciones SaaS para la industria del fitness y el bienestar.',
  },
  {
    icon: Heart,
    title: 'Valores',
    description:
      'Innovación constante, soporte excepcional y compromiso con el éxito de nuestros clientes.',
  },
]

/* --------------------------- Navegación / footer ------------------------ */

export interface NavLinkItem {
  label: string
  to: string
}

export const navLinks: NavLinkItem[] = [
  { label: 'Inicio', to: '/' },
  { label: 'Funcionalidades', to: '/funcionalidades' },
  { label: 'Nosotros', to: '/sobre-nosotros' },
  { label: 'Contáctanos', to: '/contactanos' },
]

export const contactInfo = {
  address: ['Cl. 10 #0-98 a 0-156', 'Los Caobos'],
  phone: '3215815090',
  email: 'contacto@fitweb.com.co',
}

export const footerUsefulLinks: NavLinkItem[] = [
  { label: 'Acerca de', to: '/sobre-nosotros' },
  { label: 'Blog', to: '#' },
  { label: 'Clases', to: '#' },
  { label: 'Contacto', to: '/contactanos' },
]

export const footerSupportLinks: NavLinkItem[] = [
  { label: 'Iniciar sesión', to: '/login' },
  { label: 'Mi cuenta', to: '/app' },
  { label: 'Suscribirse', to: '#' },
  { label: 'Contacto', to: '/contactanos' },
]
