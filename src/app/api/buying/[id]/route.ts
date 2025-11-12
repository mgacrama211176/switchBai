import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BuyingModel from "@/models/Buying";
import GameModel from "@/models/Game";
import { calculatePurchaseMetrics } from "@/lib/buying-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    const purchase = await BuyingModel.findById(id).lean();

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ purchase });
  } catch (error: any) {
    console.error("Error fetching purchase:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase", details: error.message },
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

    const purchase = await BuyingModel.findById(id);

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 },
      );
    }

    const oldStatus = purchase.status;
    const newStatus = body.status || purchase.status;

    // If status is changing to "completed", update stock and cost price
    if (oldStatus !== "completed" && newStatus === "completed") {
      // Calculate average cost price per game
      const totalQuantity = purchase.games.reduce(
        (sum: number, game: { quantity: number }) => sum + game.quantity,
        0,
      );
      const averageCostPerUnit =
        totalQuantity > 0 ? purchase.totalCost / totalQuantity : 0;

      for (const game of purchase.games) {
        const gameCostPrice = averageCostPerUnit;

        if (game.isNewGame) {
          // Check if game already exists (might have been created manually)
          const existingGame = await GameModel.findOne({
            gameBarcode: game.gameBarcode,
          });

          if (!existingGame) {
            // Create new game with initial stock and cost price
            await GameModel.create({
              gameBarcode: game.gameBarcode,
              gameTitle: game.gameTitle,
              gamePlatform: game.newGameDetails?.gamePlatform || [],
              gameRatings: game.newGameDetails?.gameRatings || "E",
              gameDescription: game.newGameDetails?.gameDescription || "",
              gameImageURL: game.newGameDetails?.gameImageURL || "",
              gameCategory: game.newGameDetails?.gameCategory || "Other",
              gameReleaseDate: game.newGameDetails?.gameReleaseDate || "",
              gamePrice: game.sellingPrice,
              gameAvailableStocks: game.quantity,
              costPrice: gameCostPrice,
              tradable: game.newGameDetails?.tradable ?? true,
              rentalAvailable: game.newGameDetails?.rentalAvailable ?? false,
              rentalWeeklyRate: game.newGameDetails?.rentalWeeklyRate || 0,
              class: game.newGameDetails?.class || "",
            });
          } else {
            // Game exists, update stock and cost price using weighted average
            const existingStock = existingGame.gameAvailableStocks || 0;
            const existingCost = existingGame.costPrice || 0;
            const newStock = existingStock + game.quantity;

            let newCostPrice = gameCostPrice;
            if (existingStock > 0 && existingCost > 0) {
              newCostPrice =
                (existingCost * existingStock + gameCostPrice * game.quantity) /
                newStock;
            }

            await GameModel.findOneAndUpdate(
              { gameBarcode: game.gameBarcode },
              {
                $inc: { gameAvailableStocks: game.quantity },
                $set: { costPrice: newCostPrice },
              },
            );
          }
        } else {
          // Increment existing game stock and update cost price
          const existingGame = await GameModel.findOne({
            gameBarcode: game.gameBarcode,
          });

          if (existingGame) {
            const existingStock = existingGame.gameAvailableStocks || 0;
            const existingCost = existingGame.costPrice || 0;
            const newStock = existingStock + game.quantity;

            let newCostPrice = gameCostPrice;
            if (existingStock > 0 && existingCost > 0) {
              newCostPrice =
                (existingCost * existingStock + gameCostPrice * game.quantity) /
                newStock;
            }

            await GameModel.findOneAndUpdate(
              { gameBarcode: game.gameBarcode },
              {
                $inc: { gameAvailableStocks: game.quantity },
                $set: { costPrice: newCostPrice },
              },
            );
          }
        }
      }
    }

    // If status is changing from "completed" to something else, reverse stock
    if (oldStatus === "completed" && newStatus !== "completed") {
      for (const game of purchase.games) {
        if (game.isNewGame) {
          // For new games, we might want to delete them or just decrement
          // For safety, we'll just decrement stock if game exists
          const existingGame = await GameModel.findOne({
            gameBarcode: game.gameBarcode,
          });

          if (existingGame) {
            const newStock = existingGame.gameAvailableStocks - game.quantity;
            if (newStock <= 0) {
              // If stock would be negative or zero, we could delete the game
              // But for safety, we'll just set it to 0
              await GameModel.findOneAndUpdate(
                { gameBarcode: game.gameBarcode },
                { $set: { gameAvailableStocks: 0 } },
              );
            } else {
              await GameModel.findOneAndUpdate(
                { gameBarcode: game.gameBarcode },
                { $inc: { gameAvailableStocks: -game.quantity } },
              );
            }
          }
        } else {
          // Decrement existing game stock
          const existingGame = await GameModel.findOne({
            gameBarcode: game.gameBarcode,
          });

          if (existingGame) {
            const newStock = existingGame.gameAvailableStocks - game.quantity;
            if (newStock < 0) {
              // Stock can't go negative, set to 0
              await GameModel.findOneAndUpdate(
                { gameBarcode: game.gameBarcode },
                { $set: { gameAvailableStocks: 0 } },
              );
            } else {
              await GameModel.findOneAndUpdate(
                { gameBarcode: game.gameBarcode },
                { $inc: { gameAvailableStocks: -game.quantity } },
              );
            }
          }
        }
      }
    }

    // Update purchase fields
    if (body.supplierName !== undefined) {
      purchase.supplierName = body.supplierName?.trim() || undefined;
    }
    if (body.supplierContact !== undefined) {
      purchase.supplierContact = body.supplierContact?.trim() || undefined;
    }
    if (body.supplierNotes !== undefined) {
      purchase.supplierNotes = body.supplierNotes?.trim() || undefined;
    }
    if (body.adminNotes !== undefined) {
      purchase.adminNotes = body.adminNotes?.trim() || undefined;
    }
    if (body.status !== undefined) {
      purchase.status = body.status;
      if (body.status === "completed" && !purchase.completedAt) {
        purchase.completedAt = new Date();
      }
    }

    // If games or totalCost changed, recalculate metrics
    if (body.games || body.totalCost !== undefined) {
      const games = body.games || purchase.games;
      const totalCost =
        body.totalCost !== undefined ? body.totalCost : purchase.totalCost;

      const { totalExpectedRevenue, totalExpectedProfit, profitMargin } =
        calculatePurchaseMetrics(games, totalCost);

      purchase.totalExpectedRevenue = totalExpectedRevenue;
      purchase.totalExpectedProfit = totalExpectedProfit;
      purchase.profitMargin = profitMargin;

      if (body.games) {
        purchase.games = body.games;
      }
      if (body.totalCost !== undefined) {
        purchase.totalCost = totalCost;
      }
    }

    await purchase.save();

    return NextResponse.json({
      message: "Purchase updated successfully",
      purchase: purchase.toJSON(),
    });
  } catch (error: any) {
    console.error("Error updating purchase:", error);
    return NextResponse.json(
      { error: "Failed to update purchase", details: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    const purchase = await BuyingModel.findById(id);

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 },
      );
    }

    // If purchase was completed, reverse stock changes
    if (purchase.status === "completed") {
      for (const game of purchase.games) {
        if (game.isNewGame) {
          // For new games, we might want to delete them or just decrement
          const existingGame = await GameModel.findOne({
            gameBarcode: game.gameBarcode,
          });

          if (existingGame) {
            const newStock = existingGame.gameAvailableStocks - game.quantity;
            if (newStock <= 0) {
              // If stock would be zero or negative, we could delete the game
              // But for safety, we'll just set it to 0
              await GameModel.findOneAndUpdate(
                { gameBarcode: game.gameBarcode },
                { $set: { gameAvailableStocks: 0 } },
              );
            } else {
              await GameModel.findOneAndUpdate(
                { gameBarcode: game.gameBarcode },
                { $inc: { gameAvailableStocks: -game.quantity } },
              );
            }
          }
        } else {
          // Decrement existing game stock
          const existingGame = await GameModel.findOne({
            gameBarcode: game.gameBarcode,
          });

          if (existingGame) {
            const newStock = existingGame.gameAvailableStocks - game.quantity;
            if (newStock < 0) {
              // Stock can't go negative, set to 0
              await GameModel.findOneAndUpdate(
                { gameBarcode: game.gameBarcode },
                { $set: { gameAvailableStocks: 0 } },
              );
            } else {
              await GameModel.findOneAndUpdate(
                { gameBarcode: game.gameBarcode },
                { $inc: { gameAvailableStocks: -game.quantity } },
              );
            }
          }
        }
      }
    }

    await BuyingModel.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Purchase deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting purchase:", error);
    return NextResponse.json(
      { error: "Failed to delete purchase", details: error.message },
      { status: 500 },
    );
  }
}
