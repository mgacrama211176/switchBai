import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import TradeModel from "@/models/Trade";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Trade ID is required" },
        { status: 400 },
      );
    }

    const trade = await TradeModel.findById(id);

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: trade });
  } catch (error) {
    console.error("Error fetching trade by ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch trade details" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Trade ID is required" },
        { status: 400 },
      );
    }

    const trade = await TradeModel.findById(id);
    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Customer details
    if (body.customerName !== undefined) {
      updateData.customerName = body.customerName.trim();
    }
    if (body.customerPhone !== undefined) {
      updateData.customerPhone = body.customerPhone.trim() || undefined;
    }
    if (body.customerEmail !== undefined) {
      updateData.customerEmail = body.customerEmail.trim()
        ? body.customerEmail.trim().toLowerCase()
        : undefined;
    }
    if (body.customerFacebookUrl !== undefined) {
      updateData.customerFacebookUrl =
        body.customerFacebookUrl.trim() || undefined;
    }

    // Trade details
    if (body.tradeLocation !== undefined) {
      updateData.tradeLocation = body.tradeLocation.trim() || undefined;
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes.trim() || undefined;
    }
    if (body.adminNotes !== undefined) {
      updateData.adminNotes = body.adminNotes.trim() || undefined;
    }

    // Update the trade
    const updatedTrade = await TradeModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      trade: updatedTrade,
      message: "Trade details updated successfully",
    });
  } catch (error) {
    console.error("Error updating trade details:", error);
    return NextResponse.json(
      { error: "Failed to update trade details" },
      { status: 500 },
    );
  }
}
