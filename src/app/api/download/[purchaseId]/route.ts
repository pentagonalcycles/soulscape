import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ purchaseId: string }> }
) {
  const { purchaseId } = await params;
  const client = supabase();
  const { data: { user } } = await client.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: download } = await client
    .from("downloads")
    .select("*, purchases(user_id), products(download_url, title)")
    .eq("id", purchaseId)
    .single();

  if (!download || download.purchases.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await client
    .from("downloads")
    .update({
      download_count: download.download_count + 1,
      last_accessed: new Date().toISOString(),
    })
    .eq("id", download.id);

  if (download.products.download_url) {
    return NextResponse.json({
      url: download.products.download_url,
      title: download.products.title,
    });
  }

  return NextResponse.json({ error: "No download available" }, { status: 404 });
}
