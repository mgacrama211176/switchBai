import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PurchaseModel from "@/models/Purchase";
import { generateOrderNumber } from "@/lib/purchase-form-utils";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "customerName",
      "customerPhone",
      "customerEmail",
      "gameBarcode",
      "gameTitle",
      "gamePrice",
      "quantity",
      "deliveryAddress",
      "deliveryCity",
      "deliveryLandmark",
      "paymentMethod",
      "subtotal",
      "deliveryFee",
      "totalAmount",
      "orderSource",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields,
        },
        { status: 400 },
      );
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create purchase document
    const purchase = new PurchaseModel({
      // Reference
      orderNumber,

      // Customer details
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      customerFacebookUrl: body.customerFacebookUrl || undefined,

      // Game details
      gameBarcode: body.gameBarcode,
      gameTitle: body.gameTitle,
      gamePrice: body.gamePrice,
      quantity: body.quantity,

      // Delivery details
      deliveryAddress: body.deliveryAddress,
      deliveryCity: body.deliveryCity,
      deliveryLandmark: body.deliveryLandmark,
      deliveryNotes: body.deliveryNotes || undefined,

      // Payment details
      paymentMethod: body.paymentMethod,
      subtotal: body.subtotal,
      deliveryFee: body.deliveryFee,
      totalAmount: body.totalAmount,

      // Metadata
      orderSource: body.orderSource,
      createdBy: body.createdBy || undefined,
      adminNotes: body.adminNotes || undefined,

      // Status
      status: body.orderSource === "manual" ? "confirmed" : "pending",
      submittedAt: new Date(),
    });

    await purchase.save();

    return NextResponse.json({
      success: true,
      purchaseId: purchase._id.toString(),
      orderNumber: purchase.orderNumber,
      message: "Purchase order submitted successfully",
    });
  } catch (error) {
    console.error("Purchase submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit purchase order" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const orderSource = searchParams.get("orderSource");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const sortBy = searchParams.get("sortBy") || "submittedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query
    const query: any = {};

    // Status filter
    if (status) {
      query.status = status;
    }

    // Order source filter
    if (orderSource) {
      query.orderSource = orderSource;
    }

    // Date range filter
    if (startDate || endDate) {
      query.submittedAt = {};
      if (startDate) {
        query.submittedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.submittedAt.$lte = new Date(endDate);
      }
    }

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { orderNumber: searchRegex },
        { customerName: searchRegex },
        { customerEmail: searchRegex },
        { gameTitle: searchRegex },
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const purchases = await PurchaseModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await PurchaseModel.countDocuments(query);

    return NextResponse.json({
      success: true,
      purchases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 },
    );
  }
}
