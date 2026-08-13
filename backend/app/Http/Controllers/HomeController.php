<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\HomeService;
use App\Models\Portfolio;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HomeController extends Controller
{
    /**
     * Public: fetch all Homepage data for the frontend in one call.
     */
    public function index()
    {
        $banner = Banner::first();
        $services = HomeService::all();
        $portfolio = Portfolio::all();
        $testimonials = Testimonial::all();

        return response()->json([
            'status' => 'success',
            'data' => [
                'banner' => $banner,
                'services' => $services,
                'portfolio' => $portfolio,
                'testimonials' => $testimonials,
            ],
        ]);
    }

    /**
     * Admin: update the Banner (title, image, description).
     */
    public function updateBanner(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'description' => 'nullable|string',
        ]);

        $banner = Banner::firstOrCreate(['id' => 1]);

        if ($request->hasFile('image')) {
            // Remove old image file if it was one of ours
            if ($banner->image) {
                $oldPath = str_replace(Storage::disk('public')->url(''), '', $banner->image);
                Storage::disk('public')->delete($oldPath);
            }
            $validated['image'] = Storage::disk('public')->url(
                $request->file('image')->store('banner', 'public')
            );
        } else {
            unset($validated['image']); // keep existing image
        }

        $banner->update($validated);

        return response()->json([
            'message' => 'Banner updated successfully',
            'data' => $banner,
        ]);
    }

    /**
     * Admin: add a new "Our Services" item.
     */
    public function storeService(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $service = HomeService::create($validated);

        return response()->json([
            'message' => 'Service created successfully',
            'data' => $service,
        ], 201);
    }

    /**
     * Admin: update a "Our Services" item.
     */
    public function updateService(Request $request, HomeService $homeService)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $homeService->update($validated);

        return response()->json([
            'message' => 'Service updated successfully',
            'data' => $homeService,
        ]);
    }

    /**
     * Admin: delete a "Our Services" item.
     */
    public function destroyService(HomeService $homeService)
    {
        $homeService->delete();

        return response()->json([
            'message' => 'Service deleted successfully',
        ]);
    }

    /**
     * Admin: add a new Portfolio item.
     */
    public function storePortfolio(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'description' => 'required|string',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = Storage::disk('public')->url(
                $request->file('image')->store('portfolio', 'public')
            );
        } else {
            unset($validated['image']);
        }

        $portfolio = Portfolio::create($validated);

        return response()->json([
            'message' => 'Portfolio item created successfully',
            'data' => $portfolio,
        ], 201);
    }

    /**
     * Admin: update a Portfolio item.
     */
    public function updatePortfolio(Request $request, Portfolio $portfolio)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'description' => 'required|string',
        ]);

        if ($request->hasFile('image')) {
            // Remove old image file if it was one of ours
            if ($portfolio->image) {
                $oldPath = str_replace(Storage::disk('public')->url(''), '', $portfolio->image);
                Storage::disk('public')->delete($oldPath);
            }
            $validated['image'] = Storage::disk('public')->url(
                $request->file('image')->store('portfolio', 'public')
            );
        } else {
            unset($validated['image']); // keep existing image
        }

        $portfolio->update($validated);

        return response()->json([
            'message' => 'Portfolio item updated successfully',
            'data' => $portfolio,
        ]);
    }

    /**
     * Admin: delete a Portfolio item.
     */
    public function destroyPortfolio(Portfolio $portfolio)
    {
        $portfolio->delete();

        return response()->json([
            'message' => 'Portfolio item deleted successfully',
        ]);
    }

    /**
     * Admin: add a new Testimonial.
     */
    public function storeTestimonial(Request $request)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'name' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'description' => 'required|string',
        ]);

        $testimonial = Testimonial::create($validated);

        return response()->json([
            'message' => 'Testimonial created successfully',
            'data' => $testimonial,
        ], 201);
    }

    /**
     * Admin: update a Testimonial.
     */
    public function updateTestimonial(Request $request, Testimonial $testimonial)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'name' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'description' => 'required|string',
        ]);

        $testimonial->update($validated);

        return response()->json([
            'message' => 'Testimonial updated successfully',
            'data' => $testimonial,
        ]);
    }

    /**
     * Admin: delete a Testimonial.
     */
    public function destroyTestimonial(Testimonial $testimonial)
    {
        $testimonial->delete();

        return response()->json([
            'message' => 'Testimonial deleted successfully',
        ]);
    }
}