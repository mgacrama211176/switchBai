import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import RentalModel from "@/models/Rental";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Rental ID is required" },
        { status: 400 },
      );
    }

    const { status, notes } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "active",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Find the rental
    const rental = await RentalModel.findById(id);
    if (!rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }

    // Check valid status transitions
    const validTransitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["active", "cancelled"],
      active: ["completed", "cancelled"],
      completed: [], // Terminal state
      cancelled: [], // Terminal state
    };

    const currentStatus = rental.status;
    const availableTransitions = validTransitions[currentStatus] || [];

    if (status !== currentStatus && !availableTransitions.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status transition",
          currentStatus,
          availableTransitions,
        },
        { status: 400 },
      );
    }

    // Update the rental status
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Set confirmedAt timestamp if transitioning to confirmed
    if (status === "confirmed" && currentStatus === "pending") {
      updateData.confirmedAt = new Date();
    }

    // Add notes if provided
    if (notes && notes.trim()) {
      updateData.statusNotes = notes.trim();
    }

    const updatedRental = await RentalModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json({
      success: true,
      rental: updatedRental,
      message: "Rental status updated successfully",
    });
  } catch (error) {
    console.error("Error updating rental status:", error);
    return NextResponse.json(
      { error: "Failed to update rental status" },
      { status: 500 },
    );
  }
}
