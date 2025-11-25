import mongoose, { Schema, Document } from "mongoose";

export interface IKnowledgeBase extends Document {
  question: string;
  answer: string;
  category: string; // "payment", "rental", "trade", "shipping", "general"
  vector: number[]; // Vector embedding for semantic search (1024 dimensions)
  metadata?: {
    tags?: string[];
    priority?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeBaseSchema = new Schema<IKnowledgeBase>(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
      maxlength: [500, "Question cannot exceed 500 characters"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
      maxlength: [2000, "Answer cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["payment", "rental", "trade", "shipping", "general"],
        message:
          "Category must be one of: payment, rental, trade, shipping, general",
      },
    },
    vector: {
      type: [Number],
      required: [true, "Vector embedding is required"],
      select: false, // Don't include in default queries to reduce payload size
    },
    metadata: {
      tags: {
        type: [String],
        default: [],
      },
      priority: {
        type: Number,
        default: 0,
        min: [0, "Priority cannot be negative"],
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
        ret._id = ret._id.toString();
        return ret;
      },
    },
  },
);

// Indexes for better query performance
KnowledgeBaseSchema.index({ category: 1 });
KnowledgeBaseSchema.index({ "metadata.priority": -1 });
KnowledgeBaseSchema.index({ createdAt: -1 });

const KnowledgeBaseModel =
  mongoose.models.KnowledgeBase ||
  mongoose.model<IKnowledgeBase>("KnowledgeBase", KnowledgeBaseSchema);

export default KnowledgeBaseModel;
