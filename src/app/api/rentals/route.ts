import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import RentalModel from "@/models/Rental";
import { generateReferenceNumber } from "@/lib/rental-form-utils";
import { sendTelegramNotification } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "customerName",
      "customerPhone",
      "customerEmail",
      "customerIdImageUrl",
      "gameBarcode",
      "gameTitle",
      "gamePrice",
      "startDate",
      "endDate",
      "rentalDays",
      "deliveryAddress",
      "deliveryCity",
      "deliveryLandmark",
      "rentalFee",
      "deposit",
      "totalDue",
      "appliedPlan",
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

    // Generate reference number
    const referenceNumber = generateReferenceNumber();

    // Create rental document
    const rental = new RentalModel({
      // Reference number
      referenceNumber,

      // Customer details
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      customerFacebookUrl: body.customerFacebookUrl || undefined,
      customerIdImageUrl: body.customerIdImageUrl,

      // Game details
      gameBarcode: body.gameBarcode,
      gameTitle: body.gameTitle,
      gamePrice: body.gamePrice,

      // Rental details
      startDate: body.startDate,
      endDate: body.endDate,
      rentalDays: body.rentalDays,

      // Delivery details
      deliveryAddress: body.deliveryAddress,
      deliveryCity: body.deliveryCity,
      deliveryLandmark: body.deliveryLandmark,
      deliveryNotes: body.deliveryNotes || undefined,

      // Pricing details
      rentalFee: body.rentalFee,
      deposit: body.deposit,
      totalDue: body.totalDue,
      appliedPlan: body.appliedPlan,

      // Status
      status: "pending",
      submittedAt: new Date(),
    });

    await rental.save();

    // Send Telegram notification (non-blocking)
    sendTelegramNotification({
      orderType: "rental",
      orderNumber: rental.referenceNumber,
      customerName: rental.customerName,
      customerPhone: rental.customerPhone,
      items: [
        {
          gameTitle: rental.gameTitle,
          gamePrice: rental.gamePrice,
          quantity: 1,
        },
      ],
      subtotal: rental.rentalFee + rental.deposit,
      totalAmount: rental.totalDue,
      paymentMethod: "Rental",
      status: rental.status,
      rentalDates: {
        startDate: rental.startDate,
        endDate: rental.endDate,
        rentalDays: rental.rentalDays,
      },
    }).catch((error) => {
      console.error("Failed to send Telegram notification:", error);
    });

    return NextResponse.json({
      success: true,
      rentalId: rental._id.toString(),
      referenceNumber: rental.referenceNumber,
      message: "Rental request submitted successfully",
    });
  } catch (error) {
    console.error("Rental submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit rental request" },
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
        { referenceNumber: searchRegex },
        { customerName: searchRegex },
        { customerEmail: searchRegex },
        { gameTitle: searchRegex },
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const rentals = await RentalModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await RentalModel.countDocuments(query);

    return NextResponse.json({
      success: true,
      rentals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching rentals:", error);
    return NextResponse.json(
      { error: "Failed to fetch rentals" },
      { status: 500 },
    );
  }
}
