<?php

namespace App\Http\Controllers;

use App\Models\ServiceHeader;
use Illuminate\Http\Request;
use App\Models\Service;
use Illuminate\Support\Facades\Storage;


class ServiceController extends Controller
{

    //public:fetch hero header and all active services
    public function index()
    {
        $header = ServiceHeader::first();
        $services = Service::where('is_active', true)->orderby('order', 'asc')->get();

        return response()->json([
            'header' => $header,
            'services' => $services,
        ]);
    }

    //admin:update hero and header
    public function updateHeader(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'hero_image' => 'nullable|image|mimes:jpg,jpeg,png,webp,gif|max:9048',
        ]);

        $header = ServiceHeader::first()?? new ServiceHeader();

        if ($request->hasfile('hero_image')) {
            //Delete old heroimage if exists
            if ($header->hero_image) {
                Storage::disk('public')->delete($header->hero_image);
            }

            $validated['hero_image'] = $request->file('hero_image')->store('services/hero','public');
        }
        $header->fill($validated);
        $header->save();

        return response()->json([
            'message' => 'Service header updated successfully.',
            'header' => $header,
        ]);
    }

    //admin:add new service
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slogan' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp,gif|max:9048',
            'description' => 'required|string',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('services/items', 'public');
        }

        $service = Service::create($validated);

        return response()->json([
            'message' => 'Service created successfully.',
            'service' => $service,
        ], 201);
    }

    //Admin: upadate service

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slogan' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp,gif|max:9048',
            'description' => 'required|string',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            //Delete old image if exists
            if ($service->image) {
                Storage::disk('public')->delete($service->image);
            }

            $validated['image'] = $request->file('image')->store('services/items', 'public');
        }


        $service->update($validated);

        return response()->json([
            'message' => 'Service updated successfully.',
            'service' => $service,
        ]);

    }
    //Admin:Delete Service

    public function destroy(Service $service)
    {
        if ($service->image) {
            Storage::disk('public')->delete($service->image);
        }
        $service->delete();

        return response()->json([
            'message' => 'Service deleted successfully.',
        ]);
    }

}
