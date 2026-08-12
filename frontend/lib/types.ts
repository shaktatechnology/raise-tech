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

export interface ContactInquiry {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  contact_no: string;
  message: string | null;
  is_read: number;
  created_at: string | null;
  updated_at: string | null;
}

