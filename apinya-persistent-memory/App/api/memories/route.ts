import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const USER_ID =
  process.env.APINYA_USER_ID ||
  "00000000-0000-0000-0000-000000000001";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("memories")
    .select("id, content, memory_type, importance, confidence, created_at")
    .eq("user_id", USER_ID)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ memories: data || [] });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("memories")
    .update({ is_deleted: true })
    .eq("id", id)
    .eq("user_id", USER_ID);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}