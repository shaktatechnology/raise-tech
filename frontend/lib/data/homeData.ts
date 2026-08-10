import { ServiceItem, PortfolioItem, TestimonialItem, NavLink } from '../types';

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Service', href: '/services' },
  {
    label: 'Our Product',
    href: '/products',
    dropdown: [
      { label: 'Software', href: '/products/software' },
      { label: 'Paper Roll & Label Sticker', href: '/products/shop' },
    ],
  },
  { label: 'Our Team', href: '/team' },
  { label: 'Contact', href: '/contact' },
];

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'security-services',
    title: 'Security Services',
    description: 'We implement advanced security solutions to protect your systems, data, and digital assets from threats, ensuring compliance, privacy, and uninterrupted operation.',
    iconPath: '/images/home/service-1.png',
    href: '/services#security',
  },
  {
    id: 'financial-planning',
    title: 'Financial Planning',
    description: 'Our financial planning services help businesses manage resources efficiently, optimize costs, and make informed decisions for sustainable growth.',
    iconPath: '/images/home/service-2.png',
    href: '/services#financial',
  },
  {
    id: 'central-resonance',
    title: 'Central Resonance',
    description: 'We provide centralized system integration and resource solutions that improve connectivity, coordination, and operational efficiency across platforms.',
    iconPath: '/images/home/service-3.png',
    href: '/services#system-solutions',
  },
  {
    id: 'charts-statistics',
    title: 'Charts & Statistics',
    description: 'Transform data into meaningful insights with accurate charts, reports, and statistical analysis to support smarter business decisions.',
    iconPath: '/images/home/service-4.png',
    href: '/services#analytics',
  },
  {
    id: 'secure-payments',
    title: 'Secure Payments',
    description: 'We enable safe, reliable, and smooth payment solutions to ensure smooth transactions and build trust with your customers.',
    iconPath: '/images/home/service-5.png',
    href: '/services#payments',
  },
  {
    id: 'server-network',
    title: 'Server & Network',
    description: 'Our server and network services ensure high performance, scalability, and stability with secure infrastructure setup and ongoing management.',
    iconPath: '/images/home/service-6.png',
    href: '/services#infrastructure',
  },
  {
    id: 'sitemaps-wireframes',
    title: 'Site Maps & Wireframes',
    description: 'We design clear site maps and user-friendly wireframes to enable intuitive navigation and enhance the overall user experience.',
    iconPath: '/images/home/service-7.png',
    href: '/services#design',
  },
  {
    id: 'backend-development',
    title: 'Back-End Development',
    description: 'Robust and scalable back-end development to power your applications, ensuring seamless functionality, data management, and system integration.',
    iconPath: '/images/home/service-8.png',
    href: '/services#backend',
  },
];

export const PORTFOLIO_DATA: PortfolioItem[] = [
  {
    id: 'mw-portfolio',
    title: 'MW Branding & Platform',
    category: 'Branding & Platform',
    description: 'Bespoke corporate identity and digital architecture for MW brand.',
    image: '/images/home/portfolio-1.png',
    tags: ['Branding', 'Web App', 'UI/UX'],
    href: '/about#mw',
  },
  {
    id: 'gurkha-portfolio',
    title: 'Gurkha Enterprise Portal',
    category: 'Enterprise Solution',
    description: 'Integrated digital ecosystem and business operations management.',
    image: '/images/home/portfolio-2.png',
    tags: ['Enterprise', 'ERP', 'Security'],
    href: '/about#gurkha',
  },
  {
    id: 'instyle-nepal-portfolio',
    title: 'Instyle Nepal Platform',
    category: 'E-Commerce Platform',
    description: 'Modern retail fashion platform with integrated inventory & payments.',
    image: '/images/home/portfolio-3.png',
    tags: ['E-Commerce', 'Retail', 'Mobile'],
    href: '/about#instyle-nepal',
  },
];

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: 'testimonial-1',
    name: 'Sishir Dhital',
    role: 'CEO at Gurkha',
    company: 'Gurkha Enterprises',
    avatar: '/images/home/avatar-1.png',
    rating: 5,
    quote: 'My experience with raisetech has been nothing short of exceptional. Their unwavering commitment to customer satisfaction, combined with their expertise, innovation, and collaborative approach, make them a standout choice in the IT industry. I would wholeheartedly recommend raisetech to any business seeking top-tier IT solutions and a partner that genuinely cares about their success. They have undoubtedly set a benchmark for excellence in the IT realm.',
  },
];

