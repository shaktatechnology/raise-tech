<?php

namespace Tests\Feature;

use App\Models\Banner;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HomeTestimonialApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_home_response_includes_testimonial_section_and_profile_images(): void
    {
        Banner::create([
            'testimonial_image' => 'homepage-testimonials/section.jpg',
        ]);

        $testimonial = $this->createTestimonial([
            'image' => 'testimonials/client.jpg',
        ]);

        $this->getJson('/api/home')
            ->assertOk()
            ->assertJsonPath('data.testimonial_image', 'homepage-testimonials/section.jpg')
            ->assertJsonPath('data.testimonials.0.id', $testimonial->id)
            ->assertJsonPath('data.testimonials.0.image', 'testimonials/client.jpg');
    }

    public function test_unauthenticated_user_cannot_manage_testimonial_images(): void
    {
        $this->postJson('/api/home/testimonials/image', [])->assertUnauthorized();
        $this->postJson('/api/home/testimonials/store', [])->assertUnauthorized();
        $this->postJson('/api/home/testimonials/1', [])->assertUnauthorized();
    }

    public function test_admin_can_upload_section_and_client_images_and_remove_client_image(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $sectionResponse = $this->post('/api/home/testimonials/image', [
            'image' => UploadedFile::fake()->image('section.jpg', 1200, 800),
        ])->assertOk();

        $sectionPath = $sectionResponse->json('data.testimonial_image');
        $this->assertIsString($sectionPath);
        Storage::disk('public')->assertExists($sectionPath);

        $createResponse = $this->post('/api/home/testimonials/store', [
            'rating' => 5,
            'name' => 'Sita Sharma',
            'role' => 'Operations Manager',
            'company_name' => 'Example Company',
            'description' => 'Excellent service.',
            'image' => UploadedFile::fake()->image('client.png', 600, 600),
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Sita Sharma');

        $testimonialId = $createResponse->json('data.id');
        $clientPath = $createResponse->json('data.image');
        $this->assertIsString($clientPath);
        Storage::disk('public')->assertExists($clientPath);

        $this->post("/api/home/testimonials/{$testimonialId}", [
            'rating' => 4,
            'name' => 'Sita Sharma',
            'role' => 'Operations Manager',
            'company_name' => 'Example Company',
            'description' => 'Updated review.',
            'remove_image' => '1',
        ])
            ->assertOk()
            ->assertJsonPath('data.image', null)
            ->assertJsonPath('data.rating', 4);

        Storage::disk('public')->assertMissing($clientPath);
    }

    private function createTestimonial(array $overrides = []): Testimonial
    {
        return Testimonial::create(array_merge([
            'rating' => 5,
            'name' => 'Pradip',
            'role' => 'CEO',
            'company_name' => 'AFNAI Company',
            'description' => 'Very good job.',
        ], $overrides));
    }
}
