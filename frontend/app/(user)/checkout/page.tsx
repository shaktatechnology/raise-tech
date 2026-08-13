import React from 'react';
import type { Metadata } from 'next';
import CheckoutForm from '@/components/checkout/CheckoutForm';

export const metadata: Metadata = {
  title: 'Checkout | Raise Tech Pvt. Ltd.',
  description:
    'Complete your paper roll and label sticker order with Raise Tech Pvt. Ltd. Fast delivery across Kathmandu Valley.',
};

export default function CheckoutPage() {
  return (
    <article className="w-full bg-[#f2fcff] min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-8">
          Checkout
        </h1>

        {/* Form and Order Submission */}
        <CheckoutForm />
      </div>
    </article>
  );
}
