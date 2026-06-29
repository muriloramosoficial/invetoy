import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { AdjustmentForm } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body: AdjustmentForm = await req.json();
    const { product_id, type, quantity, location_id, notes, batch, expiration_date } = body;

    // Validate
    if (!product_id || !type || !quantity || !location_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (type === "out" && !notes) {
      return NextResponse.json(
        { error: "Notes are required for exits" },
        { status: 400 }
      );
    }

    // Get product to verify tenant
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("tenant_id")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Get current inventory
    const { data: inventory } = await supabase
      .from("inventory_items")
      .select("id, quantity")
      .eq("product_id", product_id)
      .eq("location_id", location_id)
      .single();

    const currentQty = inventory?.quantity || 0;

    // Calculate new quantity
    let newQuantity = currentQty;
    switch (type) {
      case "in":
        newQuantity = currentQty + quantity;
        break;
      case "out":
        if (currentQty < quantity) {
          return NextResponse.json(
            { error: `Insufficient stock. Available: ${currentQty}, requested: ${quantity}` },
            { status: 400 }
          );
        }
        newQuantity = currentQty - quantity;
        break;
      case "count":
        newQuantity = quantity;
        break;
    }

    // Upsert inventory
    const { error: upsertError } = await supabase.from("inventory_items").upsert(
      {
        id: inventory?.id,
        product_id,
        location_id,
        quantity: newQuantity,
        batch: batch || null,
        expiration_date: expiration_date || null,
      },
      { onConflict: "product_id, location_id" }
    );

    if (upsertError) {
      throw upsertError;
    }

    // Get current user for the movement log
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // Log movement
    const { error: movementError } = await supabase.from("movements").insert({
      tenant_id: product.tenant_id,
      product_id,
      from_location_id: type === "in" ? null : location_id,
      to_location_id: type === "out" ? null : location_id,
      quantity,
      type,
      notes: notes || null,
      user_id: currentUser?.id,
    });

    if (movementError) {
      console.error("Failed to log movement:", movementError);
    }

    return NextResponse.json({
      success: true,
      previous_quantity: currentQty,
      new_quantity: newQuantity,
    });
  } catch (error) {
    console.error("Inventory API error:", error);
    return NextResponse.json(
      { error: "Failed to adjust inventory" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const categoryId = searchParams.get("category_id");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("page_size") || "50");

    let query = supabase
      .from("inventory_items")
      .select(`
        *,
        product:products(*),
        location:locations(*)
      `, { count: "exact" });

    if (search) {
      query = query.ilike("product.name", `%${search}%`);
    }

    if (categoryId) {
      query = query.eq("product.category_id", categoryId);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .order("updated_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      page_size: pageSize,
      total_pages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error("Inventory API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
