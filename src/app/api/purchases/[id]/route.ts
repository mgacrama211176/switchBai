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
        { error: "Purchase ID is required" },
        { status: 400 },
      );
    }

    // Find the order
    const order = await PurchaseModel.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Validate customerName if provided (required field)
    if (body.customerName !== undefined) {
      if (!body.customerName || body.customerName.trim().length < 2) {
        return NextResponse.json(
          { error: "Customer name must be at least 2 characters" },
          { status: 400 },
        );
      }
    }

    // Validate phone if provided
    if (body.customerPhone !== undefined && body.customerPhone.trim()) {
      const phoneRegex = /^(\+639|09)\d{9}$/;
      const cleanPhone = body.customerPhone.replace(/[-\s]/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        return NextResponse.json(
          { error: "Please enter a valid Philippine phone number" },
          { status: 400 },
        );
      }
    }

    // Validate email if provided
    if (body.customerEmail !== undefined && body.customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.customerEmail.trim())) {
        return NextResponse.json(
          { error: "Please enter a valid email address" },
          { status: 400 },
        );
      }
    }

    // Validate Facebook URL if provided
    if (
      body.customerFacebookUrl !== undefined &&
      body.customerFacebookUrl.trim()
    ) {
      try {
        new URL(body.customerFacebookUrl);
      } catch {
        return NextResponse.json(
          { error: "Please enter a valid Facebook URL" },
          { status: 400 },
        );
      }
    }

    // Validate address fields (all or none)
    const hasAddress =
      body.deliveryAddress?.trim() ||
      body.deliveryCity?.trim() ||
      body.deliveryLandmark?.trim();
    if (hasAddress) {
      if (
        !body.deliveryAddress?.trim() ||
        body.deliveryAddress.trim().length < 10
      ) {
        return NextResponse.json(
          { error: "If providing address, it must be at least 10 characters" },
          { status: 400 },
        );
      }
      if (!body.deliveryCity?.trim() || body.deliveryCity.trim().length < 2) {
        return NextResponse.json(
          { error: "If providing address, city must be at least 2 characters" },
          { status: 400 },
        );
      }
      if (
        !body.deliveryLandmark?.trim() ||
        body.deliveryLandmark.trim().length < 3
      ) {
        return NextResponse.json(
          {
            error:
              "If providing address, landmark must be at least 3 characters",
          },
          { status: 400 },
        );
      }
    }

    // Validate deliveryFee if provided
    if (body.deliveryFee !== undefined) {
      if (typeof body.deliveryFee !== "number" || body.deliveryFee < 0) {
        return NextResponse.json(
          { error: "Delivery fee must be a number >= 0" },
          { status: 400 },
        );
      }
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

    // Delivery details
    if (body.deliveryAddress !== undefined) {
      updateData.deliveryAddress = body.deliveryAddress.trim() || undefined;
    }
    if (body.deliveryCity !== undefined) {
      updateData.deliveryCity = body.deliveryCity.trim() || undefined;
    }
    if (body.deliveryLandmark !== undefined) {
      updateData.deliveryLandmark = body.deliveryLandmark.trim() || undefined;
    }
    if (body.deliveryNotes !== undefined) {
      updateData.deliveryNotes = body.deliveryNotes.trim() || undefined;
    }

    // Payment details
    if (body.paymentMethod !== undefined) {
      const validPaymentMethods = ["cod", "bank_transfer", "gcash", "cash"];
      if (!validPaymentMethods.includes(body.paymentMethod)) {
        return NextResponse.json(
          { error: "Invalid payment method" },
          { status: 400 },
        );
      }
      updateData.paymentMethod = body.paymentMethod;
    }

    // Recalculate totalAmount if deliveryFee or subtotal changes
    if (body.deliveryFee !== undefined) {
      updateData.deliveryFee = body.deliveryFee;
      updateData.totalAmount = order.subtotal + body.deliveryFee;
    }

    // Update the order
    const updatedOrder = await PurchaseModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Order details updated successfully",
    });
  } catch (error) {
    console.error("Error updating order details:", error);
    return NextResponse.json(
      { error: "Failed to update order details" },
      { status: 500 },
    );
  }
}
