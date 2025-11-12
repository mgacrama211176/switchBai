import mongoose, { Schema, Document } from "mongoose";

export interface IBuying extends Document {
  // Reference
  purchaseReference: string;

  // Supplier details (optional)
  supplierName?: string;
  supplierContact?: string;
  supplierNotes?: string;

  // Games purchased
  games: Array<{
    gameBarcode: string;
    gameTitle: string;
    sellingPrice: number;
    quantity: number;
    isNewGame: boolean;
    newGameDetails?: {
      gamePlatform: string | string[];
      gameRatings: string;
      gameDescription: string;
      gameImageURL: string;
      gameCategory: string;
      gameReleaseDate: string;
      tradable?: boolean;
      rentalAvailable?: boolean;
      rentalWeeklyRate?: number;
      class?: string;
    };
  }>;

  // Financial summary
  totalCost: number;
  totalExpectedRevenue: number;
  totalExpectedProfit: number;
  profitMargin: number;

  // Status
  status: "pending" | "completed" | "cancelled";

  // Timestamps
  purchasedAt: Date;
  completedAt?: Date;

  // Metadata
  adminNotes?: string;
  updatedAt: Date;
}

const BuyingSchema = new Schema<IBuying>(
  {
    // Reference
    purchaseReference: {
      type: String,
      required: [true, "Purchase reference is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    // Supplier details
    supplierName: {
      type: String,
      trim: true,
      maxlength: [100, "Supplier name cannot exceed 100 characters"],
    },
    supplierContact: {
      type: String,
      trim: true,
      maxlength: [100, "Supplier contact cannot exceed 100 characters"],
    },
    supplierNotes: {
      type: String,
      trim: true,
      maxlength: [500, "Supplier notes cannot exceed 500 characters"],
    },

    // Games purchased
    games: {
      type: [
        {
          gameBarcode: {
            type: String,
            required: true,
            trim: true,
          },
          gameTitle: {
            type: String,
            required: true,
            trim: true,
          },
          sellingPrice: {
            type: Number,
            required: true,
            min: [0, "Selling price cannot be negative"],
          },
          quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"],
          },
          isNewGame: {
            type: Boolean,
            required: true,
            default: false,
          },
          newGameDetails: {
            gamePlatform: Schema.Types.Mixed,
            gameRatings: String,
            gameDescription: String,
            gameImageURL: String,
            gameCategory: String,
            gameReleaseDate: String,
            tradable: Boolean,
            rentalAvailable: Boolean,
            rentalWeeklyRate: Number,
            class: String,
          },
        },
      ],
      required: [true, "At least one game is required"],
      validate: {
        validator: function (v: any[]) {
          return v.length > 0;
        },
        message: "At least one game is required",
      },
    },

    // Financial summary
    totalCost: {
      type: Number,
      required: [true, "Total cost is required"],
      min: [0, "Total cost cannot be negative"],
    },
    totalExpectedRevenue: {
      type: Number,
      required: [true, "Total expected revenue is required"],
      min: [0, "Total expected revenue cannot be negative"],
    },
    totalExpectedProfit: {
      type: Number,
      required: [true, "Total expected profit is required"],
    },
    profitMargin: {
      type: Number,
      required: [true, "Profit margin is required"],
    },

    // Status
    status: {
      type: String,
      enum: {
        values: ["pending", "completed", "cancelled"],
        message: "Status must be pending, completed, or cancelled",
      },
      default: "pending",
    },

    // Timestamps
    purchasedAt: {
      type: Date,
      default: Date.now,
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
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Indexes for better query performance
BuyingSchema.index({ purchaseReference: 1 });
BuyingSchema.index({ purchasedAt: -1 });
BuyingSchema.index({ status: 1 });
BuyingSchema.index({ supplierName: 1 });

const BuyingModel =
  mongoose.models.Buying || mongoose.model<IBuying>("Buying", BuyingSchema);

export default BuyingModel;
