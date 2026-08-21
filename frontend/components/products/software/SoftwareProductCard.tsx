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
        return 'bg-slate-800 text-white shadow-xs';
      case 'New':
        return 'bg-emerald-600 text-white shadow-xs animate-pulse-glow';
      case 'Best Seller':
        return 'bg-[#01A7E5] text-white shadow-xs animate-pulse-glow';
      default:
        return 'bg-cyan-600 text-white shadow-xs';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100/90 hover:border-[#01A7E5]/30 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden group">
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
        <div
          className="text-sm text-gray-600 leading-relaxed mb-6 text-justify [&_p]:m-0 [&_p]:inline"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />

        {/* Features Bullet List */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Capabilities</h4>
          <ul className="space-y-2">
            {product.features.map((feature, idx) => (
              <li key={idx} className="text-xs sm:text-sm text-gray-700 flex items-start gap-2.5">
                <svg
                  className="w-4 h-4 text-[#01A7E5] shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110"
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
            className="w-full sm:w-auto px-5 py-2.5 inline-flex items-center justify-center gap-1.5 text-center bg-[#01A7E5] hover:bg-[#018ec3] text-white font-semibold text-sm rounded-xl shadow-xs hover:shadow-md transition-all duration-300 group/btn"
          >
            <span>Request Demo</span>
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

