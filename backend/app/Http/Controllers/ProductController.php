<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductGallery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Public: List all active products
     */
    public function index(Request $request)
    {
        $products = Product::where('is_active', true)
            ->with('galleries')
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $products,
        ]);
    }

    /**
     * Public: Get a single product by slug
     */
    public function show(string $slug)
    {
        $product = Product::where('slug', $slug)
            ->where('is_active', true)
            ->with('galleries')
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data'   => $product,
        ]);
    }

    /**
     * Admin: List ALL products (including inactive)
     */
    public function adminIndex()
    {
        $products = Product::with('galleries')->latest()->get();

        return response()->json([
            'status' => 'success',
            'data'   => $products,
        ]);
    }

    /**
     * Admin: Create a new product
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'             => 'required|string|max:255',
            'slug'              => 'nullable|string|max:255|unique:products,slug',
            'sku'               => 'nullable|string|max:100|unique:products,sku',
            'short_description' => 'nullable|string',
            'description'       => 'nullable|string',
            'original_price'    => 'required|numeric|min:0',
            'discount_type'     => 'nullable|in:percentage,fixed',
            'discount_value'    => 'nullable|numeric|min:0',
            'stock_quantity'    => 'nullable|integer|min:0',
            'featured_image'    => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:9048',
            'is_active'         => 'nullable|boolean',
            'meta_title'        => 'nullable|string|max:255',
            'meta_description'  => 'nullable|string',
            'gallery.*'         => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:9048',
        ]);

        // Auto-generate slug from title if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Upload featured image
        if ($request->hasFile('featured_image')) {
            $validated['featured_image'] = $request->file('featured_image')->store('products', 'public');
        }

        $product = Product::create($validated);

        // Upload gallery images
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $image) {
                $path = $image->store('products/gallery', 'public');
                ProductGallery::create([
                    'product_id' => $product->id,
                    'image'      => $path,
                    'thumbnail'  => $path, // same path; you can generate thumbs separately
                ]);
            }
        }

        return response()->json([
            'message' => 'Product created successfully',
            'data'    => $product->load('galleries'),
        ], 201);
    }

    /**
     * Admin: Update an existing product
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'title'             => 'sometimes|required|string|max:255',
            'slug'              => 'sometimes|required|string|max:255|unique:products,slug,' . $product->id,
            'sku'               => 'sometimes|nullable|string|max:100|unique:products,sku,' . $product->id,
            'short_description' => 'nullable|string',
            'description'       => 'nullable|string',
            'original_price'    => 'sometimes|required|numeric|min:0',
            'discount_type'     => 'nullable|in:percentage,fixed',
            'discount_value'    => 'nullable|numeric|min:0',
            'stock_quantity'    => 'nullable|integer|min:0',
            'featured_image'    => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'is_active'         => 'sometimes|boolean',
            'meta_title'        => 'nullable|string|max:255',
            'meta_description'  => 'nullable|string',
            'gallery.*'         => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        // Upload new featured image & delete old one
        if ($request->hasFile('featured_image')) {
            if ($product->featured_image && Storage::disk('public')->exists($product->featured_image)) {
                Storage::disk('public')->delete($product->featured_image);
            }
            $validated['featured_image'] = $request->file('featured_image')->store('products', 'public');
        }

        $product->update($validated);

        // Append new gallery images (does NOT delete existing ones)
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $image) {
                $path = $image->store('products/gallery', 'public');
                ProductGallery::create([
                    'product_id' => $product->id,
                    'image'      => $path,
                    'thumbnail'  => $path,
                ]);
            }
        }

        return response()->json([
            'message' => 'Product updated successfully',
            'data'    => $product->load('galleries'),
        ]);
    }

    /**
     * Admin: Delete a product and its images
     */
    public function destroy(Product $product)
    {
        // Delete featured image
        if ($product->featured_image && Storage::disk('public')->exists($product->featured_image)) {
            Storage::disk('public')->delete($product->featured_image);
        }

        // Delete all gallery images
        foreach ($product->galleries as $gallery) {
            if ($gallery->image && Storage::disk('public')->exists($gallery->image)) {
                Storage::disk('public')->delete($gallery->image);
            }
            if ($gallery->thumbnail && $gallery->thumbnail !== $gallery->image
                && Storage::disk('public')->exists($gallery->thumbnail)) {
                Storage::disk('public')->delete($gallery->thumbnail);
            }
        }

        $product->delete(); // cascades to galleries via DB constraint

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }

    /**
     * Admin: Delete a single gallery image
     */
    public function destroyGalleryImage(ProductGallery $gallery)
    {
        if ($gallery->image && Storage::disk('public')->exists($gallery->image)) {
            Storage::disk('public')->delete($gallery->image);
        }
        if ($gallery->thumbnail && $gallery->thumbnail !== $gallery->image
            && Storage::disk('public')->exists($gallery->thumbnail)) {
            Storage::disk('public')->delete($gallery->thumbnail);
        }

        $gallery->delete();

        return response()->json([
            'message' => 'Gallery image deleted successfully',
        ]);
    }
}
