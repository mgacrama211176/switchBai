import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import GameModel from "@/models/Game";
import { validateGameData } from "@/lib/games-db";
import { Game } from "@/app/types/games";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;

    // Build query object
    const query: any = {};

    // Filter by platform
    const platform = searchParams.get("platform");
    if (platform) {
      query.gamePlatform = { $in: [platform] };
    }

    // Filter by category
    const category = searchParams.get("category");
    if (category) {
      query.gameCategory = category;
    }

    // Search by title or barcode
    const search = searchParams.get("search");
    if (search) {
      query.$or = [
        { gameTitle: { $regex: search, $options: "i" } },
        { gameBarcode: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by stock availability (only games with stock > 0)
    const inStockOnly = searchParams.get("inStock") === "true";
    if (inStockOnly) {
      query.gameAvailableStocks = { $gt: 0 };
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const games = await GameModel.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await GameModel.countDocuments(query);

    // Convert MongoDB documents to Game interface
    const formattedGames: Game[] = games.map((game) => ({
      _id: (game._id as unknown as string).toString(),
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
    }));

    return NextResponse.json({
      games: formattedGames,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    // Validate game data
    const validation = validateGameData(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation failed", errors: validation.errors },
        { status: 400 },
      );
    }

    // Check for duplicate barcode
    const existingGame = await GameModel.findOne({
      gameBarcode: body.gameBarcode,
    });
    if (existingGame) {
      return NextResponse.json(
        { error: "A game with this barcode already exists" },
        { status: 409 },
      );
    }

    // Create new game document
    const gameDoc = new GameModel({
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
      numberOfSold: body.numberOfSold || 0,
      rentalAvailable: body.rentalAvailable || false,
      rentalWeeklyRate: body.rentalWeeklyRate || 0,
      class: body.class || "",
      tradable: body.tradable ?? true,
    });

    await gameDoc.save();

    // Convert to Game interface
    const newGame: Game = {
      _id: gameDoc._id.toString(),
      gameTitle: gameDoc.gameTitle,
      gamePlatform: gameDoc.gamePlatform,
      gameRatings: gameDoc.gameRatings,
      gameBarcode: gameDoc.gameBarcode,
      gameDescription: gameDoc.gameDescription,
      gameImageURL: gameDoc.gameImageURL,
      gameAvailableStocks: gameDoc.gameAvailableStocks,
      gamePrice: gameDoc.gamePrice,
      gameCategory: gameDoc.gameCategory,
      gameReleaseDate: gameDoc.gameReleaseDate,
      createdAt: gameDoc.createdAt.toISOString(),
      updatedAt: gameDoc.updatedAt.toISOString(),
      numberOfSold: gameDoc.numberOfSold,
      rentalAvailable: gameDoc.rentalAvailable,
      rentalWeeklyRate: gameDoc.rentalWeeklyRate,
      class: gameDoc.class,
      tradable: gameDoc.tradable,
    };

    return NextResponse.json({ success: true, game: newGame }, { status: 201 });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 },
    );
  }
}
