import { ServiceItem, PortfolioItem, TestimonialItem, NavLink } from '../types';

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
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
    description: 'Protecting your digital assets with advanced end-to-end security measures, auditing, and real-time monitoring.',
    iconPath: '/images/home/service-1.png',
    href: '/services#security',
  },
  {
    id: 'financial-planning',
    title: 'Financial Planning',
    description: 'Smart financial tools, budgeting solutions, and automated calculation engines tailored for enterprise growth.',
    iconPath: '/images/home/service-2.png',
    href: '/services#financial',
  },
  {
    id: 'central-resource',
    title: 'Central Resource/System Solutions',
    description: 'Centralized resource management software to streamline operations, data flow, and organizational workflow.',
    iconPath: '/images/home/service-3.png',
    href: '/services#system-solutions',
  },
  {
    id: 'charts-statistics',
    title: 'Charts & Statistics',
    description: 'Interactive analytics dashboards with customizable reporting and visual data trends to drive key business decisions.',
    iconPath: '/images/home/service-4.png',
    href: '/services#analytics',
  },
  {
    id: 'secure-payments',
    title: 'Secure Payments',
    description: 'Seamless e-commerce payment integrations with multi-gateway support, tokenization, and PCI-compliant security.',
    iconPath: '/images/home/service-5.png',
    href: '/services#payments',
  },
  {
    id: 'server-network',
    title: 'Server & Network',
    description: 'High-performance cloud architecture, server maintenance, network optimization, and high-availability solutions.',
    iconPath: '/images/home/service-6.png',
    href: '/services#infrastructure',
  },
  {
    id: 'sitemaps-wireframes',
    title: 'Site Maps & Wireframes',
    description: 'Human-centered UI/UX design, wireframing, interactive prototyping, and site architecture planning.',
    iconPath: '/images/home/service-7.png',
    href: '/services#design',
  },
  {
    id: 'backend-development',
    title: 'Back-End Development',
    description: 'Robust API endpoints, microservice micro-architectures, database design, and cloud backend integrations.',
    iconPath: '/images/home/service-8.png',
    href: '/services#backend',
  },
];

export const PORTFOLIO_DATA: PortfolioItem[] = [
  {
    id: 'trackingmandu',
    title: 'Trackingmandu Fleet Management',
    category: 'SaaS Platform',
    description: 'Real-time GPS tracking and fleet management solution with automated route optimization, telemetry analytics, and mobile driver apps.',
    image: '/images/home/portfolio-1.png',
    tags: ['GPS Tracking', 'Fleet Mgmt', 'IoT', 'Mobile App'],
    href: '/about#trackingmandu',
  },
  {
    id: 'ecalculo',
    title: 'eCalculo Accounting System',
    category: 'Enterprise Software',
    description: 'Integrated cloud financial accounting and tax compliance system empowering small & medium businesses with automated reporting.',
    image: '/images/home/portfolio-2.png',
    tags: ['FinTech', 'Accounting', 'Tax Compliance', 'Cloud'],
    href: '/about#ecalculo',
  },
  {
    id: 'custom-crm',
    title: 'Enterprise Custom CRM',
    category: 'Custom Software',
    description: 'Tailored Customer Relationship Management portal enabling sales teams to track leads, manage support tickets, and analyze revenue pipelines.',
    image: '/images/home/portfolio-3.png',
    tags: ['CRM', 'Sales Pipeline', 'Automation', 'Analytics'],
    href: '/about#crm',
  },
];

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: 'testimonial-1',
    name: 'Standard Chartered Bank',
    role: 'Enterprise Partner',
    company: 'Financial Institution',
    avatar: '/images/home/avatar-1.png',
    rating: 5,
    quote: 'Raise Tech provided exceptional software engineering and system architecture support. Their dedication to security standards and scalability transformed our core operational workflows.',
  },
  {
    id: 'testimonial-2',
    name: 'Sanima Bank',
    role: 'Banking Technology Division',
    company: 'Banking Sector',
    avatar: '/images/home/avatar-2.png',
    rating: 5,
    quote: 'The team delivered our project ahead of schedule with zero compromise on quality. Their backend API integrations and custom UI work are top-notch.',
  },
  {
    id: 'testimonial-3',
    name: 'TechCorp International',
    role: 'Chief Technology Officer',
    company: 'Global Retailer',
    avatar: '/images/home/avatar-3.png',
    rating: 5,
    quote: 'Working with Raise Tech has been a game-changer. From wireframing to deployment, their technical depth and customer service stand out in the industry.',
  },
  {
    id: 'testimonial-4',
    name: 'Logistics Nepal',
    role: 'Operations Director',
    company: 'Supply Chain',
    avatar: '/images/home/avatar-4.png',
    rating: 5,
    quote: 'Trackingmandu and custom system solutions built by Raise Tech have increased our fleet efficiency by over 35%. Highly recommended partner!',
  },
];
