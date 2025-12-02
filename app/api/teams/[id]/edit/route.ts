import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(
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

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string | null;
    const primary_color = formData.get("primary_color") as string;
    const secondary_color = formData.get("secondary_color") as string;
    const is_active = formData.get("is_active") === "true";
    const logoFile = formData.get("logo") as File | null;

    // Get current team data
    const { data: currentTeam } = await supabase
      .from("teams")
      .select("logo_url")
      .eq("id", id)
      .single();

    let logo_url = currentTeam?.logo_url || null;

    // Upload new logo if provided
    if (logoFile) {
      // Delete old logo if it exists
      if (currentTeam?.logo_url) {
        const urlParts = currentTeam.logo_url.split("/");
        const oldFileName = urlParts[urlParts.length - 1];
        await supabase.storage
          .from("team-logos")
          .remove([oldFileName]);
      }

      // Upload new logo
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("team-logos")
        .upload(filePath, logoFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 400 });
      }

      const { data: { publicUrl } } = supabase.storage
        .from("team-logos")
        .getPublicUrl(filePath);

      logo_url = publicUrl;
    }

    // Update team
    const { data, error } = await supabase
      .from("teams")
      .update({
        name,
        slug,
        description,
        primary_color,
        secondary_color,
        logo_url,
        is_active,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
