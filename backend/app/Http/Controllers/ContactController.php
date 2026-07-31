<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Contact;

class ContactController extends Controller
{
    //submit contact form 'public'
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'contact_no' => 'required|string|max:15',
            'message' => 'required|string|max:2000',
        ]);

        $contact = Contact::create($validated);

        return response()->json([
            'message' =>'Thank you for reaching out ! Your message has been sent successfully.',
            'contact' => $contact,
        ],201);
    }

    //get all inquireis 'admin only'
    public function index()
    {
        $contacts = Contact::latest()->get();

        return response()->json([
            'contacts' => $contacts,
        ]);
    }

    //delete inquiries
    public function destroy(Contact $contact)
    {
        $contact->delete();

        return response()->json([
            'message' => 'Inquiry deleted successfully.',
        ]);
    }

    //mark as read
    public function markAsRead(Contact $contact)
    {
        $contact->update([
            'is_read' => true,
        ]);

        return response()->json([
            'message' => 'Inquiry marked as read.',
            'contact' => $contact,
        ]);
    }

    //get unread count admin
    public function unreadCount()
    {
        $count = Contact::where('is_read',false)->count();

        return response()->json([
            'unread_count' => $count,
        ]);
    }
}
