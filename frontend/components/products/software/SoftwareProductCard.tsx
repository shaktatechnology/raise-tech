import React from 'react';
import Link from 'next/link';
import { SoftwareProduct } from '@/lib/types/product';

interface SoftwareProductCardProps {
  product: SoftwareProduct;
}

export default function SoftwareProductCard({ product }: SoftwareProductCardProps) {
  const getBadgeColor = (badge?: string | null) => {
    switch (badge) {
      case 'Enterprise':
        return 'bg-slate-800 text-white';
      case 'New':
        return 'bg-emerald-600 text-white';
      case 'Best Seller':
        return 'bg-[#01A7E5] text-white';
      default:
        return 'bg-cyan-600 text-white';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100/90 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      <div className="p-6 sm:p-7 flex-1 flex flex-col">
        {/* Top Header & Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#01A7E5] bg-cyan-50 px-2.5 py-1 rounded-md">
            {product.category}
          </span>
          {product.badge && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getBadgeColor(product.badge)}`}>
              {product.badge}
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#01A7E5] transition-colors mb-2">
          {product.name}
        </h3>

        {/* Short Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          {product.description}
        </p>

        {/* Features Bullet List */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Capabilities</h4>
          <ul className="space-y-2">
            {product.features.map((feature, idx) => (
              <li key={idx} className="text-xs sm:text-sm text-gray-700 flex items-start gap-2.5">
                <svg
                  className="w-4 h-4 text-[#01A7E5] shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pricing & CTA Actions Footer */}
      <div className="p-6 sm:p-7 pt-4 bg-slate-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="block text-xs text-gray-500">Pricing Model</span>
          <span className="text-base font-bold text-gray-900">{product.price}</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href={`/contact?subject=Demo%20Request%20for%20${encodeURIComponent(product.name)}`}
            className="w-full sm:w-auto px-4 py-2.5 text-center bg-[#01A7E5] hover:bg-[#018ec3] text-white font-semibold text-sm rounded-xl shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-[#01A7E5]"
          >
            Request Demo
          </Link>
        </div>
      </div>
    </div>
  );
}
