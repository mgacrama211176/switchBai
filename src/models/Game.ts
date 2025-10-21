import mongoose, { Schema, Document } from "mongoose";

export interface IGame extends Document {
  gameTitle: string;
  gamePlatform: string | string[];
  gameRatings: string;
  gameBarcode: string;
  gameDescription: string;
  gameImageURL: string;
  gameAvailableStocks: number;
  gamePrice: number;
  gameCategory: string;
  gameReleaseDate: string;
  numberOfSold?: number;
  rentalAvailable?: boolean;
  rentalWeeklyRate?: number;
  class?: string;
  tradable?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema = new Schema<IGame>(
  {
    gameTitle: {
      type: String,
      required: [true, "Game title is required"],
      trim: true,
      maxlength: [200, "Game title cannot exceed 200 characters"],
    },
    gamePlatform: {
      type: Schema.Types.Mixed,
      required: [true, "Game platform is required"],
      validate: {
        validator: function (v: any) {
          return Array.isArray(v) ? v.length > 0 : typeof v === "string";
        },
        message: "Game platform must be a string or non-empty array",
      },
    },
    gameRatings: {
      type: String,
      required: [true, "Game ratings is required"],
      enum: {
        values: ["E", "E10+", "T", "M", "AO", "RP"],
        message: "Game ratings must be one of: E, E10+, T, M, AO, RP",
      },
    },
    gameBarcode: {
      type: String,
      required: [true, "Game barcode is required"],
      unique: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^\d{10,13}$/.test(v);
        },
        message: "Game barcode must be 10-13 digits",
      },
    },
    gameDescription: {
      type: String,
      required: [true, "Game description is required"],
      trim: true,
      maxlength: [2000, "Game description cannot exceed 2000 characters"],
    },
    gameImageURL: {
      type: String,
      required: [true, "Game image URL is required"],
      trim: true,
      validate: {
        validator: function (v: string) {
          // Allow local paths with image extensions and HTTP URLs (including Firebase Storage URLs)
          return /^(\/.*\.(jpg|jpeg|png|webp)|https?:\/\/.+)$/i.test(v);
        },
        message: "Game image URL must be a valid image URL or local path",
      },
    },
    gameAvailableStocks: {
      type: Number,
      required: [true, "Available stocks is required"],
      min: [0, "Available stocks cannot be negative"],
      max: [9999, "Available stocks cannot exceed 9999"],
    },
    gamePrice: {
      type: Number,
      required: [true, "Game price is required"],
      min: [0, "Game price cannot be negative"],
      max: [99999, "Game price cannot exceed 99999"],
    },
    gameCategory: {
      type: String,
      required: [true, "Game category is required"],
      trim: true,
      validate: {
        validator: function (v: string) {
          // Allow any category but suggest common ones
          const commonCategories = [
            "RPG",
            "Platformer",
            "Action-Adventure",
            "Fighting",
            "Racing",
            "Sports",
            "Puzzle",
            "Strategy",
            "Simulation",
            "Horror",
            "Shooter",
            "Action",
            "Adventure",
            "Indie",
            "Party",
            "Music",
            "Educational",
            "Other",
          ];
          return Boolean(v && v.length > 0);
        },
        message: "Game category is required",
      },
    },
    gameReleaseDate: {
      type: String,
      required: [true, "Game release date is required"],
      validate: {
        validator: function (v: string) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: "Game release date must be in YYYY-MM-DD format",
      },
    },
    numberOfSold: {
      type: Number,
      default: 0,
      min: [0, "Number of sold cannot be negative"],
    },
    rentalAvailable: {
      type: Boolean,
      default: false,
    },
    rentalWeeklyRate: {
      type: Number,
      min: [0, "Rental weekly rate cannot be negative"],
      validate: {
        validator: function (this: any, v: number) {
          return !this.rentalAvailable || (v && v > 0);
        },
        message: "Rental weekly rate is required when rental is available",
      },
    },
    class: {
      type: String,
      trim: true,
    },
    tradable: {
      type: Boolean,
      default: true,
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
GameSchema.index({ gameBarcode: 1 }, { unique: true });
GameSchema.index({ gameTitle: "text", gameDescription: "text" });
GameSchema.index({ gameCategory: 1 });
GameSchema.index({ gamePlatform: 1 });
GameSchema.index({ gamePrice: 1 });
GameSchema.index({ gameAvailableStocks: 1 });
GameSchema.index({ rentalAvailable: 1 });
GameSchema.index({ createdAt: -1 });

// Pre-save middleware to ensure platform is always an array
GameSchema.pre("save", function (next) {
  if (typeof this.gamePlatform === "string") {
    this.gamePlatform = [this.gamePlatform];
  }
  next();
});

const GameModel =
  mongoose.models.Game || mongoose.model<IGame>("Game", GameSchema);

export default GameModel;
