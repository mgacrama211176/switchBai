import mongoose, { Schema, Document } from "mongoose";

export interface IPurchase extends Document {
  // Reference
  orderNumber: string;

  // Customer details
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerFacebookUrl?: string;

  // Game details (array to support multiple games per order)
  games: Array<{
    gameBarcode: string;
    gameTitle: string;
    gamePrice: number;
    quantity: number;
    variant?: "withCase" | "cartridgeOnly";
  }>;

  // Delivery details
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryLandmark?: string;
  deliveryNotes?: string;

  // Payment details
  paymentMethod: "cod" | "bank_transfer" | "gcash" | "cash";
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;

  // Discount details
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  discountAmount?: number;

  // Profit details
  totalCost?: number;
  totalProfit?: number;
  profitMargin?: number;

  // Status and timestamps
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "shipped"
    | "delivered"
    | "cancelled";
  submittedAt: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;

  // Metadata
  orderSource: "website" | "manual";
  createdBy?: string;
  adminNotes?: string;
  cancellationReason?: string;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    // Reference
    orderNumber: {
      type: String,
      required: [true, "Order number is required"],
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

    // Game details (array to support multiple games per order)
    games: {
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
            max: [10, "Maximum quantity is 10"],
          },
          variant: {
            type: String,
            enum: ["withCase", "cartridgeOnly"],
            required: false,
          },
        },
      ],
      required: [true, "At least one game is required"],
      validate: {
        validator: function (v: Array<any>) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one game is required",
      },
    },

    // Delivery details
    deliveryAddress: {
      type: String,
      required: false,
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Optional field
          return v.length >= 10;
        },
        message: "Address must be at least 10 characters if provided",
      },
    },
    deliveryCity: {
      type: String,
      required: false,
      trim: true,
      maxlength: [100, "City cannot exceed 100 characters"],
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Optional field
          return v.length >= 2;
        },
        message: "City must be at least 2 characters if provided",
      },
    },
    deliveryLandmark: {
      type: String,
      required: false,
      trim: true,
      maxlength: [200, "Landmark cannot exceed 200 characters"],
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Optional field
          return v.length >= 3;
        },
        message: "Landmark must be at least 3 characters if provided",
      },
    },
    deliveryNotes: {
      type: String,
      trim: true,
      maxlength: [500, "Delivery notes cannot exceed 500 characters"],
    },

    // Payment details
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["cod", "bank_transfer", "gcash", "cash"],
        message:
          "Payment method must be COD, Bank Transfer, GCash, or Cash (Meet-up)",
      },
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },
    deliveryFee: {
      type: Number,
      required: [true, "Delivery fee is required"],
      min: [0, "Delivery fee cannot be negative"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },

    // Discount details
    discountType: {
      type: String,
      enum: {
        values: ["percentage", "fixed"],
        message: "Discount type must be percentage or fixed",
      },
    },
    discountValue: {
      type: Number,
      min: [0, "Discount value cannot be negative"],
      validate: {
        validator: function (this: any, v: number | undefined) {
          if (v === undefined || v === null) return true; // Optional
          if (this.discountType === "percentage") {
            return v >= 0 && v <= 100;
          }
          return v >= 0;
        },
        message:
          "Discount value must be 0-100 for percentage, or >= 0 for fixed amount",
      },
    },
    discountAmount: {
      type: Number,
      min: [0, "Discount amount cannot be negative"],
    },

    // Profit details
    totalCost: {
      type: Number,
      min: [0, "Total cost cannot be negative"],
    },
    totalProfit: {
      type: Number,
    },
    profitMargin: {
      type: Number,
    },

    // Status and timestamps
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    confirmedAt: {
      type: Date,
    },
    shippedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },

    // Metadata
    orderSource: {
      type: String,
      required: [true, "Order source is required"],
      enum: {
        values: ["website", "manual"],
        message: "Order source must be website or manual",
      },
    },
    createdBy: {
      type: String,
      trim: true,
      maxlength: [100, "Created by cannot exceed 100 characters"],
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Admin notes cannot exceed 1000 characters"],
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [500, "Cancellation reason cannot exceed 500 characters"],
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
PurchaseSchema.index({ orderNumber: 1 });
PurchaseSchema.index({ customerEmail: 1 });
PurchaseSchema.index({ "games.gameBarcode": 1 });
PurchaseSchema.index({ status: 1 });
PurchaseSchema.index({ submittedAt: -1 });
PurchaseSchema.index({ orderSource: 1 });

const PurchaseModel =
  mongoose.models.Purchase ||
  mongoose.model<IPurchase>("Purchase", PurchaseSchema);

export default PurchaseModel;
