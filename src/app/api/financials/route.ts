import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BuyingModel from "@/models/Buying";
import PurchaseModel from "@/models/Purchase";
import RentalModel from "@/models/Rental";
import TradeModel from "@/models/Trade";
import GameModel from "@/models/Game";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const period = searchParams.get("period") || "all";
    const filterType = searchParams.get("filterType") || "all";
    const operatingExpenses =
      parseFloat(searchParams.get("operatingExpenses") || "0") || 0;
    const platformFilter = searchParams.get("platformFilter") || "all";

    // Calculate date range based on filterType
    let dateFilter: { $gte?: Date; $lte?: Date } = {};
    const now = new Date();

    if (filterType === "monthly") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { $gte: start, $lte: now };
    } else if (filterType === "bi-annual") {
      // Last 6 months
      const start = new Date(now);
      start.setMonth(start.getMonth() - 6);
      dateFilter = { $gte: start, $lte: now };
    } else if (filterType === "annual") {
      // Last 12 months
      const start = new Date(now);
      start.setMonth(start.getMonth() - 12);
      dateFilter = { $gte: start, $lte: now };
    } else if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Build query for buying records (completed purchases)
    const buyingQuery: any = { status: "completed" };
    if (Object.keys(dateFilter).length > 0) {
      buyingQuery.completedAt = dateFilter;
    }

    // Build query for orders (delivered orders)
    const orderQuery: any = { status: "delivered" };
    if (Object.keys(dateFilter).length > 0) {
      orderQuery.deliveredAt = dateFilter;
    }

    // Build query for rentals (completed rentals)
    const rentalQuery: any = { status: "completed" };
    if (Object.keys(dateFilter).length > 0) {
      rentalQuery.updatedAt = dateFilter;
    }

    // Build query for trades (completed trades)
    const tradeQuery: any = { status: "completed" };
    if (Object.keys(dateFilter).length > 0) {
      tradeQuery.completedAt = dateFilter;
    }

    // Fetch all data
    const [buyingRecords, orders, rentals, trades, games] = await Promise.all([
      BuyingModel.find(buyingQuery).lean(),
      PurchaseModel.find(orderQuery).lean(),
      RentalModel.find(rentalQuery).lean(),
      TradeModel.find(tradeQuery).lean(),
      GameModel.find({}).lean(),
    ]);

    // Helper function to check if a game matches platform filter
    function matchesPlatformFilter(
      gamePlatform: string | string[] | undefined,
    ): boolean {
      if (platformFilter === "all") return true;
      if (!gamePlatform) return false;

      const platforms = Array.isArray(gamePlatform)
        ? gamePlatform
        : [gamePlatform];

      if (platformFilter === "nintendo") {
        return (
          platforms.includes("Nintendo Switch") ||
          platforms.includes("Nintendo Switch 2")
        );
      } else if (platformFilter === "playstation") {
        return platforms.includes("PS4") || platforms.includes("PS5");
      }

      return true;
    }

    // Helper function to check if any game in a list matches platform filter
    function anyGameMatchesPlatform(
      gameBarcodes: string[],
      gamesMap: Map<string, any>,
    ): boolean {
      return gameBarcodes.some((barcode) => {
        const game = gamesMap.get(barcode);
        return game && matchesPlatformFilter(game.gamePlatform);
      });
    }

    // Create a map of games by barcode for quick lookup
    const gamesMap = new Map(games.map((g: any) => [g.gameBarcode, g]));

    // Filter data by platform if needed
    let filteredBuyingRecords = buyingRecords;
    let filteredOrders = orders;
    let filteredRentals = rentals;
    let filteredTrades = trades;

    if (platformFilter !== "all") {
      // Filter buying records by platform
      filteredBuyingRecords = buyingRecords.filter((buying: any) => {
        const gameBarcodes = (buying.games || []).map(
          (g: any) => g.gameBarcode,
        );
        return anyGameMatchesPlatform(gameBarcodes, gamesMap);
      });

      // Filter orders by platform
      filteredOrders = orders.filter((order: any) => {
        const gameBarcodes = (order.games || []).map((g: any) => g.gameBarcode);
        return anyGameMatchesPlatform(gameBarcodes, gamesMap);
      });

      // Filter rentals by platform
      filteredRentals = rentals.filter((rental: any) => {
        const gameBarcode = rental.gameBarcode;
        const game = gamesMap.get(gameBarcode);
        return game && matchesPlatformFilter(game.gamePlatform);
      });

      // Filter trades by platform (check games received)
      filteredTrades = trades.filter((trade: any) => {
        const gameBarcodes = (trade.gamesReceived || []).map(
          (g: any) => g.gameBarcode,
        );
        return anyGameMatchesPlatform(gameBarcodes, gamesMap);
      });
    }

    // Calculate Total Costs (from completed buying records)
    const totalCosts = filteredBuyingRecords.reduce(
      (sum, record) => sum + (record.totalCost || 0),
      0,
    );

    // Calculate Total Revenue (from delivered orders)
    // Revenue = totalAmount (already includes discount)
    const totalRevenue = filteredOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0,
    );

    // Calculate Rental Revenue
    const rentalRevenue = filteredRentals.reduce(
      (sum: number, rental: any) => sum + (rental.rentalFee || 0),
      0,
    );

    // Calculate Trade Revenue (cashDifference + tradeFee)
    const tradeRevenue = filteredTrades.reduce(
      (sum: number, trade: any) =>
        sum + ((trade.cashDifference || 0) + (trade.tradeFee || 0)),
      0,
    );

    // Calculate Trade Costs (cost of games we give away)
    let tradeCosts = 0;
    for (const trade of filteredTrades) {
      for (const gameReceived of trade.gamesReceived || []) {
        const gameDoc = games.find(
          (g: any) => g.gameBarcode === gameReceived.gameBarcode,
        );
        const costPrice = gameDoc?.costPrice || 0;
        tradeCosts += costPrice * (gameReceived.quantity || 0);
      }
    }

    // Calculate Trade Profit
    const tradeProfit = tradeRevenue - tradeCosts;

    // Total Revenue including rentals and trades
    const totalRevenueWithRentalsAndTrades =
      totalRevenue + rentalRevenue + tradeRevenue;

    // Calculate Gross Profit (including trade costs in total costs)
    const totalCostsWithTrades = totalCosts + tradeCosts;
    const grossProfit = totalRevenueWithRentalsAndTrades - totalCostsWithTrades;

    // Calculate Gross Profit Margin
    const grossProfitMargin =
      totalRevenueWithRentalsAndTrades > 0
        ? (grossProfit / totalRevenueWithRentalsAndTrades) * 100
        : 0;

    // Calculate Net Profit (gross profit - operating expenses)
    const netProfit = grossProfit - operatingExpenses;

    // Calculate Net Profit Margin
    const netProfitMargin =
      totalRevenueWithRentalsAndTrades > 0
        ? (netProfit / totalRevenueWithRentalsAndTrades) * 100
        : 0;

    // Determine status
    let status: "profit" | "loss" | "break-even" = "break-even";
    if (grossProfit > 0) {
      status = "profit";
    } else if (grossProfit < 0) {
      status = "loss";
    }

    // Calculate time series data
    const timeSeriesMap = new Map<
      string,
      {
        revenue: number;
        costs: number;
        profit: number;
        orderCount: number;
        rentalCount: number;
        tradeCount: number;
      }
    >();

    // Process orders for time series
    filteredOrders.forEach((order) => {
      if (!order.deliveredAt) return;
      const date = new Date(order.deliveredAt);
      let key = "";

      if (period === "day") {
        key = date.toISOString().split("T")[0];
      } else if (period === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else if (period === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else if (period === "bi-annual") {
        const halfYear = Math.floor(date.getMonth() / 6);
        key = `${date.getFullYear()}-H${halfYear + 1}`;
      } else if (period === "annual") {
        key = String(date.getFullYear());
      } else {
        key = "all";
      }

      if (!timeSeriesMap.has(key)) {
        timeSeriesMap.set(key, {
          revenue: 0,
          costs: 0,
          profit: 0,
          orderCount: 0,
          rentalCount: 0,
          tradeCount: 0,
        });
      }

      const entry = timeSeriesMap.get(key)!;
      entry.revenue += order.totalAmount || 0;
      entry.orderCount += 1;
    });

    // Process buying records for time series
    filteredBuyingRecords.forEach((buying) => {
      if (!buying.completedAt) return;
      const date = new Date(buying.completedAt);
      let key = "";

      if (period === "day") {
        key = date.toISOString().split("T")[0];
      } else if (period === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else if (period === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else if (period === "bi-annual") {
        const halfYear = Math.floor(date.getMonth() / 6);
        key = `${date.getFullYear()}-H${halfYear + 1}`;
      } else if (period === "annual") {
        key = String(date.getFullYear());
      } else {
        key = "all";
      }

      if (!timeSeriesMap.has(key)) {
        timeSeriesMap.set(key, {
          revenue: 0,
          costs: 0,
          profit: 0,
          orderCount: 0,
          rentalCount: 0,
          tradeCount: 0,
        });
      }

      const entry = timeSeriesMap.get(key)!;
      entry.costs += buying.totalCost || 0;
    });

    // Process rentals for time series
    filteredRentals.forEach((rental) => {
      if (!rental.updatedAt) return;
      const date = new Date(rental.updatedAt);
      let key = "";

      if (period === "day") {
        key = date.toISOString().split("T")[0];
      } else if (period === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else if (period === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else if (period === "bi-annual") {
        const halfYear = Math.floor(date.getMonth() / 6);
        key = `${date.getFullYear()}-H${halfYear + 1}`;
      } else if (period === "annual") {
        key = String(date.getFullYear());
      } else {
        key = "all";
      }

      if (!timeSeriesMap.has(key)) {
        timeSeriesMap.set(key, {
          revenue: 0,
          costs: 0,
          profit: 0,
          orderCount: 0,
          rentalCount: 0,
          tradeCount: 0,
        });
      }

      const entry = timeSeriesMap.get(key)!;
      entry.revenue += rental.rentalFee || 0;
      entry.rentalCount += 1;
    });

    // Process trades for time series
    for (const trade of filteredTrades) {
      if (!trade.completedAt) continue;
      const date = new Date(trade.completedAt);
      let key = "";

      if (period === "day") {
        key = date.toISOString().split("T")[0];
      } else if (period === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else if (period === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else if (period === "bi-annual") {
        const halfYear = Math.floor(date.getMonth() / 6);
        key = `${date.getFullYear()}-H${halfYear + 1}`;
      } else if (period === "annual") {
        key = String(date.getFullYear());
      } else {
        key = "all";
      }

      if (!timeSeriesMap.has(key)) {
        timeSeriesMap.set(key, {
          revenue: 0,
          costs: 0,
          profit: 0,
          orderCount: 0,
          rentalCount: 0,
          tradeCount: 0,
        });
      }

      const entry = timeSeriesMap.get(key)!;
      const tradeRev = (trade.cashDifference || 0) + (trade.tradeFee || 0);
      entry.revenue += tradeRev;
      entry.tradeCount += 1;

      // Calculate trade costs for this trade
      let tradeCost = 0;
      for (const gameReceived of trade.gamesReceived || []) {
        const gameDoc = games.find(
          (g: any) => g.gameBarcode === gameReceived.gameBarcode,
        );
        const costPrice = gameDoc?.costPrice || 0;
        tradeCost += costPrice * (gameReceived.quantity || 0);
      }
      entry.costs += tradeCost;
    }

    // Calculate profit for each time period
    timeSeriesMap.forEach((value, key) => {
      value.profit = value.revenue - value.costs;
    });

    // Convert to array and sort
    const timeSeries = Array.from(timeSeriesMap.entries())
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Revenue Breakdown
    const revenueByStatus: Record<string, number> = {};
    const revenueByPaymentMethod: Record<string, number> = {};
    const revenueBySource: Record<string, number> = {};
    let totalDiscounts = 0;

    filteredOrders.forEach((order: any) => {
      // By status
      const status = order.status || "unknown";
      revenueByStatus[status] =
        (revenueByStatus[status] || 0) + (order.totalAmount || 0);

      // By payment method
      const paymentMethod = order.paymentMethod || "unknown";
      revenueByPaymentMethod[paymentMethod] =
        (revenueByPaymentMethod[paymentMethod] || 0) + (order.totalAmount || 0);

      // By source
      const source = order.orderSource || "unknown";
      revenueBySource[source] =
        (revenueBySource[source] || 0) + (order.totalAmount || 0);

      // Discounts
      totalDiscounts += order.discountAmount || 0;
    });

    // Add trades to revenue by source
    revenueBySource["trades"] = tradeRevenue;

    // Cost Breakdown by Supplier
    const costBySupplier = new Map<string, number>();
    filteredBuyingRecords.forEach((buying) => {
      const supplier = buying.supplierName || "Unknown Supplier";
      costBySupplier.set(
        supplier,
        (costBySupplier.get(supplier) || 0) + (buying.totalCost || 0),
      );
    });

    const costBySupplierArray = Array.from(costBySupplier.entries())
      .map(([supplier, amount]) => ({ supplier, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Top Games by Revenue and Profit
    const gameStats = new Map<
      string,
      {
        gameTitle: string;
        revenue: number;
        cost: number;
        profit: number;
        quantitySold: number;
      }
    >();

    filteredOrders.forEach((order) => {
      order.games.forEach(
        (game: {
          gameBarcode: string;
          gameTitle: string;
          gamePrice: number;
          quantity: number;
        }) => {
          const barcode = game.gameBarcode;
          if (!gameStats.has(barcode)) {
            gameStats.set(barcode, {
              gameTitle: game.gameTitle,
              revenue: 0,
              cost: 0,
              profit: 0,
              quantitySold: 0,
            });
          }

          const stats = gameStats.get(barcode)!;
          stats.revenue += (game.gamePrice || 0) * (game.quantity || 0);
          stats.quantitySold += game.quantity || 0;
        },
      );
    });

    // Calculate costs and profits for each game
    for (const [barcode, stats] of gameStats.entries()) {
      const game = games.find((g) => g.gameBarcode === barcode);
      if (game && game.costPrice) {
        stats.cost = (game.costPrice || 0) * stats.quantitySold;
        stats.profit = stats.revenue - stats.cost;
      }
    }

    const topGames = Array.from(gameStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Inventory Value (filtered by platform if needed)
    let inventoryValue = 0;
    let potentialRevenue = 0;

    games.forEach((game: any) => {
      if (!matchesPlatformFilter(game.gamePlatform)) return;

      const stockWithCase = game.stockWithCase || 0;
      const stockCartridgeOnly = game.stockCartridgeOnly || 0;
      const costPrice = game.costPrice || 0;

      // Calculate inventory value using variant-specific pricing
      const priceWithCase =
        game.isOnSale && game.salePrice ? game.salePrice : game.gamePrice;
      const priceCartridgeOnly =
        game.cartridgeOnlyPrice || Math.max(0, (game.gamePrice || 0) - 100);
      const sellingPriceCartridgeOnly =
        game.isOnSale && game.salePrice
          ? Math.max(0, game.salePrice - 100)
          : priceCartridgeOnly;

      // Inventory value (cost price * total stock)
      inventoryValue += (stockWithCase + stockCartridgeOnly) * costPrice;

      // Potential revenue (variant-specific selling prices)
      potentialRevenue += stockWithCase * priceWithCase;
      potentialRevenue += stockCartridgeOnly * sellingPriceCartridgeOnly;
    });

    const potentialProfit = potentialRevenue - inventoryValue;

    // Market Projections
    // Calculate sales velocity (games sold per day in the last 30 days)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = filteredOrders.filter(
      (order) =>
        order.deliveredAt && new Date(order.deliveredAt) >= thirtyDaysAgo,
    );

    const totalGamesSold = recentOrders.reduce(
      (sum: number, order: any) =>
        sum +
        order.games.reduce(
          (gameSum: number, game: { quantity?: number }) =>
            gameSum + (game.quantity || 0),
          0,
        ),
      0,
    );

    const daysInPeriod = 30;
    const salesVelocity = daysInPeriod > 0 ? totalGamesSold / daysInPeriod : 0;

    // Projected Monthly Revenue (based on last 30 days average)
    const recentRevenue = recentOrders.reduce(
      (sum: number, order: any) => sum + (order.totalAmount || 0),
      0,
    );
    const averageDailyRevenue =
      daysInPeriod > 0 ? recentRevenue / daysInPeriod : 0;
    const projectedMonthlyRevenue = averageDailyRevenue * 30;

    // Projected Monthly Profit
    const recentCosts = filteredBuyingRecords
      .filter(
        (buying) =>
          buying.completedAt && new Date(buying.completedAt) >= thirtyDaysAgo,
      )
      .reduce((sum: number, buying: any) => sum + (buying.totalCost || 0), 0);

    const averageDailyCost = daysInPeriod > 0 ? recentCosts / daysInPeriod : 0;
    const projectedMonthlyCost = averageDailyCost * 30;
    const projectedMonthlyProfit =
      projectedMonthlyRevenue - projectedMonthlyCost;

    // Inventory Turnover (how many times inventory is sold per year)
    const totalGamesSoldAllTime = filteredOrders.reduce(
      (sum: number, order: any) =>
        sum +
        order.games.reduce(
          (gameSum: number, game: { quantity?: number }) =>
            gameSum + (game.quantity || 0),
          0,
        ),
      0,
    );

    const currentInventory = games
      .filter((game: any) => matchesPlatformFilter(game.gamePlatform))
      .reduce(
        (sum: number, game: any) =>
          sum + (game.stockWithCase || 0) + (game.stockCartridgeOnly || 0),
        0,
      );

    const inventoryTurnover =
      currentInventory > 0 ? totalGamesSoldAllTime / currentInventory : 0;

    // Growth Rate (month-over-month)
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const currentMonthRevenue = filteredOrders
      .filter(
        (order: any) =>
          order.deliveredAt && new Date(order.deliveredAt) >= currentMonth,
      )
      .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

    const lastMonthRevenue = filteredOrders
      .filter(
        (order: any) =>
          order.deliveredAt &&
          new Date(order.deliveredAt) >= lastMonth &&
          new Date(order.deliveredAt) < currentMonth,
      )
      .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

    const growthRate =
      lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalCosts: totalCosts,
          totalRevenue: totalRevenue,
          rentalRevenue: rentalRevenue,
          tradeRevenue: tradeRevenue,
          tradeCosts: tradeCosts,
          tradeProfit: tradeProfit,
          totalRevenueWithRentalsAndTrades: totalRevenueWithRentalsAndTrades,
          grossProfit: grossProfit,
          profitMargin: grossProfitMargin,
          operatingExpenses: operatingExpenses,
          netProfit: netProfit,
          netProfitMargin: netProfitMargin,
          status: status,
        },
        timeSeries: timeSeries,
        revenueBreakdown: {
          byStatus: revenueByStatus,
          byPaymentMethod: revenueByPaymentMethod,
          bySource: revenueBySource,
          totalDiscounts: totalDiscounts,
        },
        costBreakdown: {
          total: totalCosts,
          bySupplier: costBySupplierArray,
        },
        topGames: topGames,
        inventory: {
          totalValue: inventoryValue,
          potentialRevenue: potentialRevenue,
          potentialProfit: potentialProfit,
        },
        projections: {
          projectedMonthlyRevenue: projectedMonthlyRevenue,
          projectedMonthlyProfit: projectedMonthlyProfit,
          salesVelocity: salesVelocity,
          inventoryTurnover: inventoryTurnover,
          growthRate: growthRate,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching financials:", error);
    return NextResponse.json(
      { error: "Failed to fetch financial data" },
      { status: 500 },
    );
  }
}
