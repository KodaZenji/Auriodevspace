import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET() {
  try {
    // Create Supabase client using cookies (reads logged-in user)
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { admin: false, reason: "Not logged in" },
        { status: 401 }
      );
    }

    // Check if user exists in the admins table
    const { data: adminData, error } = await supabase
      .from("admins")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { admin: false, error: error.message },
        { status: 500 }
      );
    }

    if (!adminData) {
      return NextResponse.json(
        { admin: false, reason: "Not an admin" },
        { status: 403 }
      );
    }

    return NextResponse.json({ admin: true });
  } catch (err) {
    return NextResponse.json(
      { admin: false, error: err.message },
      { status: 500 }
    );
  }
}
