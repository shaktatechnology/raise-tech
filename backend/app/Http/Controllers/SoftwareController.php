<?php

namespace App\Http\Controllers;

use App\Models\Software;
use App\Models\SoftwareSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SoftwareController extends Controller
{
    /**
     * Public API endpoint for Next.js Frontend
     */
    public function index()
    {
        $section = SoftwareSection::first();
        $items = Software::where('is_active', true)->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'section' => $section,
                'items' => $items,
            ]
        ]);
    }

    /**
     * Update Software Section (Hero Image)
     */
    public function updateSection(Request $request)
    {
        $validated = $request->validate([
            'hero_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        $section = SoftwareSection::firstOrCreate(['id' => 1]);

        if ($request->hasFile('hero_image')) {
            if ($section->hero_image && Storage::disk('public')->exists($section->hero_image)) {
                Storage::disk('public')->delete($section->hero_image);
            }
            $section->hero_image = $request->file('hero_image')->store('software', 'public');
            $section->save();
        }

        return response()->json([
            'message' => 'Software section hero image updated successfully',
            'data' => $section
        ]);
    }

    /**
     * Store new software item
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'software_section_id' => 'nullable|exists:software_sections,id',
            'title' => 'required|string|max:255',
            'slogan' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'is_active' => 'nullable|boolean',
        ]);

        // Default to section ID 1 if not provided
        if (!isset($validated['software_section_id'])) {
            $section = SoftwareSection::firstOrCreate(['id' => 1]);
            $validated['software_section_id'] = $section->id;
        }

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('software', 'public');
        }

        $software = Software::create($validated);

        return response()->json([
            'message' => 'Software product created successfully',
            'data' => $software
        ], 201);
    }

    /**
     * Update software item
     */
    public function update(Request $request, Software $software)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slogan' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($software->image && Storage::disk('public')->exists($software->image)) {
                Storage::disk('public')->delete($software->image);
            }
            $validated['image'] = $request->file('image')->store('software', 'public');
        }

        $software->update($validated);

        return response()->json([
            'message' => 'Software product updated successfully',
            'data' => $software
        ]);
    }

    /**
     * Delete software item
     */
    public function destroy(Software $software)
    {
        if ($software->image && Storage::disk('public')->exists($software->image)) {
            Storage::disk('public')->delete($software->image);
        }

        $software->delete();

        return response()->json([
            'message' => 'Software product deleted successfully'
        ]);
    }
}
