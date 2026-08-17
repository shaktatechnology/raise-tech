<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateServiceHeaderRequest;
use App\Http\Requests\UpsertServiceRequest;
use App\Models\Service;
use App\Models\ServiceHeader;
use App\Services\ManagedImageStorage;
use Dedoc\Scramble\Attributes\Response as ApiResponse;

class ServiceController extends Controller
{
    // public:fetch hero header and all active services
    public function index()
    {
        $header = ServiceHeader::first();
        $services = Service::where('is_active', true)->orderby('order', 'asc')->get();

        return response()->json([
            'header' => $header,
            'services' => $services,
        ]);
    }

    // admin:update hero and header
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function updateHeader(UpdateServiceHeaderRequest $request, ManagedImageStorage $images)
    {
        $header = ServiceHeader::first() ?? new ServiceHeader;
        $header->fill($request->safe()->except(['hero_image', 'remove_hero_image']));
        $images->save(
            $header,
            'hero_image',
            $request->file('hero_image'),
            $request->boolean('remove_hero_image'),
            'services/hero',
        );
        $header->refresh();

        return response()->json([
            'message' => 'Service header updated successfully.',
            'header' => $header,
        ]);
    }

    // admin:add new service
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function store(UpsertServiceRequest $request, ManagedImageStorage $images)
    {
        $service = new Service;
        $service->fill($request->safe()->except(['image', 'remove_image']));
        $images->save(
            $service,
            'image',
            $request->file('image'),
            false,
            'services/items',
        );
        $service->refresh();

        return response()->json([
            'message' => 'Service created successfully.',
            'service' => $service,
        ], 201);
    }

    // Admin: upadate service

    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function update(
        UpsertServiceRequest $request,
        Service $service,
        ManagedImageStorage $images,
    ) {
        $service->fill($request->safe()->except(['image', 'remove_image']));
        $images->save(
            $service,
            'image',
            $request->file('image'),
            $request->boolean('remove_image'),
            'services/items',
        );
        $service->refresh();

        return response()->json([
            'message' => 'Service updated successfully.',
            'service' => $service,
        ]);

    }
    // Admin:Delete Service

    public function destroy(Service $service, ManagedImageStorage $images)
    {
        $oldImage = $service->image;
        $service->delete();
        $images->deleteManaged($oldImage, 'services/items', $service, 'image');

        return response()->json([
            'message' => 'Service deleted successfully.',
        ]);
    }
}
