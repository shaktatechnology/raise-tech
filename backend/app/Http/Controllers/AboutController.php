<?php

namespace App\Http\Controllers;

use App\Models\About;
use App\Models\WhatWeDo;
use App\Models\WhyChooseUs;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

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
     * Update main About settings.
     *
     * hero_image, about_image, and what_we_do_image are uploaded as files
     * (multipart/form-data) and stored on the public disk. Sending no file
     * for a given field leaves the existing stored image untouched.
     */
    public function updateAbout(Request $request)
    {
        $validated = $request->validate([
            'about_description' => 'nullable|string',
            'mission' => 'nullable|string',
            'hero_image' => 'nullable|image|max:5120',
            'about_image' => 'nullable|image|max:5120',
            'what_we_do_image' => 'nullable|image|max:5120',
        ]);

        $about = About::firstOrCreate(['id' => 1]);

        $updates = [
            'about_description' => $validated['about_description'] ?? $about->about_description,
            'mission' => $validated['mission'] ?? $about->mission,
        ];

        foreach (['hero_image', 'about_image', 'what_we_do_image'] as $field) {
            if ($request->hasFile($field)) {
                $updates[$field] = $this->storeAboutImage($request->file($field), $about->{$field});
            }
        }

        $about->update($updates);

        return response()->json([
            'message' => 'About settings updated successfully',
            'data' => $about->fresh(),
        ]);
    }

    /**
     * Store a newly uploaded About-page image on the public disk, deleting
     * the previously stored image (if any) so orphaned files don't pile up.
     */
    private function storeAboutImage(UploadedFile $file, ?string $existingPath): string
    {
        if ($existingPath) {
            $relativePath = ltrim(str_replace('/storage/', '', $existingPath), '/');
            if (Storage::disk('public')->exists($relativePath)) {
                Storage::disk('public')->delete($relativePath);
            }
        }

        $storedPath = $file->store('about', 'public');

        return '/storage/' . $storedPath;
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