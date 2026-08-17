<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpsertTeamMemberRequest;
use App\Models\Team;
use App\Services\ManagedImageStorage;
use Dedoc\Scramble\Attributes\Response as ApiResponse;

class TeamController extends Controller
{
    /**
     * Public API endpoint to fetch active team members for frontend
     */
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => Team::where('is_active', true)->get(),
        ]);
    }

    /**
     * Add a new team member
     */
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function store(UpsertTeamMemberRequest $request, ManagedImageStorage $images)
    {
        $team = new Team;
        $team->fill($request->safe()->except(['image', 'remove_image']));
        $images->save($team, 'image', $request->file('image'), false, 'teams');
        $team->refresh();

        return response()->json([
            'message' => 'Team member added successfully.',
            'data' => $team,
        ], 201);
    }

    /**
     * Update an existing team member
     */
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function update(
        UpsertTeamMemberRequest $request,
        Team $team,
        ManagedImageStorage $images,
    ) {
        $team->fill($request->safe()->except(['image', 'remove_image']));
        $images->save(
            $team,
            'image',
            $request->file('image'),
            $request->boolean('remove_image'),
            'teams',
        );
        $team->refresh();

        return response()->json([
            'message' => 'Team member updated successfully.',
            'data' => $team,
        ]);
    }

    /**
     * Delete a team member
     */
    #[ApiResponse(403, 'Administrator authorization is required.')]
    public function destroy(Team $team, ManagedImageStorage $images)
    {
        $oldImage = $team->image;
        $team->delete();
        $images->deleteManaged($oldImage, 'teams', $team, 'image');

        return response()->json([
            'message' => 'Team member deleted successfully.',
        ]);
    }
}
