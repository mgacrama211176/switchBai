import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface INegotiation extends Document {
  negotiationId: string;
  messages: IMessage[];
  cartItems: any[]; // Store snapshot of items being negotiated
  totalAmount: number;
  finalDiscount: number;
  customerName?: string; // For loyalty verification
  rejectionCount: number; // Number of times customer expressed displeasure
  status: "ongoing" | "success" | "failed" | "abandoned";
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ["user", "assistant", "system"],
    required: true,
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const NegotiationSchema = new Schema<INegotiation>(
  {
    negotiationId: { type: String, required: true, unique: true },
    messages: [MessageSchema],
    cartItems: [Schema.Types.Mixed],
    totalAmount: { type: Number, required: true },
    finalDiscount: { type: Number, default: 0 },
    customerName: { type: String }, // For loyalty verification
    rejectionCount: { type: Number, default: 0 }, // Track unhappy pushes
    status: {
      type: String,
      enum: ["ongoing", "success", "failed", "abandoned"],
      default: "ongoing",
    },
  },
  {
    timestamps: true,
  },
);

// Prevent model recompilation error in development
const Negotiation: Model<INegotiation> =
  mongoose.models.Negotiation ||
  mongoose.model<INegotiation>("Negotiation", NegotiationSchema);

export default Negotiation;
