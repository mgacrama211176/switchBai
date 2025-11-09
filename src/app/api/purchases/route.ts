import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PurchaseModel from "@/models/Purchase";
import GameModel from "@/models/Game";
import { generateOrderNumber } from "@/lib/purchase-form-utils";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "customerName",
      "games",
      "paymentMethod",
      "orderSource",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        body[field] === undefined || body[field] === null || body[field] === "",
    );
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields,
        },
        { status: 400 },
      );
    }

    // Validate deliveryFee (can be 0, but must be a number)
    if (
      body.deliveryFee === undefined ||
      body.deliveryFee === null ||
      typeof body.deliveryFee !== "number"
    ) {
      return NextResponse.json(
        { error: "Delivery fee must be a number" },
        { status: 400 },
      );
    }

    // Validate games array
    if (!Array.isArray(body.games) || body.games.length === 0) {
      return NextResponse.json(
        { error: "At least one game is required" },
        { status: 400 },
      );
    }

    // Validate each game and check stock availability
    for (const game of body.games) {
      if (
        !game.gameBarcode ||
        !game.gameTitle ||
        !game.gamePrice ||
        !game.quantity
      ) {
        return NextResponse.json(
          { error: "Each game must have barcode, title, price, and quantity" },
          { status: 400 },
        );
      }

      // Check stock availability
      const gameDoc = await GameModel.findOne({
        gameBarcode: game.gameBarcode,
      });

      if (!gameDoc) {
        return NextResponse.json(
          { error: `Game with barcode ${game.gameBarcode} not found` },
          { status: 404 },
        );
      }

      if (gameDoc.gameAvailableStocks < game.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${game.gameTitle}. Available: ${gameDoc.gameAvailableStocks}, Requested: ${game.quantity}`,
          },
          { status: 400 },
        );
      }
    }

    // Calculate subtotal from all games, using sale price if game is on sale
    const subtotal = await body.games.reduce(
      async (sumPromise: Promise<number>, game: any) => {
        const sum = await sumPromise;
        const gameDoc = await GameModel.findOne({
          gameBarcode: game.gameBarcode,
        });
        const priceToUse =
          gameDoc?.isOnSale && gameDoc?.salePrice
            ? gameDoc.salePrice
            : game.gamePrice;
        return sum + priceToUse * game.quantity;
      },
      Promise.resolve(0),
    );

    // Calculate total amount
    const totalAmount = subtotal + (body.deliveryFee || 0);

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create purchase document
    const purchase = new PurchaseModel({
      // Reference
      orderNumber,

      // Customer details
      customerName: body.customerName,
      customerPhone: body.customerPhone?.trim() || undefined,
      customerEmail: body.customerEmail?.trim()?.toLowerCase() || undefined,
      customerFacebookUrl: body.customerFacebookUrl || undefined,

      // Game details (array) - use sale price if game is on sale
      games: await Promise.all(
        body.games.map(async (game: any) => {
          const gameDoc = await GameModel.findOne({
            gameBarcode: game.gameBarcode,
          });
          const priceToUse =
            gameDoc?.isOnSale && gameDoc?.salePrice
              ? gameDoc.salePrice
              : game.gamePrice;
          return {
            gameBarcode: game.gameBarcode,
            gameTitle: game.gameTitle,
            gamePrice: priceToUse,
            quantity: game.quantity,
          };
        }),
      ),

      // Delivery details
      deliveryAddress: body.deliveryAddress?.trim() || undefined,
      deliveryCity: body.deliveryCity?.trim() || undefined,
      deliveryLandmark: body.deliveryLandmark?.trim() || undefined,
      deliveryNotes: body.deliveryNotes?.trim() || undefined,

      // Payment details
      paymentMethod: body.paymentMethod,
      subtotal,
      deliveryFee: body.deliveryFee || 0,
      totalAmount,

      // Metadata
      orderSource: body.orderSource,
      createdBy: body.createdBy || undefined,
      adminNotes: body.adminNotes || undefined,

      // Status
      status:
        body.status ||
        (body.orderSource === "manual" ? "confirmed" : "pending"),
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
        { "games.gameTitle": searchRegex },
        { "games.gameBarcode": searchRegex },
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
