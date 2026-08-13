import React from 'react';
import type { Metadata } from 'next';
import CartItemList from '@/components/cart/CartItemList';

export const metadata: Metadata = {
  title: 'Shopping Cart | Raise Tech Pvt. Ltd.',
  description:
    'Review your selected paper rolls, thermal POS rolls, and barcode label stickers before proceeding to checkout at Raise Tech Pvt. Ltd.',
};

export default function CartPage() {
  return (
    <article className="w-full bg-[#f2fcff] min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-8">
          Shopping Cart
        </h1>

        {/* Cart Item Table & Order Summary */}
        <CartItemList />
      </div>
    </article>
  );
}
