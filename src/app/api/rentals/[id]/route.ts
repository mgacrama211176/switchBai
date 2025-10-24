import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import RentalModel from "@/models/Rental";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    const rental = await RentalModel.findById(id).lean();

    if (!rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      rental,
    });
  } catch (error) {
    console.error("Error fetching rental:", error);
    return NextResponse.json(
      { error: "Failed to fetch rental details" },
      { status: 500 },
    );
  }
}
