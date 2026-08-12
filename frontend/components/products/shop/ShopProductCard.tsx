"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShopProduct } from '@/lib/types/product';
import { useCart } from '@/context/CartContext';

interface ShopProductCardProps {
  product: ShopProduct;
}

export default function ShopProductCard({ product }: ShopProductCardProps) {
  const { addItem } = useCart();
  const [addedToast, setAddedToast] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inStock) return;

    addItem({
      id: product.id,
      productSlug: product.slug,
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: 1,
      size: product.packSizes[0],
      image: product.image,
      inStock: product.inStock,
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 1600);
  };

  const discountPercent = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-xs hover:shadow-md border border-gray-100/90 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Product Image Container */}
      <div className="relative w-full h-48 bg-slate-50 overflow-hidden flex items-center justify-center p-4">
        <Link href={`/products/shop/${product.slug}`} className="relative w-full h-full block">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Discount Badge */}
        {discountPercent && discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
            {discountPercent}% OFF
          </span>
        )}

        {/* Stock Status Badge */}
        <span
          className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
            product.inStock
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>

      {/* Product Details Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            {product.category}
          </span>

          <Link href={`/products/shop/${product.slug}`}>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-[#01A7E5] transition-colors leading-snug line-clamp-2 mb-2">
              {product.name}
            </h3>
          </Link>

          {/* Star Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-3.5 h-3.5 fill-current ${
                    star <= Math.round(product.rating) ? 'text-amber-400' : 'text-gray-300'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 font-medium ml-1">
              {product.rating} ({product.reviews})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-lg font-extrabold text-[#01A7E5]">
              NPR {product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                NPR {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              addedToast
                ? 'bg-emerald-600 text-white'
                : !product.inStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#01A7E5] hover:bg-[#018bc0] text-white shadow-xs'
            }`}
          >
            {addedToast ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span>Added to Cart!</span>
              </>
            ) : !product.inStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <Link
            href={`/products/shop/${product.slug}`}
            className="w-full py-2 rounded-xl text-xs font-semibold text-gray-700 hover:text-[#01A7E5] bg-gray-50 hover:bg-cyan-50 transition-colors flex items-center justify-center"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
