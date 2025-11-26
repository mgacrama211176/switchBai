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

    // Filter by platform (handle multiple comma-separated values)
    const platform = searchParams.get("platform");
    if (platform) {
      const platforms = platform
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      query.gamePlatform = { $in: platforms };
    }

    // Filter by category (handle multiple comma-separated values)
    const category = searchParams.get("category");
    if (category) {
      const categories = category
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      query.gameCategory = { $in: categories };
    }

    // Search by title or barcode
    const search = searchParams.get("search");
    if (search) {
      query.$or = [
        { gameTitle: { $regex: search, $options: "i" } },
        { gameBarcode: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by stock availability (using computed stock from variants)
    const inStockOnly = searchParams.get("inStock") === "true";
    if (inStockOnly) {
      // Filter games where stockWithCase + stockCartridgeOnly > 0
      query.$expr = {
        $gt: [{ $add: ["$stockWithCase", "$stockCartridgeOnly"] }, 0],
      };
    }

    const outOfStockOnly = searchParams.get("outOfStock") === "true";
    if (outOfStockOnly) {
      // Filter games where stockWithCase + stockCartridgeOnly = 0
      query.$expr = {
        $eq: [{ $add: ["$stockWithCase", "$stockCartridgeOnly"] }, 0],
      };
    }

    // Filter by rental availability
    const rentalOnly = searchParams.get("rental") === "true";
    if (rentalOnly) {
      query.rentalAvailable = true;
    }

    // Filter by tradable games
    const tradableOnly = searchParams.get("tradable") === "true";
    if (tradableOnly) {
      query.tradable = true;
    }

    // Check if we need to apply Nintendo Switch filter (for client-facing pages)
    const nintendoOnly = searchParams.get("nintendoOnly") === "true";

    // Sorting
    const sortField = searchParams.get("sort") || "updatedAt";
    const sortOrder = searchParams.get("order") === "asc" ? 1 : -1;
    const sortOptions: any = { [sortField]: sortOrder };

    // Pagination
    // When search is provided, use high limit to allow full database search
    // Otherwise use default limit for normal pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = search
      ? parseInt(searchParams.get("limit") || "10000") // High limit for searches
      : parseInt(searchParams.get("limit") || "50"); // Normal limit otherwise
    const skip = (page - 1) * limit;

    let games: any[];
    let total: number;

    if (nintendoOnly) {
      // For Nintendo-only filter, we need to fetch all, filter, then paginate
      // This is because MongoDB can't easily filter "has Nintendo AND not PS4/PS5"
      let allGames = await GameModel.find(query).sort(sortOptions).lean();

      // Apply Nintendo Switch filter (exclude PS4/PS5 games)
      allGames = allGames.filter((game) => {
        const platforms = Array.isArray(game.gamePlatform)
          ? game.gamePlatform
          : [game.gamePlatform];
        // Must have Nintendo Switch AND not have PS4/PS5
        const hasNintendo =
          platforms.includes("Nintendo Switch") ||
          platforms.includes("Nintendo Switch 2");
        const hasPlayStation =
          platforms.includes("PS4") || platforms.includes("PS5");
        return hasNintendo && !hasPlayStation;
      });

      // Calculate total after all filters
      total = allGames.length;

      // Apply pagination to filtered results
      games = allGames.slice(skip, skip + limit);
    } else {
      // For normal queries, use efficient MongoDB pagination
      games = await GameModel.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();

      // Get total count for pagination
      total = await GameModel.countDocuments(query);
    }

    // Convert MongoDB documents to Game interface
    const formattedGames: Game[] = games.map((game: any) => {
      const stockWithCase = game.stockWithCase ?? 0;
      const stockCartridgeOnly = game.stockCartridgeOnly ?? 0;
      const computedStock = stockWithCase + stockCartridgeOnly;
      const cartridgeOnlyPrice = game.gamePrice
        ? Math.max(0, game.gamePrice - 100)
        : 0;

      return {
        _id: (game._id as unknown as string).toString(),
        gameTitle: game.gameTitle,
        gamePlatform: game.gamePlatform,
        gameRatings: game.gameRatings,
        gameBarcode: game.gameBarcode,
        gameDescription: game.gameDescription,
        gameImageURL: game.gameImageURL,
        gameAvailableStocks: computedStock,
        stockWithCase,
        stockCartridgeOnly,
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
        isOnSale: game.isOnSale,
        salePrice: game.salePrice,
        costPrice: game.costPrice,
        cartridgeOnlyPrice,
      };
    });

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
    const stockWithCase = body.stockWithCase ?? 0;
    const stockCartridgeOnly = body.stockCartridgeOnly ?? 0;

    const gameDoc = new GameModel({
      gameTitle: body.gameTitle,
      gamePlatform: body.gamePlatform,
      gameRatings: body.gameRatings,
      gameBarcode: body.gameBarcode,
      gameDescription: body.gameDescription,
      gameImageURL: body.gameImageURL,
      stockWithCase,
      stockCartridgeOnly,
      gamePrice: body.gamePrice,
      gameCategory: body.gameCategory,
      gameReleaseDate: body.gameReleaseDate,
      numberOfSold: body.numberOfSold || 0,
      rentalAvailable: body.rentalAvailable || false,
      rentalWeeklyRate: body.rentalWeeklyRate || 0,
      class: body.class || "",
      tradable: body.tradable ?? true,
      isOnSale: body.isOnSale || false,
      salePrice: body.isOnSale ? body.salePrice : undefined,
      costPrice: body.costPrice,
    });

    await gameDoc.save();

    // Convert to Game interface
    const computedStock =
      (gameDoc.stockWithCase || 0) + (gameDoc.stockCartridgeOnly || 0);
    const cartridgeOnlyPrice = gameDoc.gamePrice
      ? Math.max(0, gameDoc.gamePrice - 100)
      : 0;

    const newGame: Game = {
      _id: gameDoc._id.toString(),
      gameTitle: gameDoc.gameTitle,
      gamePlatform: gameDoc.gamePlatform,
      gameRatings: gameDoc.gameRatings,
      gameBarcode: gameDoc.gameBarcode,
      gameDescription: gameDoc.gameDescription,
      gameImageURL: gameDoc.gameImageURL,
      gameAvailableStocks: computedStock,
      stockWithCase: gameDoc.stockWithCase,
      stockCartridgeOnly: gameDoc.stockCartridgeOnly,
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
      isOnSale: gameDoc.isOnSale,
      salePrice: gameDoc.salePrice,
      costPrice: gameDoc.costPrice,
      cartridgeOnlyPrice,
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
