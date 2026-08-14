"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { CheckoutFormData } from '@/lib/types/product';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Order } from '@/lib/types';

type Errors = Partial<Record<keyof CheckoutFormData, string>>;

interface CheckoutOrderAddress {
  name: string;
  address: string;
  city: string;
  province: string;
  phone_number: string;
}

type CheckoutOrder = Omit<Order, 'shipping_address' | 'city'> & {
  shipping_address: CheckoutOrderAddress;
};

export default function CheckoutForm() {
  const { items, subtotal, totalItems, clearCart, isLoading: isCartLoading } = useCart();
  const { toast } = useToast();

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    city: 'Kathmandu',
    address: '',
    deliveryMethod: 'standard',
    paymentMethod: 'cod',
    notes: '',
    acceptTerms: true,
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<CheckoutOrder | null>(null);

  const deliveryFee = formData.deliveryMethod === 'express' ? 250 : 100;
  const grandTotal = subtotal + deliveryFee;

  const validate = (): boolean => {
    const errs: Errors = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email Address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) errs.phone = 'Phone Number is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.address.trim()) errs.address = 'Delivery Address is required';
    if (!formData.acceptTerms) errs.acceptTerms = 'You must accept the terms & conditions';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name as keyof CheckoutFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        delivery_type: 'standard',
        payment_method: 'cash_on_delivery',
        notes: formData.notes?.trim() || null,
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
        shipping_address: {
          name: formData.fullName,
          address: formData.address,
          city: formData.city,
          province: formData.city,
          phone_number: formData.phone,
        },
        billing_same_as_shipping: true,
      };

      const res = await fetchApi<{ message: string; data: CheckoutOrder }>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const orderData = res.data;
      const successMsg = res.message || 'Order placed successfully! We will contact you shortly.';

      setPlacedOrder(orderData);
      toast.success(successMsg);
      try {
        await clearCart();
      } catch (clearError) {
        console.error('Order placed, but the cart could not be cleared:', clearError);
        toast.error('Your order was placed, but the cart could not be refreshed.');
      }
    } catch (err: unknown) {
      console.error('Failed to place order:', err);
      toast.error(
        err instanceof Error ? err.message : 'Failed to place order. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Confirmation Success Screen
  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-md border border-gray-100 text-center my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          ✓
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h2>
        <p className="text-sm text-gray-600 mb-4">
          Thank you for your order with Raise Tech Pvt. Ltd.
        </p>

        <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left space-y-2 border border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order ID</span>
            <span className="font-bold text-[#01A7E5]">#{placedOrder.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Customer Name</span>
            <span className="font-semibold text-gray-800">{placedOrder.customer_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Delivery Address</span>
            <span className="font-semibold text-gray-800">
              {placedOrder.shipping_address.address}, {placedOrder.shipping_address.city}
            </span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-gray-200 font-bold">
            <span className="text-gray-900">Total Amount</span>
            <span className="text-[#01A7E5]">NPR {Number(placedOrder.total || 0).toLocaleString()}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
          Our logistics team will contact you at <strong className="text-gray-800">{placedOrder.customer_phone}</strong> or <strong className="text-gray-800">{placedOrder.customer_email}</strong> to verify dispatch details.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/my-orders"
            className="px-8 py-3 bg-[#01A7E5] hover:bg-[#018bc0] text-white font-bold rounded-xl shadow-xs transition-colors text-sm"
          >
            View My Orders
          </Link>
          <Link
            href="/products/shop"
            className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (isCartLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 max-w-xl mx-auto my-12">
        <div className="w-8 h-8 border-2 border-[#01A7E5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-600">Loading your cart for checkout...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 max-w-xl mx-auto my-12">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-gray-500 mb-6">
          Add products to your cart before proceeding to checkout.
        </p>
        <Link
          href="/products/shop"
          className="px-8 py-3 bg-[#01A7E5] text-white font-bold rounded-xl hover:bg-[#018bc0] transition-colors text-sm"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Contact & Delivery Form */}
      <div className="flex-1 w-full space-y-6">
        {/* Contact Information */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            1. Contact &amp; Shipping Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Ramesh Shrestha"
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#01A7E5] ${
                  errors.fullName ? 'border-rose-500' : 'border-gray-200'
                }`}
              />
              {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ramesh@example.com"
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#01A7E5] ${
                  errors.email ? 'border-rose-500' : 'border-gray-200'
                }`}
              />
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+977 98XXXXXXXX"
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#01A7E5] ${
                  errors.phone ? 'border-rose-500' : 'border-gray-200'
                }`}
              />
              {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                City / Region *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Kathmandu, Lalitpur, Pokhara..."
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#01A7E5] ${
                  errors.city ? 'border-rose-500' : 'border-gray-200'
                }`}
              />
              {errors.city && <p className="text-xs text-rose-500 mt-1">{errors.city}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Delivery Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street name, landmark, ward number..."
                className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#01A7E5] ${
                  errors.address ? 'border-rose-500' : 'border-gray-200'
                }`}
              />
              {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Delivery Notes (Optional)
              </label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Instructions for delivery driver..."
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#01A7E5]"
              />
            </div>
          </div>
        </div>

        {/* Delivery Method */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            2. Delivery Method
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-colors ${
                formData.deliveryMethod === 'standard'
                  ? 'border-[#01A7E5] bg-cyan-50/60'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="deliveryMethod"
                value="standard"
                checked={formData.deliveryMethod === 'standard'}
                onChange={handleChange}
                className="mt-1 text-[#01A7E5] focus:ring-[#01A7E5]"
              />
              <div>
                <span className="block font-bold text-sm text-gray-900">Standard Delivery</span>
                <span className="block text-xs text-gray-500 mt-0.5">3-5 Business Days</span>
                <span className="block text-xs font-bold text-[#01A7E5] mt-2">NPR 100</span>
              </div>
            </label>

            <label
              className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-colors ${
                formData.deliveryMethod === 'express'
                  ? 'border-[#01A7E5] bg-cyan-50/60'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="deliveryMethod"
                value="express"
                checked={formData.deliveryMethod === 'express'}
                onChange={handleChange}
                className="mt-1 text-[#01A7E5] focus:ring-[#01A7E5]"
              />
              <div>
                <span className="block font-bold text-sm text-gray-900">Express Priority</span>
                <span className="block text-xs text-gray-500 mt-0.5">1-2 Business Days</span>
                <span className="block text-xs font-bold text-[#01A7E5] mt-2">NPR 250</span>
              </div>
            </label>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-100 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            3. Payment Method
          </h2>
          <div className="space-y-3">
            {[
              { id: 'cod', title: 'Cash on Delivery (COD)', desc: 'Pay cash upon physical delivery of your order' },
              { id: 'esewa', title: 'eSewa Digital Wallet', desc: 'Pay securely via eSewa online portal upon confirmation' },
              { id: 'bank', title: 'Direct Bank Transfer', desc: 'Transfer directly to Raise Tech Pvt. Ltd. Nabil Bank account' },
            ].map((method) => (
              <label
                key={method.id}
                className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-colors block ${
                  formData.paymentMethod === method.id
                    ? 'border-[#01A7E5] bg-cyan-50/60'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={formData.paymentMethod === method.id}
                  onChange={handleChange}
                  className="mt-1 text-[#01A7E5] focus:ring-[#01A7E5]"
                />
                <div>
                  <span className="block font-bold text-sm text-gray-900">{method.title}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">{method.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Checkout Summary Column */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 sticky top-24 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            Order Items ({totalItems})
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex justify-between items-start text-xs gap-2">
                <div>
                  <span className="font-semibold text-gray-800 block line-clamp-1">{item.name}</span>
                  <span className="text-gray-400">Qty: {item.quantity} {item.size && `(${item.size})`}</span>
                </div>
                <span className="font-bold text-gray-900 shrink-0">
                  NPR {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-3 border-t border-gray-100 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">NPR {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className="font-semibold text-gray-900">NPR {deliveryFee.toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-900">Grand Total</span>
              <span className="text-xl font-extrabold text-[#01A7E5]">
                NPR {grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#01A7E5] hover:bg-[#018bc0] text-white font-bold rounded-xl shadow-md transition-colors text-center text-base cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Placing Order...</span>
              </>
            ) : (
              <span>Place Order Now →</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
