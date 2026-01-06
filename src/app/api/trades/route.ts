import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import TradeModel from "@/models/Trade";
import GameModel from "@/models/Game";
import {
  generateTradeReferenceNumber,
  calculateGamesValue,
  calculateTradeCashDifference,
} from "@/lib/trade-utils";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["customerName", "gamesGiven", "gamesReceived"];

    const missingFields = requiredFields.filter(
      (field) =>
        body[field] === undefined ||
        body[field] === null ||
        (Array.isArray(body[field]) && body[field].length === 0),
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

    // Validate games arrays
    if (!Array.isArray(body.gamesGiven) || body.gamesGiven.length === 0) {
      return NextResponse.json(
        { error: "At least one game given is required" },
        { status: 400 },
      );
    }

    if (!Array.isArray(body.gamesReceived) || body.gamesReceived.length === 0) {
      return NextResponse.json(
        { error: "At least one game received is required" },
        { status: 400 },
      );
    }

    // Validate and check stock for games received
    for (const game of body.gamesReceived) {
      const gameDoc = await GameModel.findOne({
        gameBarcode: game.gameBarcode,
      });

      if (!gameDoc) {
        return NextResponse.json(
          {
            error: `Game ${game.gameTitle} (${game.gameBarcode}) not found in inventory`,
          },
          { status: 404 },
        );
      }

      // Get variant-specific stock (default to "withCase" if not specified)
      const variant = game.variant || "withCase";
      const variantStock =
        variant === "cartridgeOnly"
          ? (gameDoc.stockCartridgeOnly ?? 0)
          : (gameDoc.stockWithCase ?? 0);

      if (variantStock < game.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${game.gameTitle} (${variant}). Available: ${variantStock}, Requested: ${game.quantity}`,
          },
          { status: 400 },
        );
      }
    }

    // Calculate values - for trade transactions, always use original price, not sale price
    const totalValueGiven = await Promise.all(
      body.gamesGiven.map(async (game: any) => {
        if (game.isNewGame) {
          return game.gamePrice * game.quantity;
        }
        // Always use original gamePrice for trade valuations
        return game.gamePrice * game.quantity;
      }),
    ).then((values) => values.reduce((sum, val) => sum + val, 0));

    const totalValueReceived = await Promise.all(
      body.gamesReceived.map(async (game: any) => {
        // Always use original gamePrice for trade valuations
        return game.gamePrice * game.quantity;
      }),
    ).then((values) => values.reduce((sum, val) => sum + val, 0));

    // Calculate cash difference and trade fee
    const { cashDifference, tradeFee, tradeType } =
      calculateTradeCashDifference(totalValueGiven, totalValueReceived);

    // Generate trade reference
    const tradeReference = generateTradeReferenceNumber();

    // Create trade document
    const trade = new TradeModel({
      tradeReference,
      customerName: body.customerName.trim(),
      customerPhone: body.customerPhone?.trim() || undefined,
      customerEmail: body.customerEmail?.trim()?.toLowerCase() || undefined,
      customerFacebookUrl: body.customerFacebookUrl?.trim() || undefined,
      gamesGiven: await Promise.all(
        body.gamesGiven.map(async (game: any) => {
          let priceToUse = game.gamePrice;
          if (!game.isNewGame) {
            const gameDoc = await GameModel.findOne({
              gameBarcode: game.gameBarcode,
            });
            priceToUse =
              gameDoc?.isOnSale && gameDoc?.salePrice
                ? gameDoc.salePrice
                : game.gamePrice;
          }
          return {
            gameBarcode: game.gameBarcode,
            gameTitle: game.gameTitle,
            gamePrice: priceToUse,
            quantity: game.quantity,
            isNewGame: game.isNewGame || false,
            newGameDetails: game.newGameDetails || undefined,
          };
        }),
      ),
      gamesReceived: await Promise.all(
        body.gamesReceived.map(async (game: any) => {
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
            variant: game.variant || "withCase", // Include variant from request
          };
        }),
      ),
      tradeLocation: body.tradeLocation?.trim() || undefined,
      notes: body.notes?.trim() || undefined,
      totalValueGiven,
      totalValueReceived,
      cashDifference,
      tradeFee,
      status: body.status || "pending",
      submittedAt: new Date(),
      adminNotes: body.adminNotes?.trim() || undefined,
    });

    await trade.save();

    return NextResponse.json({
      success: true,
      tradeId: trade._id.toString(),
      tradeReference: trade.tradeReference,
      message: "Trade created successfully",
    });
  } catch (error: any) {
    console.error("Trade creation error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Trade reference already exists. Please try again." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create trade" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query: any = {};

    // Search filter
    if (search) {
      query.$or = [
        { tradeReference: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { "gamesGiven.gameTitle": { $regex: search, $options: "i" } },
        { "gamesGiven.gameBarcode": { $regex: search, $options: "i" } },
        { "gamesReceived.gameTitle": { $regex: search, $options: "i" } },
        { "gamesReceived.gameBarcode": { $regex: search, $options: "i" } },
      ];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [trades, total] = await Promise.all([
      TradeModel.find(query)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TradeModel.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      trades,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching trades:", error);
    return NextResponse.json(
      { error: "Failed to fetch trades" },
      { status: 500 },
    );
  }
}
