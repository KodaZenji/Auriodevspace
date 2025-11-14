import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // 1️⃣ Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2️⃣ Verify user is admin
    const { data: adminRow, error: adminErr } = await supabase
      .from("admins")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminErr || !adminRow) {
      return NextResponse.json({ error: "Not an admin" }, { status: 403 });
    }

    // 3️⃣ Get handle from request
    const { handle } = await request.json();
    if (!handle) {
      return NextResponse.json({ error: "Handle required" }, { status: 400 });
    }

    // 4️⃣ Add account using SERVICE ROLE KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await fetch(`${supabaseUrl}/rest/v1/accounts`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        handle: handle,
        twitter_link: `https://x.com/${handle}`,
        image_url: `https://unavatar.io/twitter/${handle}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}