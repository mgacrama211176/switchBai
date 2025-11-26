import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import KnowledgeBaseModel from "@/models/KnowledgeBase";
import { generateDocumentEmbedding } from "@/lib/embeddings/generator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const entry = await KnowledgeBaseModel.findById(id)
      .select("-vector")
      .lean();

    if (!entry) {
      return NextResponse.json(
        { error: "Knowledge base entry not found" },
        { status: 404 },
      );
    }

    const entryData = entry as any;

    return NextResponse.json({
      success: true,
      data: {
        _id: entryData._id.toString(),
        question: entryData.question,
        answer: entryData.answer,
        category: entryData.category,
        metadata: entryData.metadata || {},
        createdAt: entryData.createdAt,
        updatedAt: entryData.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching knowledge base entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge base entry" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const { question, answer, category, metadata } = body;

    // Find existing entry
    const existingEntry = await KnowledgeBaseModel.findById(id);
    if (!existingEntry) {
      return NextResponse.json(
        { error: "Knowledge base entry not found" },
        { status: 404 },
      );
    }

    // Validation
    if (question && question.length > 500) {
      return NextResponse.json(
        { error: "Question cannot exceed 500 characters" },
        { status: 400 },
      );
    }

    if (answer && answer.length > 2000) {
      return NextResponse.json(
        { error: "Answer cannot exceed 2000 characters" },
        { status: 400 },
      );
    }

    if (category) {
      const validCategories = [
        "payment",
        "rental",
        "trade",
        "shipping",
        "general",
      ];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 },
        );
      }
    }

    // Check if question or answer changed (need to regenerate embedding)
    const questionChanged =
      question && question.trim() !== existingEntry.question;
    const answerChanged = answer && answer.trim() !== existingEntry.answer;
    const needsReembedding = questionChanged || answerChanged;

    // Update fields
    if (question) existingEntry.question = question.trim();
    if (answer) existingEntry.answer = answer.trim();
    if (category) existingEntry.category = category;
    if (metadata) {
      existingEntry.metadata = {
        tags: metadata.tags || existingEntry.metadata?.tags || [],
        priority:
          metadata.priority !== undefined
            ? metadata.priority
            : existingEntry.metadata?.priority || 0,
      };
    }

    // Regenerate embedding if question/answer changed
    if (needsReembedding) {
      const faqText =
        `${existingEntry.question} ${existingEntry.answer}`.trim();
      console.log("Regenerating embedding for updated knowledge base entry...");
      const embedding = await generateDocumentEmbedding(faqText);
      existingEntry.vector = embedding;
    }

    await existingEntry.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: existingEntry._id.toString(),
        question: existingEntry.question,
        answer: existingEntry.answer,
        category: existingEntry.category,
        metadata: existingEntry.metadata,
        createdAt: existingEntry.createdAt,
        updatedAt: existingEntry.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error updating knowledge base entry:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to update knowledge base entry",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const entry = await KnowledgeBaseModel.findByIdAndDelete(id);

    if (!entry) {
      return NextResponse.json(
        { error: "Knowledge base entry not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Knowledge base entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting knowledge base entry:", error);
    return NextResponse.json(
      { error: "Failed to delete knowledge base entry" },
      { status: 500 },
    );
  }
}
