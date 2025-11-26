import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import KnowledgeBaseModel from "@/models/KnowledgeBase";
import { generateDocumentEmbedding } from "@/lib/embeddings/generator";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
      ];
    }

    // Fetch entries (excluding vector field)
    const entries = await KnowledgeBaseModel.find(query)
      .select("-vector")
      .sort({ "metadata.priority": -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await KnowledgeBaseModel.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        entries: entries.map((entry: any) => ({
          _id: entry._id.toString(),
          question: entry.question,
          answer: entry.answer,
          category: entry.category,
          metadata: entry.metadata || {},
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
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
    console.error("Error fetching knowledge base:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge base entries" },
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

    const { question, answer, category, metadata } = body;

    // Validation
    if (!question || !answer || !category) {
      return NextResponse.json(
        { error: "Question, answer, and category are required" },
        { status: 400 },
      );
    }

    if (question.length > 500) {
      return NextResponse.json(
        { error: "Question cannot exceed 500 characters" },
        { status: 400 },
      );
    }

    if (answer.length > 2000) {
      return NextResponse.json(
        { error: "Answer cannot exceed 2000 characters" },
        { status: 400 },
      );
    }

    const validCategories = [
      "payment",
      "rental",
      "trade",
      "shipping",
      "general",
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Generate embedding
    const faqText = `${question} ${answer}`.trim();
    console.log("Generating embedding for new knowledge base entry...");
    const embedding = await generateDocumentEmbedding(faqText);

    // Create entry
    const entry = new KnowledgeBaseModel({
      question: question.trim(),
      answer: answer.trim(),
      category,
      vector: embedding,
      metadata: {
        tags: metadata?.tags || [],
        priority: metadata?.priority || 0,
      },
    });

    await entry.save();

    return NextResponse.json({
      success: true,
      data: {
        _id: entry._id.toString(),
        question: entry.question,
        answer: entry.answer,
        category: entry.category,
        metadata: entry.metadata,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error creating knowledge base entry:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to create knowledge base entry",
      },
      { status: 500 },
    );
  }
}
