import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Negotiation from "@/models/Negotiation";

export async function GET() {
  try {
    await connectDB();

    // Fetch all negotiations
    const allNegotiations = await Negotiation.find().lean();
    const totalNegotiations = allNegotiations.length;

    if (totalNegotiations === 0) {
      return NextResponse.json({
        success: true,
        analytics: {
          totalNegotiations: 0,
          successRate: 0,
          averageDiscount: 0,
          firstOfferAcceptanceRate: 0,
          insights: [],
        },
      });
    }

    // Calculate success metrics
    const successfulNegotiations = allNegotiations.filter(
      (n) => n.status === "success",
    );
    const successCount = successfulNegotiations.length;
    const successRate = (successCount / totalNegotiations) * 100;

    // Calculate average discount
    const totalDiscount = successfulNegotiations.reduce(
      (sum, n) => sum + (n.finalDiscount || 0),
      0,
    );
    const averageDiscount = successCount > 0 ? totalDiscount / successCount : 0;

    // Calculate first offer acceptance (negotiations with <= 2 messages that succeeded)
    const firstOfferAcceptances = successfulNegotiations.filter(
      (n) => n.messages.length <= 3, // greeting + user message + acceptance
    ).length;
    const firstOfferAcceptanceRate =
      successCount > 0 ? (firstOfferAcceptances / successCount) * 100 : 0;

    // Calculate average negotiation length
    const avgMessagesPerNegotiation =
      allNegotiations.reduce((sum, n) => sum + n.messages.length, 0) /
      totalNegotiations;

    // Price sensitivity analysis
    const highValueDeals = successfulNegotiations.filter(
      (n) => n.totalAmount > 2000,
    );
    const avgDiscountHighValue =
      highValueDeals.length > 0
        ? highValueDeals.reduce((sum, n) => sum + (n.finalDiscount || 0), 0) /
          highValueDeals.length
        : 0;

    const lowValueDeals = successfulNegotiations.filter(
      (n) => n.totalAmount <= 2000,
    );
    const avgDiscountLowValue =
      lowValueDeals.length > 0
        ? lowValueDeals.reduce((sum, n) => sum + (n.finalDiscount || 0), 0) /
          lowValueDeals.length
        : 0;

    // Generate insights
    const insights = [];

    if (firstOfferAcceptanceRate < 30) {
      insights.push({
        type: "strategy",
        message: `Only ${firstOfferAcceptanceRate.toFixed(1)}% accept first offer. Consider starting with better offers.`,
        priority: "high",
      });
    }

    if (avgDiscountHighValue > avgDiscountLowValue * 1.5) {
      insights.push({
        type: "pricing",
        message: `High-value items (>₱2000) require ${((avgDiscountHighValue / 2000) * 100).toFixed(1)}% average discount vs ${((avgDiscountLowValue / 1000) * 100).toFixed(1)}% for lower-priced items.`,
        priority: "medium",
      });
    }

    if (successRate < 50) {
      insights.push({
        type: "conversion",
        message: `Success rate is ${successRate.toFixed(1)}%. Consider being more flexible with discounts.`,
        priority: "high",
      });
    }

    if (avgMessagesPerNegotiation > 6) {
      insights.push({
        type: "efficiency",
        message: `Negotiations average ${avgMessagesPerNegotiation.toFixed(1)} messages. Try to close deals faster.`,
        priority: "low",
      });
    }

    return NextResponse.json({
      success: true,
      analytics: {
        totalNegotiations,
        successCount,
        successRate: parseFloat(successRate.toFixed(2)),
        averageDiscount: parseFloat(averageDiscount.toFixed(2)),
        firstOfferAcceptanceRate: parseFloat(
          firstOfferAcceptanceRate.toFixed(2),
        ),
        avgMessagesPerNegotiation: parseFloat(
          avgMessagesPerNegotiation.toFixed(2),
        ),
        priceSensitivity: {
          highValue: {
            count: highValueDeals.length,
            avgDiscount: parseFloat(avgDiscountHighValue.toFixed(2)),
          },
          lowValue: {
            count: lowValueDeals.length,
            avgDiscount: parseFloat(avgDiscountLowValue.toFixed(2)),
          },
        },
        insights,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
