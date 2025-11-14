import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    //
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 2️⃣ Verify user is actually an admin
    const { data: adminRow, error: adminErr } = await supabase
      .from("admins")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminErr) {
      return NextResponse.json(
        { error: adminErr.message },
        { status: 500 }
      );
    }

    if (!adminRow) {
      return NextResponse.json(
        { error: "Not an admin" },
        { status: 403 }
      );
    }

    // 3️⃣ Get handle from request body
    const { handle } = await request.json();

    if (!handle) {
      return NextResponse.json(
        { error: "Handle is required" },
        { status: 400 }
      );
    }

    // 4️⃣ Use SERVICE ROLE KEY to delete (bypasses RLS safely)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/accounts?handle=eq.${handle}`,
      {
        method: "DELETE",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    return NextResponse.json({ success: true, deleted: handle });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
