import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface IRAGMetrics {
  query: string;
  gamesRetrieved: number;
  faqsRetrieved: number;
  avgGameScore: number;
  avgFAQScore: number;
  hasLowConfidence: boolean;
  contextLength: number;
}

export interface IResponseMetrics {
  modelUsed: string;
  responseTime: number;
  tokenCount?: number;
}

export interface IFeedback {
  helpful: boolean;
  rating?: number;
  comment?: string;
}

export interface ISupportChat extends Document {
  chatId: string;
  messages: IChatMessage[];
  ragMetrics?: IRAGMetrics;
  responseMetrics?: IResponseMetrics;
  feedback?: IFeedback;
  metadata?: {
    userAgent?: string;
    sessionStart?: Date;
    messageCount: number;
  };
  needsReview: boolean;
  reviewed: boolean;
  adminNotes?: string;
  conversationEnded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  role: {
    type: String,
    enum: ["user", "assistant", "system"],
    required: true,
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const RAGMetricsSchema = new Schema<IRAGMetrics>(
  {
    query: { type: String, required: true },
    gamesRetrieved: { type: Number, default: 0 },
    faqsRetrieved: { type: Number, default: 0 },
    avgGameScore: { type: Number, default: 0 },
    avgFAQScore: { type: Number, default: 0 },
    hasLowConfidence: { type: Boolean, default: false },
    contextLength: { type: Number, default: 0 },
  },
  { _id: false },
);

const ResponseMetricsSchema = new Schema<IResponseMetrics>(
  {
    modelUsed: { type: String, required: true },
    responseTime: { type: Number, required: true }, // in milliseconds
    tokenCount: { type: Number },
  },
  { _id: false },
);

const FeedbackSchema = new Schema<IFeedback>(
  {
    helpful: { type: Boolean, required: true },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
  },
  { _id: false },
);

const SupportChatSchema = new Schema<ISupportChat>(
  {
    chatId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    messages: [ChatMessageSchema],
    ragMetrics: RAGMetricsSchema,
    responseMetrics: ResponseMetricsSchema,
    feedback: FeedbackSchema,
    metadata: {
      userAgent: { type: String },
      sessionStart: { type: Date },
      messageCount: { type: Number, default: 0 },
    },
    needsReview: {
      type: Boolean,
      default: false,
      index: true,
    },
    reviewed: {
      type: Boolean,
      default: false,
      index: true,
    },
    adminNotes: {
      type: String,
      maxlength: 1000,
    },
    conversationEnded: {
      type: Boolean,
      default: false,
      index: true,
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
SupportChatSchema.index({ createdAt: -1 });
SupportChatSchema.index({ needsReview: 1, createdAt: -1 });
SupportChatSchema.index({ reviewed: 1, createdAt: -1 });
SupportChatSchema.index({ conversationEnded: 1, createdAt: -1 });
SupportChatSchema.index({ "ragMetrics.hasLowConfidence": 1 });
SupportChatSchema.index({ "ragMetrics.query": "text" });

// Prevent model recompilation error in development
const SupportChat: Model<ISupportChat> =
  mongoose.models.SupportChat ||
  mongoose.model<ISupportChat>("SupportChat", SupportChatSchema);

export default SupportChat;
