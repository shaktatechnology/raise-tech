export interface SoftwareProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: string;
  description: string;
  detailedDescription?: string;
  features: string[];
  image: string;
  badge?: 'Best Seller' | 'Enterprise' | 'New' | 'Popular' | null;
  isAvailable: boolean;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ShopProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  sku: string;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviews: number;
  description: string;
  detailedDescription: string;
  packSizes: string[];
  minimumOrderQuantity: number;
  deliveryEstimate: string;
  image: string;
  galleryImages?: string[];
  specifications: ProductSpecification[];
  tags: string[];
}

export interface CartItem {
  /** Cart row ID for authenticated carts; product ID for guest carts. */
  id: string;
  /** Stable product ID used when adding, merging, and checking out. */
  productId: number;
  productSlug: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  size?: string;
  image: string;
  inStock: boolean;
}

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  deliveryMethod: 'standard' | 'express';
  paymentMethod: 'cod' | 'esewa' | 'bank';
  notes?: string;
  acceptTerms: boolean;
}

export interface MockOrder {
  orderId: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  customerInfo: CheckoutFormData;
}
