import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import GameModel from "@/models/Game";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find all games
    const games = await GameModel.find({});

    let migrated = 0; // Games that didn't have variant fields
    let fixed = 0; // Games that had variant fields but wrong gameAvailableStocks
    let alreadyCorrect = 0; // Games that are already correct

    const results: Array<{
      gameTitle: string;
      action: string;
      details: string;
    }> = [];

    for (const game of games) {
      const hasVariantFields =
        game.stockWithCase !== undefined ||
        game.stockCartridgeOnly !== undefined;

      let stockWithCase: number;
      let stockCartridgeOnly: number;

      if (!hasVariantFields) {
        // Migrate: set stockWithCase = gameAvailableStocks, stockCartridgeOnly = 0
        stockWithCase = game.gameAvailableStocks || 0;
        stockCartridgeOnly = 0;

        await GameModel.findByIdAndUpdate(game._id, {
          $set: {
            stockWithCase,
            stockCartridgeOnly,
            gameAvailableStocks: stockWithCase + stockCartridgeOnly,
          },
        });

        migrated++;
        results.push({
          gameTitle: game.gameTitle,
          action: "migrated",
          details: `WC=${stockWithCase}, CO=${stockCartridgeOnly}, Total=${stockWithCase + stockCartridgeOnly}`,
        });
      } else {
        // Game already has variant fields, check if gameAvailableStocks is correct
        stockWithCase = game.stockWithCase || 0;
        stockCartridgeOnly = game.stockCartridgeOnly || 0;
        const computedStock = stockWithCase + stockCartridgeOnly;
        const currentStock = game.gameAvailableStocks || 0;

        if (currentStock !== computedStock) {
          // Fix gameAvailableStocks to match variant sum
          await GameModel.findByIdAndUpdate(game._id, {
            $set: {
              gameAvailableStocks: computedStock,
            },
          });

          fixed++;
          results.push({
            gameTitle: game.gameTitle,
            action: "fixed",
            details: `Updated gameAvailableStocks from ${currentStock} to ${computedStock} (WC=${stockWithCase}, CO=${stockCartridgeOnly})`,
          });
        } else {
          alreadyCorrect++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: games.length,
        migrated,
        fixed,
        alreadyCorrect,
      },
      results: results.slice(0, 100), // Limit to first 100 results for response size
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        error: "Failed to run migration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

