import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import GameModel from "@/models/Game";
import { validateGameData } from "@/lib/games-db";
import { deleteImageFromFirebase } from "@/lib/firebase";
import { Game } from "@/app/types/games";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barcode: string }> },
) {
  try {
    await connectDB();
    const { barcode } = await params;
    const game = (await GameModel.findOne({
      gameBarcode: barcode,
    }).lean()) as any;

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Convert to Game interface
    const formattedGame: Game = {
      _id: game._id.toString(),
      gameTitle: game.gameTitle,
      gamePlatform: game.gamePlatform,
      gameRatings: game.gameRatings,
      gameBarcode: game.gameBarcode,
      gameDescription: game.gameDescription,
      gameImageURL: game.gameImageURL,
      gameAvailableStocks: game.gameAvailableStocks,
      gamePrice: game.gamePrice,
      gameCategory: game.gameCategory,
      gameReleaseDate: game.gameReleaseDate,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString(),
      numberOfSold: game.numberOfSold,
      rentalAvailable: game.rentalAvailable,
      rentalWeeklyRate: game.rentalWeeklyRate,
      class: game.class,
      tradable: game.tradable,
    };

    return NextResponse.json({ game: formattedGame });
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { error: "Failed to fetch game" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ barcode: string }> },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { barcode } = await params;
    const body = await request.json();

    // Validate game data
    const validation = validateGameData(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation failed", errors: validation.errors },
        { status: 400 },
      );
    }

    // Find existing game
    const existingGame = await GameModel.findOne({
      gameBarcode: barcode,
    });
    if (!existingGame) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Check if barcode is being changed and if new barcode already exists
    if (body.gameBarcode !== barcode) {
      const duplicateGame = await GameModel.findOne({
        gameBarcode: body.gameBarcode,
      });
      if (duplicateGame) {
        return NextResponse.json(
          { error: "A game with this barcode already exists" },
          { status: 409 },
        );
      }
    }

    // Update game document
    const updatedGame = await GameModel.findOneAndUpdate(
      { gameBarcode: barcode },
      {
        gameTitle: body.gameTitle,
        gamePlatform: body.gamePlatform,
        gameRatings: body.gameRatings,
        gameBarcode: body.gameBarcode,
        gameDescription: body.gameDescription,
        gameImageURL: body.gameImageURL,
        gameAvailableStocks: body.gameAvailableStocks,
        gamePrice: body.gamePrice,
        gameCategory: body.gameCategory,
        gameReleaseDate: body.gameReleaseDate,
        numberOfSold:
          body.numberOfSold !== undefined
            ? body.numberOfSold
            : existingGame.numberOfSold,
        rentalAvailable:
          body.rentalAvailable !== undefined
            ? body.rentalAvailable
            : existingGame.rentalAvailable,
        rentalWeeklyRate:
          body.rentalWeeklyRate !== undefined
            ? body.rentalWeeklyRate
            : existingGame.rentalWeeklyRate,
        class: body.class || existingGame.class || "",
        tradable:
          body.tradable !== undefined ? body.tradable : existingGame.tradable,
      },
      { new: true, runValidators: true },
    );

    // Convert to Game interface
    const formattedGame: Game = {
      _id: updatedGame._id.toString(),
      gameTitle: updatedGame.gameTitle,
      gamePlatform: updatedGame.gamePlatform,
      gameRatings: updatedGame.gameRatings,
      gameBarcode: updatedGame.gameBarcode,
      gameDescription: updatedGame.gameDescription,
      gameImageURL: updatedGame.gameImageURL,
      gameAvailableStocks: updatedGame.gameAvailableStocks,
      gamePrice: updatedGame.gamePrice,
      gameCategory: updatedGame.gameCategory,
      gameReleaseDate: updatedGame.gameReleaseDate,
      createdAt: updatedGame.createdAt.toISOString(),
      updatedAt: updatedGame.updatedAt.toISOString(),
      numberOfSold: updatedGame.numberOfSold,
      rentalAvailable: updatedGame.rentalAvailable,
      rentalWeeklyRate: updatedGame.rentalWeeklyRate,
      class: updatedGame.class,
      tradable: updatedGame.tradable,
    };

    return NextResponse.json({ success: true, game: formattedGame });
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { error: "Failed to update game" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ barcode: string }> },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { barcode } = await params;

    // Find game to delete
    const gameToDelete = await GameModel.findOne({
      gameBarcode: barcode,
    });
    if (!gameToDelete) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Delete image from Firebase Storage if it's a Firebase URL
    if (
      gameToDelete.gameImageURL.includes("firebase") ||
      gameToDelete.gameImageURL.includes("googleapis")
    ) {
      try {
        await deleteImageFromFirebase(gameToDelete.gameImageURL);
      } catch (error) {
        console.warn("Failed to delete image from Firebase:", error);
        // Continue with game deletion even if image deletion fails
      }
    }

    // Delete game from database
    await GameModel.findOneAndDelete({ gameBarcode: barcode });

    // Convert to Game interface for response
    const deletedGame: Game = {
      _id: gameToDelete._id.toString(),
      gameTitle: gameToDelete.gameTitle,
      gamePlatform: gameToDelete.gamePlatform,
      gameRatings: gameToDelete.gameRatings,
      gameBarcode: gameToDelete.gameBarcode,
      gameDescription: gameToDelete.gameDescription,
      gameImageURL: gameToDelete.gameImageURL,
      gameAvailableStocks: gameToDelete.gameAvailableStocks,
      gamePrice: gameToDelete.gamePrice,
      gameCategory: gameToDelete.gameCategory,
      gameReleaseDate: gameToDelete.gameReleaseDate,
      createdAt: gameToDelete.createdAt.toISOString(),
      updatedAt: gameToDelete.updatedAt.toISOString(),
      numberOfSold: gameToDelete.numberOfSold,
      rentalAvailable: gameToDelete.rentalAvailable,
      rentalWeeklyRate: gameToDelete.rentalWeeklyRate,
      class: gameToDelete.class,
      tradable: gameToDelete.tradable,
    };

    return NextResponse.json({ success: true, game: deletedGame });
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json(
      { error: "Failed to delete game" },
      { status: 500 },
    );
  }
}
