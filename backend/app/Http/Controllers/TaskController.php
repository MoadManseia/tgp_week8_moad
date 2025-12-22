<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Get all tasks for the authenticated user.
     */
    public function index(Request $request)
    {
        $tasks = $request->user()->tasks()->latest()->get();
        return response()->json($tasks);
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
