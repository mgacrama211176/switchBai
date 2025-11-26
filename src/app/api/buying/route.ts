import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BuyingModel from "@/models/Buying";
import GameModel from "@/models/Game";
import {
  generatePurchaseReference,
  calculatePurchaseMetrics,
} from "@/lib/buying-utils";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const supplier = searchParams.get("supplier");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (supplier) {
      query.supplierName = { $regex: supplier, $options: "i" };
    }

    if (dateFrom || dateTo) {
      query.purchasedAt = {};
      if (dateFrom) {
        query.purchasedAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.purchasedAt.$lte = endDate;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch purchases
    const purchases = await BuyingModel.find(query)
      .sort({ purchasedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await BuyingModel.countDocuments(query);

    return NextResponse.json({
      purchases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    if (!body.games || !Array.isArray(body.games) || body.games.length === 0) {
      return NextResponse.json(
        { error: "At least one game is required" },
        { status: 400 },
      );
    }

    if (!body.totalCost || body.totalCost <= 0) {
      return NextResponse.json(
        { error: "Total cost must be greater than 0" },
        { status: 400 },
      );
    }

    // Validate each game
    for (let i = 0; i < body.games.length; i++) {
      const game = body.games[i];

      if (!game.gameBarcode || !game.gameTitle) {
        return NextResponse.json(
          { error: `Game ${i + 1}: Barcode and title are required` },
          { status: 400 },
        );
      }

      if (!game.sellingPrice || game.sellingPrice <= 0) {
        return NextResponse.json(
          { error: `Game ${i + 1}: Selling price must be greater than 0` },
          { status: 400 },
        );
      }

      if (!game.quantity || game.quantity <= 0) {
        return NextResponse.json(
          { error: `Game ${i + 1}: Quantity must be greater than 0` },
          { status: 400 },
        );
      }

      // For existing games, verify they exist
      if (!game.isNewGame) {
        const existingGame = await GameModel.findOne({
          gameBarcode: game.gameBarcode,
        });

        if (!existingGame) {
          return NextResponse.json(
            {
              error: `Game ${i + 1}: Game with barcode ${game.gameBarcode} not found`,
            },
            { status: 404 },
          );
        }
      } else {
        // For new games, verify barcode doesn't exist
        const existingGame = await GameModel.findOne({
          gameBarcode: game.gameBarcode,
        });

        if (existingGame) {
          return NextResponse.json(
            {
              error: `Game ${i + 1}: Barcode ${game.gameBarcode} already exists. Please use existing game mode.`,
            },
            { status: 400 },
          );
        }

        // Validate new game details
        if (!game.newGameDetails) {
          return NextResponse.json(
            { error: `Game ${i + 1}: New game details are required` },
            { status: 400 },
          );
        }

        const details = game.newGameDetails;
        if (
          !details.gamePlatform ||
          !details.gameRatings ||
          !details.gameDescription ||
          !details.gameImageURL ||
          !details.gameCategory ||
          !details.gameReleaseDate
        ) {
          return NextResponse.json(
            {
              error: `Game ${i + 1}: All new game fields are required (platform, ratings, description, image, category, release date)`,
            },
            { status: 400 },
          );
        }
      }
    }

    // Calculate financial metrics
    const { totalExpectedRevenue, totalExpectedProfit, profitMargin } =
      calculatePurchaseMetrics(body.games, body.totalCost);

    // Generate sequential purchase reference
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const datePrefix = `BUY-${year}${month}${day}-`;

    // Find the last purchase reference for today
    const lastPurchase = await BuyingModel.findOne({
      purchaseReference: { $regex: `^${datePrefix}` },
    })
      .sort({ purchaseReference: -1 })
      .lean();

    let sequenceNumber = 1;
    if (
      lastPurchase &&
      !Array.isArray(lastPurchase) &&
      lastPurchase.purchaseReference
    ) {
      // Extract the sequence number from the last reference
      const lastSeq = parseInt(
        lastPurchase.purchaseReference.replace(datePrefix, ""),
      );
      if (!isNaN(lastSeq)) {
        sequenceNumber = lastSeq + 1;
      }
    }

    const purchaseReference = `${datePrefix}${String(sequenceNumber).padStart(
      3,
      "0",
    )}`;

    // Calculate average cost price per game
    // For simplicity, we'll use: totalCost / totalQuantity
    const totalQuantity = body.games.reduce(
      (sum: number, game: { quantity: number }) => sum + game.quantity,
      0,
    );
    const averageCostPerUnit =
      totalQuantity > 0 ? body.totalCost / totalQuantity : 0;

    // Process games and update stock (only if status is "completed")
    // Note: According to plan, stock updates only when status changes to "completed"
    // So we won't update stock here, only when status is changed to "completed"
    if (body.status === "completed") {
      for (const game of body.games) {
        // Calculate cost price for this game (proportional to quantity)
        const gameCostPrice = averageCostPerUnit;

        // Get variant (default to "withCase" when adding inventory)
        const variant = game.variant || "withCase";

        if (game.isNewGame) {
          // Create new game with initial stock and cost price
          await GameModel.create({
            gameBarcode: game.gameBarcode,
            gameTitle: game.gameTitle,
            gamePlatform: game.newGameDetails.gamePlatform,
            gameRatings: game.newGameDetails.gameRatings,
            gameDescription: game.newGameDetails.gameDescription,
            gameImageURL: game.newGameDetails.gameImageURL,
            gameCategory: game.newGameDetails.gameCategory,
            gameReleaseDate: game.newGameDetails.gameReleaseDate,
            gamePrice: game.sellingPrice,
            stockWithCase: variant === "withCase" ? game.quantity : 0,
            stockCartridgeOnly: variant === "cartridgeOnly" ? game.quantity : 0,
            costPrice: gameCostPrice,
            tradable: game.newGameDetails.tradable ?? true,
            rentalAvailable: game.newGameDetails.rentalAvailable ?? false,
            rentalWeeklyRate: game.newGameDetails.rentalWeeklyRate || 0,
            class: game.newGameDetails.class || "",
          });
        } else {
          // For existing games, update cost price using weighted average
          // if game already has a cost price, calculate new average
          const existingGame = await GameModel.findOne({
            gameBarcode: game.gameBarcode,
          });

          if (existingGame) {
            const existingStock =
              (existingGame.stockWithCase || 0) +
              (existingGame.stockCartridgeOnly || 0);
            const existingCost = existingGame.costPrice || 0;
            const newStock = existingStock + game.quantity;

            // Calculate weighted average cost price
            let newCostPrice = gameCostPrice;
            if (existingStock > 0 && existingCost > 0) {
              // Weighted average: (oldCost * oldStock + newCost * newQuantity) / totalStock
              newCostPrice =
                (existingCost * existingStock + gameCostPrice * game.quantity) /
                newStock;
            }

            // Increment variant-specific stock and update cost price
            const updateField =
              variant === "cartridgeOnly"
                ? "stockCartridgeOnly"
                : "stockWithCase";
            await GameModel.findOneAndUpdate(
              { gameBarcode: game.gameBarcode },
              {
                $inc: { [updateField]: game.quantity },
                $set: { costPrice: newCostPrice },
              },
            );
          } else {
            // Game not found, just increment stock (shouldn't happen due to validation)
            const updateField =
              variant === "cartridgeOnly"
                ? "stockCartridgeOnly"
                : "stockWithCase";
            await GameModel.findOneAndUpdate(
              { gameBarcode: game.gameBarcode },
              {
                $inc: { [updateField]: game.quantity },
                $set: { costPrice: gameCostPrice },
              },
            );
          }
        }
      }
    }

    // Create buying record
    const buying = new BuyingModel({
      purchaseReference,
      supplierName: body.supplierName?.trim() || undefined,
      supplierContact: body.supplierContact?.trim() || undefined,
      supplierNotes: body.supplierNotes?.trim() || undefined,
      games: body.games.map((game: any) => ({
        gameBarcode: game.gameBarcode,
        gameTitle: game.gameTitle,
        sellingPrice: game.sellingPrice,
        quantity: game.quantity,
        isNewGame: game.isNewGame,
        newGameDetails: game.isNewGame ? game.newGameDetails : undefined,
      })),
      totalCost: body.totalCost,
      totalExpectedRevenue,
      totalExpectedProfit,
      profitMargin,
      status: body.status || "pending",
      purchasedAt: body.purchasedAt ? new Date(body.purchasedAt) : new Date(),
      completedAt: body.status === "completed" ? new Date() : undefined,
      adminNotes: body.adminNotes?.trim() || undefined,
    });

    await buying.save();

    return NextResponse.json(
      {
        message: "Purchase created successfully",
        purchase: buying.toJSON(),
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Failed to create purchase", details: error.message },
      { status: 500 },
    );
  }
}
