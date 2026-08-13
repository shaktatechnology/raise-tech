export interface Banner {
  id: number;
  title: string | null;
  image: string | null;
  description: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface HomeService {
  id: number;
  title: string;
  description: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Portfolio {
  id: number;
  title: string;
  image: string | null;
  description: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Testimonial {
  id: number;
  rating: number;
  name: string;
  role: string | null;
  company_name: string | null;
  description: string;
  created_at?: string | null;
  updated_at?: string | null;
}