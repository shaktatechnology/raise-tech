export interface ExpertiseItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
}

export interface WhatWeDoItem {
  id: string;
  title: string;
  description: string;
  iconName?: string;
}

export interface WhyChooseUsItem {
  id: string;
  title: string;
  description: string;
  highlighted?: boolean;
  ctaText: string;
  ctaHref: string;
}

export const EXPERTISE_ITEMS: ExpertiseItem[] = [
  {
    id: 'modern-tech',
    title: 'Modern Technologies',
  },
  {
    id: 'scalable-secure',
    title: 'Scalable & Secure Systems',
  },
  {
    id: 'user-centric',
    title: 'User-Centric Design',
  },
  {
    id: 'cross-platform',
    title: 'Cross-Platform Solutions',
  },
];

export const WHAT_WE_DO_ITEMS: WhatWeDoItem[] = [
  {
    id: 'trackingmandu',
    title: 'Trackingmandu',
    description: 'A powerful GPS vehicle tracking & fleet management system offering real-time monitoring, route optimization, & performance insights.',
  },
  {
    id: 'ecalculo',
    title: 'eCalculo',
    description: 'An all-in-one Accounting and Inventory Management software for streamlined financial control and accurate reporting.',
  },
  {
    id: 'crm',
    title: 'Custom CRM Software',
    description: 'Fully customized customer relationship management solutions aligned with specific business workflows.',
  },
  {
    id: 'web-dev',
    title: 'Website Development',
    description: 'Modern, responsive, and user-friendly websites to enhance digital presence.',
  },
];

export const WHY_CHOOSE_US_ITEMS: WhyChooseUsItem[] = [
  {
    id: 'customer-centric',
    title: 'Customer-Centric Approach',
    description: 'We prioritize your business goals and deliver tailored solutions that create real value and lasting partnerships.',
    highlighted: true,
    ctaText: 'Join Now',
    ctaHref: '/contact',
  },
  {
    id: 'affordable-scalable',
    title: 'Affordable & Scalable Solutions',
    description: 'Our cost-effective software is built to scale, helping your business grow without compromising quality or performance.',
    highlighted: false,
    ctaText: 'Join Now',
    ctaHref: '/contact',
  },
  {
    id: 'fast-dev',
    title: 'Fast Development with Quality UI/UX',
    description: 'We combine agile development with clean code and intuitive UI/UX design to deliver high-quality digital products on time.',
    highlighted: false,
    ctaText: 'Join Now',
    ctaHref: '/contact',
  },
  {
    id: 'support-maint',
    title: 'Dedicated Support & Maintenance',
    description: 'From launch to long-term growth, we provide reliable support, regular updates, & proactive maintenance to keep your systems running smoothly.',
    highlighted: false,
    ctaText: 'Join Now',
    ctaHref: '/contact',
  },
];

export const ABOUT_PAGE_COPY = {
  heroTitle: 'About Raise Tech',
  heroSubtitle: 'Empowering Businesses with Next-Gen Technology',
  companyTitle: 'Raise Tech Pvt. Ltd.',
  companySubtitle: 'Innovative Software Company in Nepal',
  companyDescParagraph1: 'Based in Kathmandu, Nepal, Raise Tech Pvt. Ltd. is a vibrant and progressive software development firm committed to providing dependable and creative IT solutions. Since our founding in 2019, we have established a solid reputation for offering top-notch desktop, web, and mobile software solutions that are customised to satisfy the particular requirements of companies in a variety of sectors.',
  companyDescParagraph2: 'At Raise Tech, we think technology should improve efficiency, streamline procedures, and produce genuine business value. Our team of talented experts designs and develops scalable, secure, and user-friendly solutions by fusing technical know-how with innovative problem-solving techniques. We concentrate on producing outcomes that support our clients in remaining competitive in a quickly changing digital landscape, from custom software development to end-to-end digital transformation.',
  expertiseHeading: 'Our Expertise',
  expertiseSubtitle: 'Powered by knowledge & precision.',
  whatWeDoHeading: 'What We Do?',
  whatWeDoSubtitle: 'We offer a comprehensive range of software products and services designed to meet the evolving needs of modern businesses. Our flagship solutions include:',
  whyChooseUsHeading: 'Why Choose Raise Tech?',
  whyChooseUsSubtitle: 'At Raise Tech, "We are Young!" is our mindset. We create innovative digital solutions with creativity, passion, and expertise.',
  visionMissionHeading: 'Our Vision & Mission',
  visionMissionBody: 'Our vision is to become a leading force in Nepal’s software industry by providing smart, sustainable solutions that drive digital transformation. Our mission is to utilize our domain expertise and technical excellence to deliver high-quality, cost-effective, and innovative IT solutions that create real value for our clients.',
};
