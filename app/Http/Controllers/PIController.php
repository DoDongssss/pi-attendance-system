<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePIRequest;
use App\Http\Requests\UpdatePIRequest;
use App\Models\PersonOfInterest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PIController extends Controller
{
    public function index(Request $request)
    {
        $pis = PersonOfInterest::query()
            ->when($request->search, fn($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%")
            )
            ->when($request->status, fn($q) =>
                $q->where('status', $request->status)
            )
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('PI/index', [
            'pis'     => $pis,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(StorePIRequest $request)
    {
        PersonOfInterest::create($request->validated());
        return back()->with('success', 'Person of Interest created successfully.');
    }

    public function update(UpdatePIRequest $request, PersonOfInterest $pi)
    {
        $pi->update($request->validated());
        return back()->with('success', 'Person of Interest updated successfully.');
    }

    public function destroy(PersonOfInterest $pi)
    {
        $pi->delete();
        return back()->with('success', 'Person of Interest archived successfully.');
    }

    public function restore(int $id)
    {
        $pi = PersonOfInterest::withTrashed()->findOrFail($id);
        $pi->restore();
        return back()->with('success', 'Person of Interest restored successfully.');
    }
}