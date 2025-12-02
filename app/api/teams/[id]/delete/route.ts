import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await supabaseServer();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or staff
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "staff"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get team to find logo URL
    const { data: team } = await supabase
      .from("teams")
      .select("logo_url")
      .eq("id", id)
      .single();

    // Delete logo from storage if it exists
    if (team?.logo_url) {
      const urlParts = team.logo_url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      await supabase.storage
        .from("team-logos")
        .remove([`team-logos/${fileName}`]);
    }

    // Delete team
    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
