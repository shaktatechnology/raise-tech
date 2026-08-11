export interface ServiceDetail {
  id: string;
  scriptHeading: string;
  subtitle: string;
  paragraphs: string[];
  imagePath: string;
  imageAlt: string;
  bgVariant: 'white' | 'light-blue';
  imagePosition: 'left' | 'right';
  cta?: {
    label: string;
    href: string;
  };
}

export const SERVICES_PAGE_DATA: ServiceDetail[] = [
  {
    id: 'web-development',
    scriptHeading: 'Web Development',
    subtitle: 'Web & Cross-Platform App Development Services',
    paragraphs: [
      'At Raise Tech Pvt. Ltd., we specialize in designing and developing high-performance, scalable, and secure web applications, websites, and cross-platform desktop solutions that align with your business goals. Our experienced development team follows robust engineering practices and modern development standards, ensuring clean, well-structured, and maintainable code that supports long-term growth and easy scalability.',
      'We construct responsive and fast loading websites and Progressive Web Applications (PWA) that consistently perform on all devices and in all browsers. Our solutions range from a modern Single Page Application (SPA) to an extensive array of eCommerce platforms and fully-custom built, enterprise-grade applications. Our broad expertise means we can meet your individual needs, and by combining a solid backend architecture with a user-friendly front-end interface, we develop user-centric products that create high levels of user engagement, improve operational efficiency, and produce tangible business results.',
    ],
    imagePath: '/images/services/custom-applications.png',
    imageAlt: 'Custom Web & Cross-Platform Applications Development Diagram',
    bgVariant: 'white',
    imagePosition: 'right',
    cta: {
      label: 'Get Started',
      href: '/contact',
    },
  },
  {
    id: 'mobile-app-development',
    scriptHeading: 'Mobile App Development',
    subtitle: 'Cross-Platform Mobile App Development with React Native',
    paragraphs: [
      'We are experts in developing high-quality, cross-platform mobile apps on both iOS and Android platforms utilizing React Native. Our single-source code base approach means less time and money spent developing your mobile app while also producing similar performance levels and quicker application updates than previously achievable due to using two separate code bases.',
      'Additionally, we ensure your mobile application can be built upon using a framework that allows it to be efficient, scalable, and develop into whatever your company needs as your company grows. With our React Native solutions, you will experience seamless integration of native functionalities via the use of custom native modules, which allow full access to the device functionality (i.e., camera, GPS, sensor data, etc.), with all the associated performance advantages and improved end user experiences.',
    ],
    imagePath: '/images/services/mobile-app-development.png',
    imageAlt: 'Cross-Platform Mobile App Development with React Native Illustration',
    bgVariant: 'light-blue',
    imagePosition: 'left',
    cta: {
      label: 'Learn More',
      href: '/contact',
    },
  },
  {
    id: 'backend-development',
    scriptHeading: 'Backend Development',
    subtitle: 'Custom Backend Development – REST & GraphQL APIs',
    paragraphs: [
      "Whether your project requires a traditional REST API or a modern GraphQL backend, we deliver backend systems that are robust, efficient, and highly optimized. Our team writes clean, secure, and scalable code tailored to your application's exact needs.",
      "We don't believe in one-size-fits-all solutions. Instead, we choose the best technologies and architecture for your use case—ensuring peak performance, maintainability, and seamless integration with your front-end or third-party services.",
    ],
    imagePath: '/images/services/backend-devops.png',
    imageAlt: 'Custom Backend Development, REST & GraphQL APIs and DevOps Illustration',
    bgVariant: 'white',
    imagePosition: 'right',
    cta: {
      label: 'Discuss Architecture',
      href: '/contact',
    },
  },
  {
    id: 'ui-ux-design',
    scriptHeading: 'Design',
    subtitle: 'UI/UX Design That Delivers Stunning, Investor-Ready Experiences',
    paragraphs: [
      "We create apps that look amazing and feel intuitive. Every project we design reflects modern, state-of-the-art UI trends paired with thoughtful, user-centered UX strategies. From wireframes to high-fidelity prototypes, our design process is built to impress—whether you're targeting users, investors, or key stakeholders.",
      "Even in the early stages, our interactive prototypes provide a crystal-clear vision of your product's direction, helping you validate concepts, gather feedback, and secure investor confidence.",
    ],
    imagePath: '/images/services/design-thinking.png',
    imageAlt: 'UI/UX Design Thinking Process Diagram',
    bgVariant: 'light-blue',
    imagePosition: 'left',
    cta: {
      label: 'Explore Design',
      href: '/contact',
    },
  },
  {
    id: 'data-science',
    scriptHeading: 'Data Science',
    subtitle: 'AI & Machine Learning Solutions to Power Smarter Decisions',
    paragraphs: [
      "AI and ML will have a great impact on how businesses work now and how they operate in the future, allowing for faster, smarter and more data-driven business decisions. We, at Raise Tech Pvt. Ltd., have the knowledge and expertise to help you reach the complete potential of all your company's data through our bespoke, intelligent AI and ML solutions designed specifically to support your business objectives and your operational needs.",
      'Our specialty is in developing state-of-the-art Machine Learning models and Data Driven Solutions for various applications including predictive analytics, image/video recognition, Natural Language Processing, Recommendation Engines and Automated Decision Making. Working with our clients allows us to identify their needs, understand their situation and use their available data to create unique AI solutions that result in measurable benefits for them. Looking at both hidden patterns and trends, as well as automating sophisticated workflows and business processes, the AI tools that we create for our Clients can enhance their productivity, lower their overhead and increase their accuracy.',
    ],
    imagePath: '/images/services/data-science-lifecycle.png',
    imageAlt: 'Data Science Lifecycle and AI & Machine Learning Diagram',
    bgVariant: 'white',
    imagePosition: 'right',
    cta: {
      label: 'Build AI Solutions',
      href: '/contact',
    },
  },
];
