import mongoose, { Schema, Document } from "mongoose";

export interface IRental extends Document {
  // Reference number
  referenceNumber: string;

  // Customer details
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerFacebookUrl?: string;
  customerIdImageUrl: string;

  // Game details
  gameBarcode: string;
  gameTitle: string;
  gamePrice: number;

  // Rental details
  startDate: string;
  endDate: string;
  rentalDays: number;

  // Delivery details
  deliveryAddress: string;
  deliveryCity: string;
  deliveryLandmark: string;
  deliveryNotes?: string;

  // Pricing details
  rentalFee: number;
  deposit: number;
  totalDue: number;
  appliedPlan: string;

  // Status and timestamps
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  submittedAt: Date;
  confirmedAt?: Date;
  updatedAt: Date;
}

const RentalSchema = new Schema<IRental>(
  {
    // Reference number
    referenceNumber: {
      type: String,
      required: [true, "Reference number is required"],
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
      required: [true, "Customer phone is required"],
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
      validate: {
        validator: function (v: string) {
          const phoneRegex = /^(\+639|09)\d{9}$/;
          return phoneRegex.test(v.replace(/[-\s]/g, ""));
        },
        message: "Please enter a valid Philippine phone number",
      },
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
      maxlength: [100, "Email cannot exceed 100 characters"],
      validate: {
        validator: function (v: string) {
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
    customerIdImageUrl: {
      type: String,
      required: [true, "Customer ID image is required"],
      trim: true,
    },

    // Game details
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

    // Rental details
    startDate: {
      type: String,
      required: [true, "Start date is required"],
      validate: {
        validator: function (v: string) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: "Start date must be in YYYY-MM-DD format",
      },
    },
    endDate: {
      type: String,
      required: [true, "End date is required"],
      validate: {
        validator: function (v: string) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: "End date must be in YYYY-MM-DD format",
      },
    },
    rentalDays: {
      type: Number,
      required: [true, "Rental days is required"],
      min: [1, "Rental days must be at least 1"],
      max: [30, "Maximum rental period is 30 days"],
    },

    // Delivery details
    deliveryAddress: {
      type: String,
      required: [true, "Delivery address is required"],
      trim: true,
      minlength: [10, "Address must be at least 10 characters"],
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    deliveryCity: {
      type: String,
      required: [true, "Delivery city is required"],
      trim: true,
      minlength: [2, "City must be at least 2 characters"],
      maxlength: [100, "City cannot exceed 100 characters"],
    },
    deliveryLandmark: {
      type: String,
      required: [true, "Delivery landmark is required"],
      trim: true,
      minlength: [3, "Landmark must be at least 3 characters"],
      maxlength: [200, "Landmark cannot exceed 200 characters"],
    },
    deliveryNotes: {
      type: String,
      trim: true,
      maxlength: [500, "Delivery notes cannot exceed 500 characters"],
    },

    // Pricing details
    rentalFee: {
      type: Number,
      required: [true, "Rental fee is required"],
      min: [0, "Rental fee cannot be negative"],
    },
    deposit: {
      type: Number,
      required: [true, "Deposit is required"],
      min: [0, "Deposit cannot be negative"],
    },
    totalDue: {
      type: Number,
      required: [true, "Total due is required"],
      min: [0, "Total due cannot be negative"],
    },
    appliedPlan: {
      type: String,
      required: [true, "Applied plan is required"],
      trim: true,
    },

    // Status and timestamps
    status: {
      type: String,
      enum: ["pending", "confirmed", "active", "completed", "cancelled"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    confirmedAt: {
      type: Date,
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
RentalSchema.index({ referenceNumber: 1 });
RentalSchema.index({ customerEmail: 1 });
RentalSchema.index({ gameBarcode: 1 });
RentalSchema.index({ status: 1 });
RentalSchema.index({ submittedAt: -1 });

const RentalModel =
  mongoose.models.Rental || mongoose.model<IRental>("Rental", RentalSchema);

export default RentalModel;
