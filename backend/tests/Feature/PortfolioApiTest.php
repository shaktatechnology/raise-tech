<?php

namespace Tests\Feature;

use App\Models\Portfolio;
use App\Models\PortfolioHeader;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PortfolioApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_read_portfolio_page_data_and_a_single_project(): void
    {
        PortfolioHeader::create([
            'title' => 'Selected Work',
            'hero_image' => null,
        ]);
        $project = Portfolio::create([
            'title' => 'Commerce Platform',
            'image' => null,
            'description' => 'A scalable commerce platform.',
        ]);

        $this->getJson('/api/portfolio')
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('header.title', 'Selected Work')
            ->assertJsonPath('portfolio.0.title', 'Commerce Platform');

        $this->getJson("/api/portfolio/{$project->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $project->id)
            ->assertJsonPath('data.title', 'Commerce Platform');
    }

    public function test_unauthenticated_user_cannot_manage_portfolio_content(): void
    {
        $this->postJson('/api/portfolio/header', [])->assertUnauthorized();
        $this->postJson('/api/portfolio/store', [])->assertUnauthorized();
        $this->postJson('/api/portfolio/1', [])->assertUnauthorized();
        $this->deleteJson('/api/portfolio/1')->assertUnauthorized();
    }

    public function test_admin_can_update_header_and_manage_projects(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->postJson('/api/portfolio/header', [
            'title' => 'Our Case Studies',
        ])
            ->assertOk()
            ->assertJsonPath('header.title', 'Our Case Studies');

        $createResponse = $this->postJson('/api/portfolio/store', [
            'title' => 'Customer Portal',
            'description' => 'A secure customer portal.',
        ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Customer Portal');

        $projectId = $createResponse->json('data.id');

        $this->postJson("/api/portfolio/{$projectId}", [
            'title' => 'Enterprise Customer Portal',
            'description' => 'A secure enterprise customer portal.',
        ])
            ->assertOk()
            ->assertJsonPath('data.title', 'Enterprise Customer Portal');

        $this->deleteJson("/api/portfolio/{$projectId}")
            ->assertOk()
            ->assertJsonPath('message', 'Portfolio item deleted successfully.');

        $this->assertDatabaseHas('portfolio_headers', ['title' => 'Our Case Studies']);
        $this->assertDatabaseMissing('portfolios', ['id' => $projectId]);
    }
}
