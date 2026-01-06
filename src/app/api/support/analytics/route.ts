import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import SupportChat from "@/models/SupportChat";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const days = parseInt(searchParams.get("days") || "7"); // Default to last 7 days
    const confidenceThreshold = parseFloat(
      searchParams.get("confidenceThreshold") || "0.5",
    );

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Base query for date range
    const dateQuery = { createdAt: { $gte: startDate } };

    if (type === "unanswered") {
      // Questions with no RAG results
      const unansweredChats = await SupportChat.find({
        ...dateQuery,
        "ragMetrics.gamesRetrieved": 0,
        "ragMetrics.faqsRetrieved": 0,
        "ragMetrics.query": { $exists: true, $ne: "" },
      })
        .select("ragMetrics.query createdAt")
        .lean();

      // Aggregate by question text (exact match)
      const questionFrequency = new Map<
        string,
        {
          question: string;
          count: number;
          firstSeen: Date;
          lastSeen: Date;
        }
      >();

      unansweredChats.forEach((chat: any) => {
        const query = chat.ragMetrics?.query?.trim();
        if (!query) return;

        if (questionFrequency.has(query)) {
          const existing = questionFrequency.get(query)!;
          existing.count++;
          if (new Date(chat.createdAt) < existing.firstSeen) {
            existing.firstSeen = new Date(chat.createdAt);
          }
          if (new Date(chat.createdAt) > existing.lastSeen) {
            existing.lastSeen = new Date(chat.createdAt);
          }
        } else {
          questionFrequency.set(query, {
            question: query,
            count: 1,
            firstSeen: new Date(chat.createdAt),
            lastSeen: new Date(chat.createdAt),
          });
        }
      });

      const unanswered = Array.from(questionFrequency.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 50); // Top 50

      return NextResponse.json({
        success: true,
        data: {
          type: "unanswered",
          period: `${days} days`,
          total: unanswered.length,
          questions: unanswered,
        },
      });
    }

    if (type === "low-confidence") {
      // Queries with low confidence scores
      const lowConfidenceChats = await SupportChat.find({
        ...dateQuery,
        "ragMetrics.hasLowConfidence": true,
        "ragMetrics.query": { $exists: true, $ne: "" },
      })
        .select("ragMetrics createdAt")
        .lean();

      const questionFrequency = new Map<
        string,
        {
          question: string;
          count: number;
          avgGameScore: number;
          avgFAQScore: number;
          firstSeen: Date;
          lastSeen: Date;
        }
      >();

      lowConfidenceChats.forEach((chat: any) => {
        const metrics = chat.ragMetrics;
        if (!metrics?.query) return;

        const query = metrics.query.trim();
        if (questionFrequency.has(query)) {
          const existing = questionFrequency.get(query)!;
          existing.count++;
          existing.avgGameScore =
            (existing.avgGameScore + (metrics.avgGameScore || 0)) / 2;
          existing.avgFAQScore =
            (existing.avgFAQScore + (metrics.avgFAQScore || 0)) / 2;
          if (new Date(chat.createdAt) < existing.firstSeen) {
            existing.firstSeen = new Date(chat.createdAt);
          }
          if (new Date(chat.createdAt) > existing.lastSeen) {
            existing.lastSeen = new Date(chat.createdAt);
          }
        } else {
          questionFrequency.set(query, {
            question: query,
            count: 1,
            avgGameScore: metrics.avgGameScore || 0,
            avgFAQScore: metrics.avgFAQScore || 0,
            firstSeen: new Date(chat.createdAt),
            lastSeen: new Date(chat.createdAt),
          });
        }
      });

      const lowConfidence = Array.from(questionFrequency.values())
        .filter(
          (q) =>
            q.avgGameScore < confidenceThreshold ||
            q.avgFAQScore < confidenceThreshold,
        )
        .sort((a, b) => b.count - a.count)
        .slice(0, 50);

      return NextResponse.json({
        success: true,
        data: {
          type: "low-confidence",
          period: `${days} days`,
          threshold: confidenceThreshold,
          total: lowConfidence.length,
          questions: lowConfidence,
        },
      });
    }

    if (type === "suggestions") {
      // Combined suggestions from both unanswered and low-confidence
      const [unansweredChats, lowConfidenceChats] = await Promise.all([
        SupportChat.find({
          ...dateQuery,
          "ragMetrics.gamesRetrieved": 0,
          "ragMetrics.faqsRetrieved": 0,
          "ragMetrics.query": { $exists: true, $ne: "" },
        })
          .select("ragMetrics.query createdAt")
          .lean(),
        SupportChat.find({
          ...dateQuery,
          "ragMetrics.hasLowConfidence": true,
          "ragMetrics.query": { $exists: true, $ne: "" },
        })
          .select("ragMetrics.query createdAt")
          .lean(),
      ]);

      const suggestions = new Map<
        string,
        {
          question: string;
          count: number;
          reason: "no-results" | "low-confidence" | "both";
          firstSeen: Date;
          lastSeen: Date;
          suggestedCategory: string;
        }
      >();

      // Process unanswered
      unansweredChats.forEach((chat: any) => {
        const query = chat.ragMetrics?.query?.trim();
        if (!query) return;

        if (suggestions.has(query)) {
          const existing = suggestions.get(query)!;
          existing.count++;
          if (existing.reason === "low-confidence") {
            existing.reason = "both";
          } else {
            existing.reason = "no-results";
          }
          if (new Date(chat.createdAt) < existing.firstSeen) {
            existing.firstSeen = new Date(chat.createdAt);
          }
          if (new Date(chat.createdAt) > existing.lastSeen) {
            existing.lastSeen = new Date(chat.createdAt);
          }
        } else {
          suggestions.set(query, {
            question: query,
            count: 1,
            reason: "no-results",
            firstSeen: new Date(chat.createdAt),
            lastSeen: new Date(chat.createdAt),
            suggestedCategory: categorizeQuestion(query),
          });
        }
      });

      // Process low-confidence
      lowConfidenceChats.forEach((chat: any) => {
        const query = chat.ragMetrics?.query?.trim();
        if (!query) return;

        if (suggestions.has(query)) {
          const existing = suggestions.get(query)!;
          existing.count++;
          if (existing.reason === "no-results") {
            existing.reason = "both";
          } else {
            existing.reason = "low-confidence";
          }
          if (new Date(chat.createdAt) < existing.firstSeen) {
            existing.firstSeen = new Date(chat.createdAt);
          }
          if (new Date(chat.createdAt) > existing.lastSeen) {
            existing.lastSeen = new Date(chat.createdAt);
          }
        } else {
          suggestions.set(query, {
            question: query,
            count: 1,
            reason: "low-confidence",
            firstSeen: new Date(chat.createdAt),
            lastSeen: new Date(chat.createdAt),
            suggestedCategory: categorizeQuestion(query),
          });
        }
      });

      const suggestionsArray = Array.from(suggestions.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 50);

      return NextResponse.json({
        success: true,
        data: {
          type: "suggestions",
          period: `${days} days`,
          total: suggestionsArray.length,
          suggestions: suggestionsArray,
        },
      });
    }

    // Default: return all analytics
    const [unansweredCount, lowConfidenceCount, totalChats, needsReviewCount] =
      await Promise.all([
        SupportChat.countDocuments({
          ...dateQuery,
          "ragMetrics.gamesRetrieved": 0,
          "ragMetrics.faqsRetrieved": 0,
        }),
        SupportChat.countDocuments({
          ...dateQuery,
          "ragMetrics.hasLowConfidence": true,
        }),
        SupportChat.countDocuments(dateQuery),
        SupportChat.countDocuments({
          ...dateQuery,
          needsReview: true,
        }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        type: "all",
        period: `${days} days`,
        summary: {
          totalChats,
          unansweredQueries: unansweredCount,
          lowConfidenceQueries: lowConfidenceCount,
          needsReview: needsReviewCount,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}

/**
 * Simple categorization based on keywords
 */
function categorizeQuestion(question: string): string {
  const lowerQuestion = question.toLowerCase();

  if (
    lowerQuestion.includes("payment") ||
    lowerQuestion.includes("pay") ||
    lowerQuestion.includes("gcash") ||
    lowerQuestion.includes("cash") ||
    lowerQuestion.includes("money")
  ) {
    return "payment";
  }

  if (
    lowerQuestion.includes("rental") ||
    lowerQuestion.includes("rent") ||
    lowerQuestion.includes("borrow")
  ) {
    return "rental";
  }

  if (
    lowerQuestion.includes("trade") ||
    lowerQuestion.includes("exchange") ||
    lowerQuestion.includes("swap")
  ) {
    return "trade";
  }

  if (
    lowerQuestion.includes("delivery") ||
    lowerQuestion.includes("shipping") ||
    lowerQuestion.includes("ship") ||
    lowerQuestion.includes("location") ||
    lowerQuestion.includes("where")
  ) {
    return "shipping";
  }

  return "general";
}
