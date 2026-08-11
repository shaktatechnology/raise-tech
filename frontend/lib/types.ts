export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconPath: string;
  href?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  tags?: string[];
  href?: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  quote: string;
}

export interface NavLink {
  label: string;
  href: string;
  dropdown?: NavLink[];
}
