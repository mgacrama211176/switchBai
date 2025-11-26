import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import GameModel from "@/models/Game";

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Updates array is required and must not be empty" },
        { status: 400 },
      );
    }

    // Validate each update
    for (const update of updates) {
      if (!update.barcode || typeof update.gamePrice !== "number") {
        return NextResponse.json(
          { error: "Each update must have barcode and gamePrice" },
          { status: 400 },
        );
      }

      if (update.gamePrice < 0) {
        return NextResponse.json(
          { error: "Game price cannot be negative" },
          { status: 400 },
        );
      }
    }

    // Perform bulk update
    const results = await Promise.allSettled(
      updates.map(async (update: { barcode: string; gamePrice: number }) => {
        const game = await GameModel.findOneAndUpdate(
          { gameBarcode: update.barcode },
          { gamePrice: update.gamePrice },
          { new: true, runValidators: true },
        );

        if (!game) {
          throw new Error(`Game with barcode ${update.barcode} not found`);
        }

        return {
          barcode: update.barcode,
          success: true,
          newPrice: game.gamePrice,
        };
      }),
    );

    // Process results
    const successful: Array<{
      barcode: string;
      success: true;
      newPrice: number;
    }> = [];
    const failed: Array<{ barcode: string; error: string }> = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successful.push(result.value);
      } else {
        failed.push({
          barcode: updates[index].barcode,
          error: result.reason?.message || "Unknown error",
        });
      }
    });

    return NextResponse.json({
      success: true,
      updated: successful.length,
      failed: failed.length,
      results: {
        successful,
        failed,
      },
    });
  } catch (error) {
    console.error("Bulk update error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update prices",
      },
      { status: 500 },
    );
  }
}
