import mongoose, { Schema, Document } from "mongoose";

export interface ITrade extends Document {
  // Reference
  tradeReference: string;

  // Customer details
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerFacebookUrl?: string;

  // Games given (customer is trading in)
  gamesGiven: Array<{
    gameBarcode: string;
    gameTitle: string;
    gamePrice: number;
    quantity: number;
    isNewGame?: boolean; // If true, game needs to be created
    newGameDetails?: {
      // Full game details if creating new game
      gamePlatform: string | string[];
      gameRatings: string;
      gameDescription: string;
      gameImageURL: string;
      gameCategory: string;
      gameReleaseDate: string;
    };
  }>;

  // Games received (customer is receiving)
  gamesReceived: Array<{
    gameBarcode: string;
    gameTitle: string;
    gamePrice: number;
    quantity: number;
  }>;

  // Trade details
  tradeLocation?: string;
  notes?: string;

  // Financial details
  totalValueGiven: number;
  totalValueReceived: number;
  cashDifference: number; // Always >= 0
  tradeFee: number; // Always ₱200 trading fee

  // Status and timestamps
  status: "pending" | "confirmed" | "completed" | "cancelled";
  submittedAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;

  // Metadata
  adminNotes?: string;
  updatedAt: Date;
}

const TradeSchema = new Schema<ITrade>(
  {
    // Reference
    tradeReference: {
      type: String,
      required: [true, "Trade reference is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    // Customer details
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      minlength: [2, "Customer name must be at least 2 characters"],
      maxlength: [100, "Customer name cannot exceed 100 characters"],
    },
    customerPhone: {
      type: String,
      required: false,
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Optional field
          const phoneRegex = /^(\+639|09)\d{9}$/;
          return phoneRegex.test(v.replace(/[-\s]/g, ""));
        },
        message: "Please enter a valid Philippine phone number",
      },
    },
    customerEmail: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      maxlength: [100, "Email cannot exceed 100 characters"],
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Optional field
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(v);
        },
        message: "Please enter a valid email address",
      },
    },
    customerFacebookUrl: {
      type: String,
      trim: true,
      maxlength: [200, "Facebook URL cannot exceed 200 characters"],
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Optional field
          const urlRegex = /^https?:\/\/.+/;
          return urlRegex.test(v);
        },
        message: "Please enter a valid URL",
      },
    },

    // Games given
    gamesGiven: {
      type: [
        {
          gameBarcode: {
            type: String,
            required: [true, "Game barcode is required"],
            trim: true,
          },
          gameTitle: {
            type: String,
            required: [true, "Game title is required"],
            trim: true,
          },
          gamePrice: {
            type: Number,
            required: [true, "Game price is required"],
            min: [0, "Game price cannot be negative"],
          },
          quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"],
          },
          isNewGame: {
            type: Boolean,
            default: false,
          },
          newGameDetails: {
            type: {
              gamePlatform: Schema.Types.Mixed,
              gameRatings: String,
              gameDescription: String,
              gameImageURL: String,
              gameCategory: String,
              gameReleaseDate: String,
            },
            required: false,
          },
        },
      ],
      required: [true, "At least one game given is required"],
      validate: {
        validator: function (v: Array<any>) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one game given is required",
      },
    },

    // Games received
    gamesReceived: {
      type: [
        {
          gameBarcode: {
            type: String,
            required: [true, "Game barcode is required"],
            trim: true,
          },
          gameTitle: {
            type: String,
            required: [true, "Game title is required"],
            trim: true,
          },
          gamePrice: {
            type: Number,
            required: [true, "Game price is required"],
            min: [0, "Game price cannot be negative"],
          },
          quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"],
          },
        },
      ],
      required: [true, "At least one game received is required"],
      validate: {
        validator: function (v: Array<any>) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one game received is required",
      },
    },

    // Trade details
    tradeLocation: {
      type: String,
      trim: true,
      maxlength: [500, "Trade location cannot exceed 500 characters"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },

    // Financial details
    totalValueGiven: {
      type: Number,
      required: [true, "Total value given is required"],
      min: [0, "Total value given cannot be negative"],
    },
    totalValueReceived: {
      type: Number,
      required: [true, "Total value received is required"],
      min: [0, "Total value received cannot be negative"],
    },
    cashDifference: {
      type: Number,
      required: [true, "Cash difference is required"],
      min: [0, "Cash difference cannot be negative"],
    },
    tradeFee: {
      type: Number,
      required: [true, "Trade fee is required"],
      min: [0, "Trade fee cannot be negative"],
      default: 0,
    },

    // Status and timestamps
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    confirmedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },

    // Metadata
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Admin notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret._id = ret._id.toString();
        return ret;
      },
    },
  },
);

// Indexes
TradeSchema.index({ tradeReference: 1 });
TradeSchema.index({ status: 1 });
TradeSchema.index({ submittedAt: -1 });
TradeSchema.index({ "gamesGiven.gameBarcode": 1 });
TradeSchema.index({ "gamesReceived.gameBarcode": 1 });

const TradeModel =
  mongoose.models.Trade || mongoose.model<ITrade>("Trade", TradeSchema);

export default TradeModel;
