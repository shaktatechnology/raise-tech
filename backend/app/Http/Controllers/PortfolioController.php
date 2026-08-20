<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdatePortfolioHeaderRequest;
use App\Http\Requests\UpsertPortfolioRequest;
use App\Models\Portfolio;
use App\Models\PortfolioHeader;
use App\Services\ManagedImageStorage;
use Dedoc\Scramble\Attributes\Response as ApiResponse;

class PortfolioController extends Controller
{
    // public: fetch hero header and all portfolio case studies
    public function index()
    {
        $header = PortfolioHeader::first();
        $portfolio = Portfolio::latest()->get();

        return response()->json([
            'status' => 'success',
            'header' => $header,
            'portfolio' => $portfolio,
        ]);
    }

    // public: fetch a single portfolio item
    public function show(Portfolio $portfolio)
    {
        return response()->json([
            'status' => 'success',
            'data' => $portfolio,
        ]);
    }

    // admin: update portfolio hero and header
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function updateHeader(UpdatePortfolioHeaderRequest $request, ManagedImageStorage $images)
    {
        $header = PortfolioHeader::first() ?? new PortfolioHeader;
        $header->fill($request->safe()->except(['hero_image', 'remove_hero_image']));
        $images->save(
            $header,
            'hero_image',
            $request->file('hero_image'),
            $request->boolean('remove_hero_image'),
            'portfolio/hero',
        );
        $header->refresh();

        return response()->json([
            'message' => 'Portfolio header updated successfully.',
            'header' => $header,
        ]);
    }

    // admin: add new portfolio item
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function store(UpsertPortfolioRequest $request, ManagedImageStorage $images)
    {
        $portfolio = new Portfolio;
        $portfolio->fill($request->safe()->except(['image', 'remove_image']));
        $images->save(
            $portfolio,
            'image',
            $request->file('image'),
            false,
            'portfolio/items',
        );
        $portfolio->refresh();

        return response()->json([
            'message' => 'Portfolio item created successfully.',
            'data' => $portfolio,
        ], 201);
    }

    // admin: update portfolio item
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function update(
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
            'portfolio/items',
        );
        $portfolio->refresh();

        return response()->json([
            'message' => 'Portfolio item updated successfully.',
            'data' => $portfolio,
        ]);
    }

    // admin: delete portfolio item
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function destroy(Portfolio $portfolio, ManagedImageStorage $images)
    {
        $oldImage = $portfolio->image;
        $portfolio->delete();
        $images->deleteManaged($oldImage, 'portfolio/items', $portfolio, 'image');

        return response()->json([
            'message' => 'Portfolio item deleted successfully.',
        ]);
    }
}
