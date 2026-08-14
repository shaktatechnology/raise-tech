<?php

namespace App\Http\Controllers;

use App\Models\About;
use App\Models\WhatWeDo;
use App\Models\WhyChooseUs;
use Illuminate\Http\Request;

class AboutController extends Controller
{
    /**
     * Public API endpoint to fetch all About Page data for Frontend
     */
    public function index()
    {
        $about = About::first();
        $whatWeDoItems = WhatWeDo::all();
        $whyChooseUsItems = WhyChooseUs::all();

        return response()->json([
            'status' => 'success',
            'data' => [
                'about' => $about,
                'what_we_do_items' => $whatWeDoItems,
                'why_choose_us_items' => $whyChooseUsItems,
            ],
        ]);
    }

    /**
     * Update main About settings
     */
    public function updateAbout(Request $request)
    {
        $validated = $request->validate([
            'hero_image' => 'nullable|string',
            'about_description' => 'nullable|string',
            'about_image' => 'nullable|string',
            'what_we_do_image' => 'nullable|string',
            'why_choose_us_image' => 'nullable|string',
            'mission' => 'nullable|string',
            'vision' => 'nullable|string',
        ]);

        $about = About::firstOrCreate(['id' => 1]);
        $about->update($validated);

        return response()->json([
            'message' => 'About settings updated successfully',
            'data' => $about,
        ]);
    }

    /**
     * Add a new What We Do item (for slider)
     */
    public function storeWhatWeDo(Request $request)
    {
        $validated = $this->validateWhatWeDo($request);

        $item = WhatWeDo::create($validated);

        return response()->json([
            'message' => 'What We Do item created successfully',
            'data' => $item,
        ], 201);
    }

    /**
     * Update a What We Do card.
     */
    public function updateWhatWeDo(Request $request, WhatWeDo $whatWeDo)
    {
        $whatWeDo->update($this->validateWhatWeDo($request));

        return response()->json([
            'message' => 'What We Do item updated successfully',
            'data' => $whatWeDo->fresh(),
        ]);
    }

    /**
     * Delete a What We Do card.
     */
    public function destroyWhatWeDo(WhatWeDo $whatWeDo)
    {
        $whatWeDo->delete();

        return response()->json([
            'message' => 'What We Do item deleted successfully',
        ]);
    }

    /**
     * Add a new Why Choose Us feature item
     */
    public function storeWhyChooseUs(Request $request)
    {
        $validated = $this->validateWhyChooseUs($request);

        $item = WhyChooseUs::create($validated);

        return response()->json([
            'message' => 'Why Choose Us item created successfully',
            'data' => $item,
        ], 201);
    }

    /**
     * Update a Why Choose Us card.
     */
    public function updateWhyChooseUs(Request $request, WhyChooseUs $whyChooseUs)
    {
        $whyChooseUs->update($this->validateWhyChooseUs($request));

        return response()->json([
            'message' => 'Why Choose Us item updated successfully',
            'data' => $whyChooseUs->fresh(),
        ]);
    }

    /**
     * Delete a Why Choose Us card.
     */
    public function destroyWhyChooseUs(WhyChooseUs $whyChooseUs)
    {
        $whyChooseUs->delete();

        return response()->json([
            'message' => 'Why Choose Us item deleted successfully',
        ]);
    }

    /**
     * Validate the editable content of a What We Do card.
     *
     * @return array{title: string, description: string}
     */
    private function validateWhatWeDo(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);
    }

    /**
     * Validate and normalize the editable content of a Why Choose Us card.
     * The existing admin UI calls the heading "name", while the database
     * stores it as "title".
     *
     * @return array{title: string, description: string}
     */
    private function validateWhyChooseUs(Request $request): array
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255|required_without:title',
            'title' => 'nullable|string|max:255|required_without:name',
            'description' => 'required|string',
        ]);

        return [
            'title' => $validated['title'] ?? $validated['name'],
            'description' => $validated['description'],
        ];
    }
}
