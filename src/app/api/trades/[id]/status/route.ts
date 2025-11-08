import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import TradeModel from "@/models/Trade";
import GameModel from "@/models/Game";

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
        { error: "Trade ID is required" },
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

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Find the trade
    const trade = await TradeModel.findById(id);
    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    // Check valid status transitions
    const validTransitions: Record<string, string[]> = {
      pending: ["confirmed", "completed", "cancelled"],
      confirmed: ["completed", "cancelled"],
      completed: [], // Terminal state
      cancelled: [], // Terminal state
    };

    const currentStatus = trade.status;
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

    // Update the trade status
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Set timestamps based on status
    if (status === "confirmed" && !trade.confirmedAt) {
      updateData.confirmedAt = new Date();
    }
    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    // Add admin notes if provided
    if (notes) {
      updateData.adminNotes = notes;
    }

    // If status is changing to "completed", handle inventory updates
    if (status === "completed" && currentStatus !== "completed") {
      // Process games given (add to inventory)
      for (const gameItem of trade.gamesGiven) {
        if (gameItem.isNewGame && gameItem.newGameDetails) {
          // Check if game already exists (might have been created)
          const existingGame = await GameModel.findOne({
            gameBarcode: gameItem.gameBarcode,
          });

          if (existingGame) {
            // Game exists, increment stock
            existingGame.gameAvailableStocks += gameItem.quantity;
            await existingGame.save();
          } else {
            // Create new game entry
            const newGame = new GameModel({
              gameBarcode: gameItem.gameBarcode,
              gameTitle: gameItem.gameTitle,
              gamePrice: gameItem.gamePrice,
              gamePlatform: gameItem.newGameDetails.gamePlatform,
              gameRatings: gameItem.newGameDetails.gameRatings,
              gameDescription: gameItem.newGameDetails.gameDescription,
              gameImageURL: gameItem.newGameDetails.gameImageURL,
              gameCategory: gameItem.newGameDetails.gameCategory,
              gameReleaseDate: gameItem.newGameDetails.gameReleaseDate,
              gameAvailableStocks: gameItem.quantity,
              numberOfSold: 0,
              rentalAvailable: false,
              tradable: true,
            });

            await newGame.save();
          }
        } else {
          // Game exists, increment stock
          const game = await GameModel.findOne({
            gameBarcode: gameItem.gameBarcode,
          });

          if (game) {
            game.gameAvailableStocks += gameItem.quantity;
            await game.save();
          } else {
            // Game not found but wasn't marked as new - log warning but continue
            console.warn(
              `Game ${gameItem.gameBarcode} not found but not marked as new`,
            );
          }
        }
      }

      // Process games received (deduct from inventory)
      for (const gameItem of trade.gamesReceived) {
        const game = await GameModel.findOne({
          gameBarcode: gameItem.gameBarcode,
        });

        if (!game) {
          return NextResponse.json(
            {
              error: `Game with barcode ${gameItem.gameBarcode} not found`,
            },
            { status: 404 },
          );
        }

        // Check if stock is sufficient
        if (game.gameAvailableStocks < gameItem.quantity) {
          return NextResponse.json(
            {
              error: `Insufficient stock for ${gameItem.gameTitle}. Available: ${game.gameAvailableStocks}, Required: ${gameItem.quantity}`,
            },
            { status: 400 },
          );
        }

        // Deduct stock and increment sold count
        game.gameAvailableStocks -= gameItem.quantity;
        game.numberOfSold = (game.numberOfSold || 0) + gameItem.quantity;

        await game.save();
      }
    }

    // Update the trade
    const updatedTrade = await TradeModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      trade: updatedTrade,
      message: "Trade status updated successfully",
    });
  } catch (error) {
    console.error("Error updating trade status:", error);
    return NextResponse.json(
      { error: "Failed to update trade status" },
      { status: 500 },
    );
  }
}
