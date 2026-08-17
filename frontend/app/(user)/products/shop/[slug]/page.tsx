"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Product } from "@/lib/types";
import { fetchApi, getImageUrl as resolveImageUrl } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

interface ProductReview {
  id?: string | number;
  customer_name?: string;
  user_name?: string;
  name?: string;
  created_at?: string;
  rating?: number;
  comment?: string;
  review?: string;
  body?: string;
}

type ProductWithReviews = Product & {
  reviews?: ProductReview[] | { data?: ProductReview[] };
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { addItem, isLoading: isCartLoading, isUpdating: isCartUpdating } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewName, setReviewName] = useState<string>("");
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetchApi<{ status: string; data: ProductWithReviews }>(
          `/products/${slug}`
        );
        if (res && res.data) {
          setProduct(res.data);
          const rawReviews = res.data.reviews;
          const seeded = Array.isArray(rawReviews)
            ? rawReviews
            : Array.isArray(rawReviews?.data)
            ? rawReviews.data
            : [];
          setReviews(seeded);
        } else {
          setError("Product not found");
        }
      } catch (err: unknown) {
        console.error("Failed to fetch product detail:", err);
        setError(err instanceof Error ? err.message : "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  const getImageUrl = (path: string | null) => {
    return resolveImageUrl(path) || "/placeholder.jpg";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2fcff] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
          <div className="w-6 h-6 border-3 border-[#01A7E5] border-t-transparent rounded-full animate-spin"></div>
          Loading product details...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">📦</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Product Not Found</h1>
        <p className="text-gray-600 mb-8">{error || "The requested product could not be found."}</p>
        <Link
          href="/products/shop"
          className="px-6 py-3 bg-[#01A7E5] text-white font-bold rounded-xl hover:bg-[#018bc0] transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const originalPrice = Number(product.original_price || 0);
  const calculateDiscountedPrice = () => {
    if (!product.discount_type || !product.discount_value) return originalPrice;
    if (product.discount_type === "percentage") {
      return Math.max(0, originalPrice - originalPrice * (Number(product.discount_value) / 100));
    }
    if (product.discount_type === "fixed") {
      return Math.max(0, originalPrice - Number(product.discount_value));
    }
    return originalPrice;
  };

  const getDiscountPercent = () => {
    if (!product.discount_type || !product.discount_value) return null;
    if (product.discount_type === "percentage") return Math.round(Number(product.discount_value));
    if (product.discount_type === "fixed" && originalPrice > 0) {
      return Math.round((Number(product.discount_value) / originalPrice) * 100);
    }
    return null;
  };

  const discountedPrice = calculateDiscountedPrice();
  const discountPercent = getDiscountPercent();
  const inStock = product.stock_quantity > 0;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length
      : 0;

  const handleSubmitReview = () => {
    if (reviewRating === 0) {
      setReviewError("Please select a star rating.");
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError("Please write a comment.");
      return;
    }

    const newReview = {
      id: `local-${Date.now()}`,
      customer_name: reviewName.trim() || "Anonymous",
      rating: reviewRating,
      comment: reviewComment.trim(),
      created_at: new Date().toISOString(),
    };

    setReviews((prev) => [newReview, ...prev]);
    setReviewName("");
    setReviewComment("");
    setReviewRating(0);
    setReviewError(null);
    toast.success("Thanks for your review!");
  };

  // Build image gallery
  const galleryList = [
    getImageUrl(product.featured_image),
    ...(product.galleries?.map((g) => getImageUrl(g.image)) || []),
  ];

  const handleAddToCart = async () => {
    if (!inStock || isCartLoading || isCartUpdating) return;

    try {
      await addItem({
        id: String(product.id),
        productId: product.id,
        productSlug: product.slug,
        name: product.title,
        category: "Shop",
        price: discountedPrice,
        quantity,
        image: getImageUrl(product.featured_image),
        inStock,
      });

      setAddedToast(true);
      toast.success(`Added ${quantity} × ${product.title} to cart`);
      setTimeout(() => setAddedToast(false), 1800);
    } catch (cartError) {
      toast.error(
        cartError instanceof Error ? cartError.message : "Failed to add this product to your cart."
      );
    }
  };

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
          <span className="text-gray-900 font-bold truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Product Details Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
            {/* Gallery Column */}
            <div className="space-y-4">
              {/* Main Display Image */}
              <div className="relative w-full h-80 sm:h-96 bg-slate-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
                <Image
                  src={galleryList[selectedImageIndex] || galleryList[0]}
                  alt={product.title}
                  fill
                  priority
                  unoptimized
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
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        selectedImageIndex === idx
                          ? "border-[#01A7E5] ring-2 ring-cyan-100"
                          : "border-gray-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image src={img} alt={`Gallery ${idx + 1}`} fill unoptimized className="object-cover" />
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
                    Shop Product
                  </span>
                  {/* {product.sku && (
                    <span className="text-xs text-gray-500 font-mono">SKU: {product.sku}</span>
                  )} */}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3">
                  {product.title}
                </h1>

                {/* Pricing Block */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-extrabold text-[#01A7E5]">
                    NPR {Math.round(discountedPrice).toLocaleString()}
                  </span>
                  {discountPercent && discountPercent > 0 && (
                    <span className="text-base text-gray-400 line-through">
                      NPR {originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Short Description */}
                {product.short_description && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-6 font-medium">
                    {product.short_description}
                  </p>
                )}

                {/* Quantity Adjustment & Stock Status */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 pt-2">
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
                      inStock
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {inStock ? `✓ In Stock (${product.stock_quantity} available)` : "✗ Out of Stock"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => void handleAddToCart()}
                  disabled={!inStock || isCartLoading || isCartUpdating}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                    addedToast
                      ? "bg-emerald-600 text-white"
                      : !inStock
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#01A7E5] hover:bg-[#018bc0] text-white"
                  }`}
                >
                  {addedToast ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Added to Cart!</span>
                    </>
                  ) : !inStock ? (
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

                {/* <Link
                  href="/cart"
                  className="px-6 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-sm text-center transition-colors"
                >
                  View Cart
                </Link> */}
              </div>
            </div>
          </div>

          {/* Full Detailed Description */}
          {product.description && (
            <div className="prose prose-sm text-gray-600 mt-10 pt-8 border-t border-gray-100 max-w-none">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Description &amp; Specifications
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Reviews Section
          <div className="mt-10 pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Customer Reviews
              </h3>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(averageRating) ? "text-amber-400" : "text-gray-200"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.63 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.958z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500">
                    ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
            </div>

            {/* Write a Review Form 
            <div className="bg-slate-50 border border-gray-100 rounded-2xl p-5 sm:p-6 mb-6">
              <h4 className="text-sm font-bold text-gray-900 mb-4">Write a Review</h4>

              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Your Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="cursor-pointer p-0.5"
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                      <svg
                        className={`w-7 h-7 transition-colors ${
                          star <= (hoverRating || reviewRating) ? "text-amber-400" : "text-gray-200"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.63 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.958z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Name (optional)
                </label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#01A7E5]/30 focus:border-[#01A7E5]"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Your Comment
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#01A7E5]/30 focus:border-[#01A7E5]"
                />
              </div>

              {reviewError && (
                <p className="text-xs font-bold text-rose-600 mb-3">{reviewError}</p>
              )}

              <button
                onClick={handleSubmitReview}
                className="px-6 py-2.5 rounded-xl bg-[#01A7E5] hover:bg-[#018bc0] text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Submit Review
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="bg-slate-50 border border-gray-100 rounded-2xl py-10 px-6 text-center">
                <p className="text-sm text-gray-500 font-medium">
                  No reviews yet. Be the first to share your thoughts on this product.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {reviews.map((review, idx) => (
                  <div
                    key={review.id ?? idx}
                    className="border border-gray-100 rounded-2xl p-5 bg-slate-50/50"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {review.customer_name || review.user_name || review.name || "Anonymous"}
                        </p>
                        {review.created_at && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(review.created_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center shrink-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= Number(review.rating || 0) ? "text-amber-400" : "text-gray-200"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.63 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.958z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    {(review.comment || review.review || review.body) && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {review.comment || review.review || review.body}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div> */}
        </div>
      </div>
    </article>
  );
}
