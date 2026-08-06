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
            ]
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
            'data' => $about
        ]);
    }

    /**
     * Add a new What We Do item (for slider)
     */
    public function storeWhatWeDo(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $item = WhatWeDo::create($validated);

        return response()->json([
            'message' => 'What We Do item created successfully',
            'data' => $item
        ], 201);
    }

    /**
     * Add a new Why Choose Us feature item
     */
    public function storeWhyChooseUs(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $item = WhyChooseUs::create($validated);

        return response()->json([
            'message' => 'Why Choose Us item created successfully',
            'data' => $item
        ], 201);
    }
}
