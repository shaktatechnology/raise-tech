"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SHOP_PRODUCTS_DATA } from '@/lib/data/shopProductsData';
import { useCart } from '@/context/CartContext';
import ShopProductCard from '@/components/products/shop/ShopProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const product = SHOP_PRODUCTS_DATA.find((p) => p.slug === slug);
  const { addItem } = useCart();

  const [selectedSize, setSelectedSize] = useState<string>(
    product?.packSizes?.[0] || 'Standard'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Product Not Found</h1>
        <p className="text-gray-600 mb-8">The requested paper roll or label sticker product does not exist.</p>
        <Link
          href="/products/shop"
          className="px-6 py-3 bg-[#01A7E5] text-white font-bold rounded-xl hover:bg-[#018bc0]"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const galleryList = product.galleryImages && product.galleryImages.length > 0
    ? product.galleryImages
    : [product.image];

  const handleAddToCart = () => {
    if (!product.inStock) return;

    addItem({
      id: product.id,
      productSlug: product.slug,
      name: product.name,
      category: product.category,
      price: product.price,
      quantity,
      size: selectedSize,
      image: product.image,
      inStock: product.inStock,
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 1800);
  };

  const relatedProducts = SHOP_PRODUCTS_DATA.filter(
    (p) => p.category === product.category && p.slug !== product.slug
  ).slice(0, 4);

  const discountPercent = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <article className="w-full bg-[#f2fcff] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#01A7E5]">Home</Link>
          <span>›</span>
          <Link href="/products" className="hover:text-[#01A7E5]">Products</Link>
          <span>›</span>
          <Link href="/products/shop" className="hover:text-[#01A7E5]">Shop</Link>
          <span>›</span>
          <span className="text-[#01A7E5] font-semibold">{product.category}</span>
          <span>›</span>
          <span className="text-gray-900 font-bold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Details Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
            {/* Gallery Column */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative w-full h-80 sm:h-96 bg-slate-50 rounded-2xl overflow-hidden border border-gray-100">
                <Image
                  src={galleryList[selectedImageIndex] || product.image}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover object-center"
                />
                {discountPercent && discountPercent > 0 && (
                  <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xs">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {galleryList.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {galleryList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImageIndex === idx
                          ? 'border-[#01A7E5] ring-2 ring-cyan-100'
                          : 'border-gray-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information Column */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#01A7E5] bg-cyan-50 px-3 py-1 rounded-md">
                    {product.category}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">SKU: {product.sku}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3">
                  {product.name}
                </h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 fill-current ${
                          star <= Math.round(product.rating) ? 'text-amber-400' : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-gray-600">
                    {product.rating} ({product.reviews} customer reviews)
                  </span>
                </div>

                {/* Pricing Block */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-extrabold text-[#01A7E5]">
                    NPR {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-base text-gray-400 line-through">
                      NPR {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Short Description */}
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {product.detailedDescription}
                </p>

                {/* Pack Size Selector */}
                {product.packSizes && product.packSizes.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Select Package / Quantity Variant:
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {product.packSizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            selectedSize === sz
                              ? 'bg-[#01A7E5] border-[#01A7E5] text-white shadow-xs'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Adjustment & Stock Status */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-200 font-bold transition-colors cursor-pointer text-base"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-200 font-bold transition-colors cursor-pointer text-base"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                      product.inStock
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {product.inStock ? '✓ In Stock & Ready to Ship' : '✗ Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                    addedToast
                      ? 'bg-emerald-600 text-white'
                      : !product.inStock
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#01A7E5] hover:bg-[#018bc0] text-white'
                  }`}
                >
                  {addedToast ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Added to Cart!</span>
                    </>
                  ) : !product.inStock ? (
                    <span>Unavailable Out of Stock</span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                      </svg>
                      <span>Add to Cart ({quantity})</span>
                    </>
                  )}
                </button>

                <Link
                  href="/cart"
                  className="px-6 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-sm text-center transition-colors"
                >
                  View Cart
                </Link>
              </div>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <tbody>
                  {product.specifications.map((spec, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}
                    >
                      <td className="py-3 px-4 font-semibold text-gray-700 w-1/3 border-b border-gray-100">
                        {spec.label}
                      </td>
                      <td className="py-3 px-4 text-gray-900 border-b border-gray-100">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Related Supplies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ShopProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
