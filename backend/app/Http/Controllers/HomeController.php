<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateBannerRequest;
use App\Http\Requests\UpdateHomeTestimonialImageRequest;
use App\Http\Requests\UpsertPortfolioRequest;
use App\Http\Requests\UpsertTestimonialRequest;
use App\Models\Banner;
use App\Models\HomeService;
use App\Models\Portfolio;
use App\Models\Testimonial;
use App\Services\ManagedImageStorage;
use Dedoc\Scramble\Attributes\Response as ApiResponse;
use Illuminate\Http\Request;

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
                'testimonial_image' => $banner?->testimonial_image,
            ],
        ]);
    }

    /**
     * Admin: update the Banner (title, image, description).
     */
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function updateBanner(UpdateBannerRequest $request, ManagedImageStorage $images)
    {
        $banner = Banner::first() ?? new Banner;
        $banner->fill($request->safe()->except(['image', 'remove_image']));
        $images->save(
            $banner,
            'image',
            $request->file('image'),
            $request->boolean('remove_image'),
            'banner',
        );
        $banner->refresh();

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
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function storePortfolio(UpsertPortfolioRequest $request, ManagedImageStorage $images)
    {
        $portfolio = new Portfolio;
        $portfolio->fill($request->safe()->except(['image', 'remove_image']));
        $images->save(
            $portfolio,
            'image',
            $request->file('image'),
            false,
            'portfolio',
        );
        $portfolio->refresh();

        return response()->json([
            'message' => 'Portfolio item created successfully',
            'data' => $portfolio,
        ], 201);
    }

    /**
     * Admin: update a Portfolio item.
     */
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function updatePortfolio(
        UpsertPortfolioRequest $request,
        Portfolio $portfolio,
        ManagedImageStorage $images,
    ) {
        $portfolio->fill($request->safe()->except(['image', 'remove_image']));
        $images->save(
            $portfolio,
            'image',
            $request->file('image'),
            $request->boolean('remove_image'),
            'portfolio',
        );
        $portfolio->refresh();

        return response()->json([
            'message' => 'Portfolio item updated successfully',
            'data' => $portfolio,
        ]);
    }

    /**
     * Admin: delete a Portfolio item.
     */
    public function destroyPortfolio(Portfolio $portfolio, ManagedImageStorage $images)
    {
        $oldImage = $portfolio->image;
        $portfolio->delete();
        $images->deleteManaged($oldImage, 'portfolio', $portfolio, 'image');

        return response()->json([
            'message' => 'Portfolio item deleted successfully',
        ]);
    }

    /**
     * Admin: replace or remove the large image beside the testimonials carousel.
     */
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function updateTestimonialImage(
        UpdateHomeTestimonialImageRequest $request,
        ManagedImageStorage $images,
    ) {
        $banner = Banner::first() ?? new Banner;
        $images->save(
            $banner,
            'testimonial_image',
            $request->file('image'),
            $request->boolean('remove_image'),
            'homepage-testimonials',
        );
        $banner->refresh();

        return response()->json([
            'message' => 'Testimonial section image updated successfully',
            'data' => [
                'testimonial_image' => $banner->testimonial_image,
            ],
        ]);
    }

    /**
     * Admin: add a new Testimonial.
     */
    public function storeTestimonial(
        UpsertTestimonialRequest $request,
        ManagedImageStorage $images,
    ) {
        $testimonial = new Testimonial;
        $testimonial->fill($request->safe()->except(['image', 'remove_image']));
        $images->save(
            $testimonial,
            'image',
            $request->file('image'),
            false,
            'testimonials',
        );
        $testimonial->refresh();

        return response()->json([
            'message' => 'Testimonial created successfully',
            'data' => $testimonial,
        ], 201);
    }

    /**
     * Admin: update a Testimonial.
     */
    public function updateTestimonial(
        UpsertTestimonialRequest $request,
        Testimonial $testimonial,
        ManagedImageStorage $images,
    ) {
        $testimonial->fill($request->safe()->except(['image', 'remove_image']));
        $images->save(
            $testimonial,
            'image',
            $request->file('image'),
            $request->boolean('remove_image'),
            'testimonials',
        );
        $testimonial->refresh();

        return response()->json([
            'message' => 'Testimonial updated successfully',
            'data' => $testimonial,
        ]);
    }

    /**
     * Admin: delete a Testimonial.
     */
    public function destroyTestimonial(Testimonial $testimonial, ManagedImageStorage $images)
    {
        $oldImage = $testimonial->image;
        $testimonial->delete();
        $images->deleteManaged($oldImage, 'testimonials', $testimonial, 'image');

        return response()->json([
            'message' => 'Testimonial deleted successfully',
        ]);
    }
}
