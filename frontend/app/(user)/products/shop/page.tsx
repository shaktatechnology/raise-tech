import React from 'react';
import type { Metadata } from 'next';
import ShopHero from '@/components/products/shop/ShopHero';
import ShopCatalog from '@/components/products/shop/ShopCatalog';

export const metadata: Metadata = {
  title: 'Paper Roll & Label Sticker Shop | Raise Tech Pvt. Ltd.',
  description:
    'Buy thermal paper rolls, POS receipt rolls, dot matrix continuous paper, and self-adhesive barcode label stickers online from Raise Tech Pvt. Ltd.',
};

export default function ShopPage() {
  return (
    <article className="w-full bg-[#f2fcff] min-h-screen">
      {/* Shop Hero Banner */}
      <ShopHero />

      {/* Interactive Shop Catalog */}
      <ShopCatalog />
    </article>
  );
}
