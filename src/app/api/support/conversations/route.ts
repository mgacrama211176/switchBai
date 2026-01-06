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
    const needsReview = searchParams.get("needsReview");
    const reviewed = searchParams.get("reviewed");
    const conversationEnded = searchParams.get("conversationEnded");
    const hasFeedback = searchParams.get("hasFeedback");
    const days = parseInt(searchParams.get("days") || "7");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build query
    const query: any = {
      createdAt: { $gte: startDate },
    };

    if (needsReview === "true") {
      query.needsReview = true;
    }

    if (reviewed === "true") {
      query.reviewed = true;
    } else if (reviewed === "false") {
      query.reviewed = false;
    }

    if (conversationEnded === "true") {
      query.conversationEnded = true;
    } else if (conversationEnded === "false") {
      query.conversationEnded = false;
    }

    if (hasFeedback === "true") {
      query.feedback = { $exists: true, $ne: null };
    }

    // Fetch conversations
    const conversations = await SupportChat.find(query)
      .select("-messages") // Don't include full messages in list view
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await SupportChat.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        conversations: conversations.map((conv: any) => ({
          _id: conv._id.toString(),
          chatId: conv.chatId,
          messageCount:
            conv.messages?.length || conv.metadata?.messageCount || 0,
          ragMetrics: conv.ragMetrics,
          responseMetrics: conv.responseMetrics,
          feedback: conv.feedback,
          needsReview: conv.needsReview,
          reviewed: conv.reviewed,
          adminNotes: conv.adminNotes,
          conversationEnded: conv.conversationEnded,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}
