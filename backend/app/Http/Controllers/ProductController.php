<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductGallery;
use App\Services\ManagedImageStorage;
use Dedoc\Scramble\Attributes\Response as ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class ProductController extends Controller
{
    /** Public: list active products. */
    public function index(Request $request)
    {
        $products = Product::where('is_active', true)
            ->with('galleries')
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $products,
        ]);
    }

    /** Public: get one active product by slug. */
    public function show(string $slug)
    {
        $product = Product::where('slug', $slug)
            ->where('is_active', true)
            ->with('galleries')
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => $product,
        ]);
    }

    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function adminIndex()
    {
        return response()->json([
            'status' => 'success',
            'data' => Product::with('galleries')->latest()->get(),
        ]);
    }

    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function store(StoreProductRequest $request, ManagedImageStorage $images)
    {
        $attributes = $request->safe()->except(['featured_image', 'gallery']);
        $attributes['slug'] = $this->availableSlug(
            $attributes['slug'] ?? null,
            $attributes['title'],
        );

        $product = new Product;
        $storedFiles = [];

        try {
            $featuredPath = $images->storeUpload($request->file('featured_image'), 'products');
            $storedFiles[] = ['path' => $featuredPath, 'directory' => 'products', 'attribute' => 'featured_image'];

            $galleryPaths = [];
            foreach ($request->file('gallery', []) as $galleryImage) {
                $path = $images->storeUpload($galleryImage, 'products/gallery');
                $galleryPaths[] = $path;
                $storedFiles[] = ['path' => $path, 'directory' => 'products/gallery', 'attribute' => 'image'];
            }

            DB::transaction(function () use (&$product, $attributes, $featuredPath, $galleryPaths): void {
                $product = Product::create([
                    ...$attributes,
                    'featured_image' => $featuredPath,
                ]);

                foreach ($galleryPaths as $path) {
                    $product->galleries()->create([
                        'image' => $path,
                        'thumbnail' => $path,
                    ]);
                }
            });
        } catch (Throwable $exception) {
            $this->cleanNewFiles($storedFiles, $product, $images);
            throw $exception;
        }

        return response()->json([
            'message' => 'Product created successfully.',
            'data' => $product->load('galleries'),
        ], 201);
    }

    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function update(
        UpdateProductRequest $request,
        Product $product,
        ManagedImageStorage $images,
    ) {
        $attributes = $request->safe()->except(['featured_image', 'gallery']);
        $oldFeaturedImage = $product->featured_image;
        $newFeaturedPath = null;
        $newGalleryPaths = [];
        $storedFiles = [];

        try {
            if ($request->hasFile('featured_image')) {
                $newFeaturedPath = $images->storeUpload($request->file('featured_image'), 'products');
                $storedFiles[] = [
                    'path' => $newFeaturedPath,
                    'directory' => 'products',
                    'attribute' => 'featured_image',
                ];
            }

            foreach ($request->file('gallery', []) as $galleryImage) {
                $path = $images->storeUpload($galleryImage, 'products/gallery');
                $newGalleryPaths[] = $path;
                $storedFiles[] = [
                    'path' => $path,
                    'directory' => 'products/gallery',
                    'attribute' => 'image',
                ];
            }

            DB::transaction(function () use (
                $product,
                $attributes,
                $newFeaturedPath,
                $newGalleryPaths,
            ): void {
                $product->fill($attributes);
                if ($newFeaturedPath) {
                    $product->featured_image = $newFeaturedPath;
                }
                $product->save();

                foreach ($newGalleryPaths as $path) {
                    $product->galleries()->create([
                        'image' => $path,
                        'thumbnail' => $path,
                    ]);
                }
            });
        } catch (Throwable $exception) {
            $this->cleanNewFiles($storedFiles, $product, $images);
            throw $exception;
        }

        if ($newFeaturedPath && $oldFeaturedImage !== $newFeaturedPath) {
            $images->deleteManaged($oldFeaturedImage, 'products', $product, 'featured_image');
        }

        return response()->json([
            'message' => 'Product updated successfully.',
            'data' => $product->refresh()->load('galleries'),
        ]);
    }

    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function destroy(Product $product, ManagedImageStorage $images)
    {
        $featuredImage = $product->featured_image;
        $galleryFiles = $product->galleries
            ->flatMap(fn (ProductGallery $gallery) => array_filter([
                $gallery->image,
                $gallery->thumbnail !== $gallery->image ? $gallery->thumbnail : null,
            ]))
            ->values();

        DB::transaction(fn () => $product->delete());

        $images->deleteManaged($featuredImage, 'products', $product, 'featured_image');
        foreach ($galleryFiles as $path) {
            $images->deleteManaged((string) $path, 'products/gallery', $product, 'galleries');
        }

        return response()->json(['message' => 'Product deleted successfully.']);
    }

    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function destroyGalleryImage(
        ProductGallery $gallery,
        ManagedImageStorage $images,
    ) {
        $image = $gallery->image;
        $thumbnail = $gallery->thumbnail;
        $gallery->delete();

        $images->deleteManaged($image, 'products/gallery', $gallery, 'image');
        if ($thumbnail && $thumbnail !== $image) {
            $images->deleteManaged($thumbnail, 'products/gallery', $gallery, 'thumbnail');
        }

        return response()->json(['message' => 'Gallery image deleted successfully.']);
    }

    private function availableSlug(?string $requestedSlug, string $title): string
    {
        $base = Str::slug($requestedSlug ?: $title) ?: 'product';
        $slug = $base;
        $suffix = 2;

        while (Product::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }

    /**
     * @param  array<int, array{path: string, directory: string, attribute: string}>  $storedFiles
     */
    private function cleanNewFiles(
        array $storedFiles,
        Product $product,
        ManagedImageStorage $images,
    ): void {
        foreach ($storedFiles as $storedFile) {
            $images->deleteManaged(
                $storedFile['path'],
                $storedFile['directory'],
                $product,
                $storedFile['attribute'],
            );
        }
    }
}
