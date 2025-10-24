import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PurchaseModel from "@/models/Purchase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Purchase ID is required" },
        { status: 400 },
      );
    }

    const purchase = await PurchaseModel.findById(id);

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: purchase });
  } catch (error) {
    console.error("Error fetching purchase by ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase details" },
      { status: 500 },
    );
  }
}
