<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\WhatWeDo;
use App\Models\WhyChooseUs;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AboutContentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_read_about_card_content(): void
    {
        WhatWeDo::create([
            'title' => 'Trackingmandu',
            'description' => 'GPS fleet management software.',
        ]);
        WhyChooseUs::create([
            'title' => 'Dedicated Support',
            'description' => 'Reliable long-term product support.',
        ]);

        $this->getJson('/api/about')
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.what_we_do_items.0.title', 'Trackingmandu')
            ->assertJsonPath('data.why_choose_us_items.0.title', 'Dedicated Support')
            ->assertJsonPath('data.why_choose_us_items.0.name', 'Dedicated Support');
    }

    public function test_unauthenticated_user_cannot_manage_about_cards(): void
    {
        $this->postJson('/api/about/what_we_do/store', [])->assertUnauthorized();
        $this->postJson('/api/about/what_we_do/1', [])->assertUnauthorized();
        $this->deleteJson('/api/about/what_we_do/1')->assertUnauthorized();
        $this->postJson('/api/about/why_choose_us/store', [])->assertUnauthorized();
        $this->postJson('/api/about/why_choose_us/1', [])->assertUnauthorized();
        $this->deleteJson('/api/about/why_choose_us/1')->assertUnauthorized();
    }

    public function test_customer_cannot_manage_about_cards(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'customer']));

        $this->postJson('/api/about/what_we_do/store', [])->assertForbidden();
        $this->postJson('/api/about/why_choose_us/store', [])->assertForbidden();
    }

    public function test_admin_can_create_update_and_delete_what_we_do_cards(): void
    {
        $this->actingAsAdmin();

        $createResponse = $this->postJson('/api/about/what_we_do/store', [
            'title' => 'Custom CRM Software',
            'description' => 'A CRM tailored to business workflows.',
        ])->assertCreated();

        $itemId = $createResponse->json('data.id');

        $this->postJson("/api/about/what_we_do/{$itemId}", [
            'title' => 'Custom Business Software',
            'description' => 'Software tailored to business workflows.',
        ])
            ->assertOk()
            ->assertJsonPath('data.title', 'Custom Business Software');

        $this->assertDatabaseHas('what_we_do_items', [
            'id' => $itemId,
            'title' => 'Custom Business Software',
        ]);

        $this->deleteJson("/api/about/what_we_do/{$itemId}")
            ->assertOk()
            ->assertJsonPath('message', 'What We Do item deleted successfully');

        $this->assertDatabaseMissing('what_we_do_items', ['id' => $itemId]);
    }

    public function test_admin_can_create_update_and_delete_why_choose_us_cards(): void
    {
        $this->actingAsAdmin();

        $createResponse = $this->postJson('/api/about/why_choose_us/store', [
            'name' => 'Customer-Centric Approach',
            'description' => 'Solutions focused on customer goals.',
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Customer-Centric Approach');

        $itemId = $createResponse->json('data.id');

        $this->postJson("/api/about/why_choose_us/{$itemId}", [
            'name' => 'Dedicated Support',
            'description' => 'Reliable long-term support.',
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Dedicated Support')
            ->assertJsonPath('data.title', 'Dedicated Support');

        $this->assertDatabaseHas('why_choose_us_items', [
            'id' => $itemId,
            'title' => 'Dedicated Support',
        ]);

        $this->deleteJson("/api/about/why_choose_us/{$itemId}")
            ->assertOk()
            ->assertJsonPath('message', 'Why Choose Us item deleted successfully');

        $this->assertDatabaseMissing('why_choose_us_items', ['id' => $itemId]);
    }

    public function test_card_content_is_validated(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/about/what_we_do/store', [
            'title' => '',
            'description' => '',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'description']);

        $this->postJson('/api/about/why_choose_us/store', [
            'name' => '',
            'description' => '',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'description']);
    }

    private function actingAsAdmin(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
    }
}
