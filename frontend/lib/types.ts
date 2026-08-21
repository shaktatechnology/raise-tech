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

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_title: string;
  product_sku: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderAddress {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  phone_number: string;
}

export interface Order {
  id: number;
  user_id: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: OrderAddress | null;
  billing_address: OrderAddress | null;
  payment_method: string;
  delivery_type: 'standard' | 'express';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping_charge: number;
  total: number;
  notes: string | null;
  created_at: string;
  items?: OrderItem[];
}

export interface ProductGallery {
  id: number;
  product_id: number;
  image: string;
  thumbnail?: string;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  original_price: number;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | null;
  stock_quantity: number;
  featured_image: string;
  is_active: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  galleries?: ProductGallery[];
  created_at?: string;
}

export interface AdminService {
  id: number;
  title: string;
  slogan: string | null;
  description: string;
  image: string | null;
  order: number;
  is_active: boolean;
}

export interface TeamMember {
  id: number;
  name: string;
  position: string;
  image: string | null;
  description: string;
  is_active: boolean;
}

export interface SoftwareItem {
  id: number;
  title: string;
  slogan: string | null;
  description: string | null;
  image: string | null;
  is_active: boolean;
}

export interface SiteSettings {
  short_description?: string;
  logo?: string | null;
  favicon?: string | null;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  tiktok_url?: string;
  whatsapp_url?: string;
  phone1?: string;
  phone2?: string;
  email1?: string;
  email2?: string;
  location?: string;
  map_url?: string;
  is_cod_enabled?: boolean;
  is_standard_delivery_enabled?: boolean;
  is_express_delivery_enabled?: boolean;
  standard_delivery_charge?: number | string | null;
  express_delivery_charge?: number | string | null;
}
