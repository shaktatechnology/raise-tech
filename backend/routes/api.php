<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\AboutController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\SoftwareController;

//public endpoints
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/settings', [SettingController::class, 'index']);
Route::post('/inquiry', [ContactController::class, 'store']);
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/about', [AboutController::class,'index']);
Route::get('/team', [TeamController::class, 'index']);
Route::get('/software', [SoftwareController::class, 'index']);


//Authenticated endpoints
Route::middleware('auth:sanctum')->group(function() {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    //settings
    Route::post('/settings', [SettingController::class, 'update']);

    //inquiries
    Route::get('/inquiries', [ContactController::class, 'index']);
    Route::delete('/inquiries/{contact}', [ContactController::class, 'destroy']);
    Route::post('/inquiries/{contact}/read', [ContactController::class, 'markAsRead']);
    Route::get('/inquiries/unread', [ContactController::class, 'unreadCount']);

    //services
    Route::post('/services/header', [ServiceController::class, 'updateHeader']);
    Route::post('/services', [ServiceController::class, 'store']);
    Route::post('/services/{service}', [ServiceController::class, 'update']);
    Route::delete('/services/{service}', [ServiceController::class, 'destroy']);

    //About
    Route::post('/about/update', [AboutController::class,'updateAbout']);
    Route::post('/about/what_we_do/store', [AboutController::class,'storeWhatWeDo']);
    Route::post('/about/why_choose_us/store', [AboutController::class,'storeWhyChooseUs']);

    //Team
    Route::post('/team', [TeamController::class, 'store']);
    Route::post('/team/{team}', [TeamController::class, 'update']);
    Route::delete('/team/{team}', [TeamController::class, 'destroy']);

    //Software
    Route::post('/software/section', [SoftwareController::class, 'updateSection']);
    Route::post('/software', [SoftwareController::class, 'store']);
    Route::post('/software/{software}', [SoftwareController::class, 'update']);
    Route::delete('/software/{software}', [SoftwareController::class, 'destroy']);
});
