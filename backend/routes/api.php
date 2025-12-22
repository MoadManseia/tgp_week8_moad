<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\UserController;

// User registration
Route::post('/register', [UserController::class, 'register']);
// User login
Route::post('/login', [UserController::class, 'login']);
// Get user profile (protected)
Route::middleware('auth:sanctum')->get('/user', [UserController::class, 'profile']);
