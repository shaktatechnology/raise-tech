<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSoftwareSectionRequest;
use App\Http\Requests\UpsertSoftwareRequest;
use App\Models\Software;
use App\Models\SoftwareSection;
use App\Services\ManagedImageStorage;
use Dedoc\Scramble\Attributes\Response as ApiResponse;

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
            ],
        ]);
    }

    /**
     * Update Software Section (Hero Image)
     */
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function updateSection(
        UpdateSoftwareSectionRequest $request,
        ManagedImageStorage $images,
    ) {
        $section = SoftwareSection::first() ?? new SoftwareSection;
        $images->save(
            $section,
            'hero_image',
            $request->file('hero_image'),
            $request->boolean('remove_hero_image'),
            'software',
        );
        $section->refresh();

        return response()->json([
            'message' => 'Software section hero image updated successfully.',
            'data' => $section,
        ]);
    }

    /**
     * Store new software item
     */
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function store(UpsertSoftwareRequest $request, ManagedImageStorage $images)
    {
        $attributes = $request->safe()->except(['image', 'remove_image']);

        if (! isset($attributes['software_section_id'])) {
            $section = SoftwareSection::first() ?? SoftwareSection::create();
            $attributes['software_section_id'] = $section->id;
        }

        $software = new Software;
        $software->fill($attributes);
        $images->save(
            $software,
            'image',
            $request->file('image'),
            false,
            'software',
        );
        $software->refresh();

        return response()->json([
            'message' => 'Software product created successfully.',
            'data' => $software,
        ], 201);
    }

    /**
     * Update software item
     */
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function update(
        UpsertSoftwareRequest $request,
        Software $software,
        ManagedImageStorage $images,
    ) {
        $software->fill($request->safe()->except(['image', 'remove_image']));
        $images->save(
            $software,
            'image',
            $request->file('image'),
            $request->boolean('remove_image'),
            'software',
        );
        $software->refresh();

        return response()->json([
            'message' => 'Software product updated successfully.',
            'data' => $software,
        ]);
    }

    /**
     * Delete software item
     */
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function destroy(Software $software, ManagedImageStorage $images)
    {
        $oldImage = $software->image;
        $software->delete();
        $images->deleteManaged($oldImage, 'software', $software, 'image');

        return response()->json([
            'message' => 'Software product deleted successfully.',
        ]);
    }
}
