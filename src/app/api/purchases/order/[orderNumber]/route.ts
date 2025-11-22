import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PurchaseModel from "@/models/Purchase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  try {
    await connectDB();
    const { orderNumber } = await params;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Order number is required" },
        { status: 400 },
      );
    }

    // Convert to uppercase for case-insensitive search
    const upperOrderNumber = orderNumber.toUpperCase().trim();

    // Find purchase by order number
    const purchase = await PurchaseModel.findOne({
      orderNumber: upperOrderNumber,
    }).lean();

    if (!purchase) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Mask phone number - only show last 4 digits
    const maskedPurchase = {
      ...purchase,
      customerPhone: purchase.customerPhone
        ? `****${purchase.customerPhone.slice(-4)}`
        : undefined,
      // Remove Facebook URL for privacy
      customerFacebookUrl: undefined,
    };

    return NextResponse.json({ success: true, data: maskedPurchase });
  } catch (error) {
    console.error("Error fetching purchase by order number:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 },
    );
  }
}
