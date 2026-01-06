import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SupportChat from "@/models/SupportChat";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const { chatId, helpful, rating, comment } = body;

    if (!chatId) {
      return NextResponse.json(
        { error: "chatId is required" },
        { status: 400 },
      );
    }

    if (typeof helpful !== "boolean") {
      return NextResponse.json(
        { error: "helpful is required and must be boolean" },
        { status: 400 },
      );
    }

    const chat = await SupportChat.findOne({ chatId });

    if (!chat) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Update feedback
    chat.feedback = {
      helpful,
      rating: rating && rating >= 1 && rating <= 5 ? rating : undefined,
      comment:
        comment && comment.trim().length > 0 ? comment.trim() : undefined,
    };

    await chat.save();

    return NextResponse.json({
      success: true,
      message: "Feedback saved successfully",
    });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 },
    );
  }
}
