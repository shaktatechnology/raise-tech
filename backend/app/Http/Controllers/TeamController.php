<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TeamController extends Controller
{
    /**
     * Public API endpoint to fetch active team members for frontend
     */
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => Team::where('is_active', true)->get()
        ]);
    }

    /**
     * Add a new team member
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'description' => 'required|string',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('teams', 'public');
            $validated['image'] = $path;
        }

        $team = Team::create($validated);

        return response()->json([
            'message' => 'Team member added successfully',
            'data' => $team
        ], 201);
    }

    /**
     * Update an existing team member
     */
    public function update(Request $request, Team $team)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'position' => 'sometimes|required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'description' => 'sometimes|required|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($team->image && Storage::disk('public')->exists($team->image)) {
                Storage::disk('public')->delete($team->image);
            }
            $path = $request->file('image')->store('teams', 'public');
            $validated['image'] = $path;
        }

        $team->update($validated);

        return response()->json([
            'message' => 'Team member updated successfully',
            'data' => $team
        ]);
    }

    /**
     * Delete a team member
     */
    public function destroy(Team $team)
    {
        if ($team->image && Storage::disk('public')->exists($team->image)) {
            Storage::disk('public')->delete($team->image);
        }

        $team->delete();

        return response()->json([
            'message' => 'Team member deleted successfully'
        ]);
    }
}
