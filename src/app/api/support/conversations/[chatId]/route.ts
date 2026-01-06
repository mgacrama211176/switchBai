import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import SupportChat from "@/models/SupportChat";
import { generateDocumentEmbedding } from "@/lib/embeddings/generator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { chatId } = await params;

    const conversation = await SupportChat.findOne({ chatId }).lean();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: conversation._id.toString(),
        chatId: conversation.chatId,
        messages: conversation.messages,
        ragMetrics: conversation.ragMetrics,
        responseMetrics: conversation.responseMetrics,
        feedback: conversation.feedback,
        needsReview: conversation.needsReview,
        reviewed: conversation.reviewed,
        adminNotes: conversation.adminNotes,
        conversationEnded: conversation.conversationEnded,
        metadata: conversation.metadata,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { chatId } = await params;
    const body = await request.json();

    const conversation = await SupportChat.findOne({ chatId });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Update fields
    if (body.reviewed !== undefined) {
      conversation.reviewed = body.reviewed;
    }

    if (body.adminNotes !== undefined) {
      conversation.adminNotes = body.adminNotes;
    }

    await conversation.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: conversation._id.toString(),
        chatId: conversation.chatId,
        reviewed: conversation.reviewed,
        adminNotes: conversation.adminNotes,
      },
    });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { chatId } = await params;
    const body = await request.json();

    const { question, answer, category } = body;

    if (!question || !answer || !category) {
      return NextResponse.json(
        { error: "Question, answer, and category are required" },
        { status: 400 },
      );
    }

    // Get conversation to extract context
    const conversation = await SupportChat.findOne({ chatId });
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Generate embedding
    const faqText = `${question} ${answer}`.trim();
    const embedding = await generateDocumentEmbedding(faqText);

    // Import KnowledgeBase model
    const KnowledgeBaseModel = (await import("@/models/KnowledgeBase")).default;

    // Create KB entry
    const entry = new KnowledgeBaseModel({
      question: question.trim(),
      answer: answer.trim(),
      category,
      vector: embedding,
      metadata: {
        tags: [],
        priority: 0,
      },
    });

    await entry.save();

    // Mark conversation as reviewed
    conversation.reviewed = true;
    await conversation.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: entry._id.toString(),
        question: entry.question,
        answer: entry.answer,
        category: entry.category,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error creating KB entry from conversation:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to create KB entry from conversation",
      },
      { status: 500 },
    );
  }
}
