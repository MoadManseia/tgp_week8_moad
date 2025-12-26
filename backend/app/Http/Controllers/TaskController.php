<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Get all tasks for the authenticated user with pagination.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 5); // Default 5 tasks per page
        $page = $request->input('page', 1);
        
        $tasks = $request->user()->tasks()->latest()->paginate($perPage, ['*'], 'page', $page);
        
        return response()->json([
            'data' => $tasks->items(),
            'current_page' => $tasks->currentPage(),
            'last_page' => $tasks->lastPage(),
            'per_page' => $tasks->perPage(),
            'total' => $tasks->total(),
            'from' => $tasks->firstItem(),
            'to' => $tasks->lastItem(),
        ]);
    }

    /**
     * Create a new task for the authenticated user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_completed' => 'boolean',
        ]);

        $task = $request->user()->tasks()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'is_completed' => $validated['is_completed'] ?? false,
        ]);

        return response()->json($task, 201);
    }

    /**
     * Get a specific task.
     */
    public function show(Request $request, $id)
    {
        $task = $request->user()->tasks()->findOrFail($id);
        return response()->json($task);
    }

    /**
     * Update a task.
     */
    public function update(Request $request, $id)
    {
        $task = $request->user()->tasks()->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_completed' => 'sometimes|boolean',
        ]);

        $task->update($validated);

        return response()->json($task);
    }

    /**
     * Delete a task.
     */
    public function destroy(Request $request, $id)
    {
        $task = $request->user()->tasks()->findOrFail($id);
        $task->delete();

        return response()->json(['message' => 'Task deleted successfully'], 200);
    }
}
