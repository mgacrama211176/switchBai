import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BuyingModel from "@/models/Buying";
import PurchaseModel from "@/models/Purchase";
import RentalModel from "@/models/Rental";
import GameModel from "@/models/Game";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const period = searchParams.get("period") || "all";
    const filterType = searchParams.get("filterType") || "all";

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

    // Fetch all data
    const [buyingRecords, orders, rentals, games] = await Promise.all([
      BuyingModel.find(buyingQuery).lean(),
      PurchaseModel.find(orderQuery).lean(),
      RentalModel.find(rentalQuery).lean(),
      GameModel.find({}).lean(),
    ]);

    // Calculate Total Costs (from completed buying records)
    const totalCosts = buyingRecords.reduce(
      (sum, record) => sum + (record.totalCost || 0),
      0,
    );

    // Calculate Total Revenue (from delivered orders)
    // Revenue = totalAmount (already includes discount)
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0,
    );

    // Calculate Rental Revenue
    const rentalRevenue = rentals.reduce(
      (sum, rental) => sum + (rental.rentalFee || 0),
      0,
    );

    // Total Revenue including rentals
    const totalRevenueWithRentals = totalRevenue + rentalRevenue;

    // Calculate Gross Profit
    const grossProfit = totalRevenueWithRentals - totalCosts;

    // Calculate Profit Margin
    const profitMargin =
      totalRevenueWithRentals > 0
        ? (grossProfit / totalRevenueWithRentals) * 100
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
      }
    >();

    // Process orders for time series
    orders.forEach((order) => {
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
        });
      }

      const entry = timeSeriesMap.get(key)!;
      entry.revenue += order.totalAmount || 0;
      entry.orderCount += 1;
    });

    // Process buying records for time series
    buyingRecords.forEach((buying) => {
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
        });
      }

      const entry = timeSeriesMap.get(key)!;
      entry.costs += buying.totalCost || 0;
    });

    // Process rentals for time series
    rentals.forEach((rental) => {
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
        });
      }

      const entry = timeSeriesMap.get(key)!;
      entry.revenue += rental.rentalFee || 0;
      entry.rentalCount += 1;
    });

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

    orders.forEach((order) => {
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

    // Cost Breakdown by Supplier
    const costBySupplier = new Map<string, number>();
    buyingRecords.forEach((buying) => {
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

    orders.forEach((order) => {
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

    // Inventory Value
    let inventoryValue = 0;
    let potentialRevenue = 0;

    games.forEach((game) => {
      const stock = game.gameAvailableStocks || 0;
      const costPrice = game.costPrice || 0;
      const sellingPrice =
        game.isOnSale && game.salePrice ? game.salePrice : game.gamePrice;

      inventoryValue += stock * costPrice;
      potentialRevenue += stock * sellingPrice;
    });

    const potentialProfit = potentialRevenue - inventoryValue;

    // Market Projections
    // Calculate sales velocity (games sold per day in the last 30 days)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = orders.filter(
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
    const recentCosts = buyingRecords
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
    const totalGamesSoldAllTime = orders.reduce(
      (sum: number, order: any) =>
        sum +
        order.games.reduce(
          (gameSum: number, game: { quantity?: number }) =>
            gameSum + (game.quantity || 0),
          0,
        ),
      0,
    );

    const currentInventory = games.reduce(
      (sum: number, game: any) => sum + (game.gameAvailableStocks || 0),
      0,
    );

    const inventoryTurnover =
      currentInventory > 0 ? totalGamesSoldAllTime / currentInventory : 0;

    // Growth Rate (month-over-month)
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const currentMonthRevenue = orders
      .filter(
        (order: any) =>
          order.deliveredAt && new Date(order.deliveredAt) >= currentMonth,
      )
      .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

    const lastMonthRevenue = orders
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
          totalRevenueWithRentals: totalRevenueWithRentals,
          grossProfit: grossProfit,
          profitMargin: profitMargin,
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
