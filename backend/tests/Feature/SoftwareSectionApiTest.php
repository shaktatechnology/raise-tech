<?php

namespace Tests\Feature;

use App\Models\SoftwareSection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SoftwareSectionApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_read_software_intro_content(): void
    {
        SoftwareSection::create([
            'eyebrow' => 'Business Applications',
            'title' => 'Software Built for Growth',
            'description' => 'Flexible software for modern teams.',
        ]);

        $this->getJson('/api/software')
            ->assertOk()
            ->assertJsonPath('data.section.eyebrow', 'Business Applications')
            ->assertJsonPath('data.section.title', 'Software Built for Growth')
            ->assertJsonPath('data.section.description', 'Flexible software for modern teams.');
    }

    public function test_unauthenticated_user_cannot_update_software_section(): void
    {
        $this->postJson('/api/software/section', [
            'title' => 'Unauthorized change',
        ])->assertUnauthorized();
    }

    public function test_admin_can_update_software_intro_content(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->postJson('/api/software/section', [
            'eyebrow' => 'Custom Business Systems',
            'title' => 'Enterprise Software for Sustainable Growth',
            'description' => 'Manage the software page introduction from the admin portal.',
        ])
            ->assertOk()
            ->assertJsonPath('data.eyebrow', 'Custom Business Systems')
            ->assertJsonPath('data.title', 'Enterprise Software for Sustainable Growth')
            ->assertJsonPath(
                'data.description',
                'Manage the software page introduction from the admin portal.',
            );

        $this->assertDatabaseHas('software_sections', [
            'eyebrow' => 'Custom Business Systems',
            'title' => 'Enterprise Software for Sustainable Growth',
        ]);
    }
}
