import mongoose, { Schema, Document } from "mongoose";

export interface IPurchase extends Document {
  // Reference
  orderNumber: string;

  // Customer details
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerFacebookUrl?: string;

  // Game details
  gameBarcode: string;
  gameTitle: string;
  gamePrice: number;
  quantity: number;

  // Delivery details
  deliveryAddress: string;
  deliveryCity: string;
  deliveryLandmark: string;
  deliveryNotes?: string;

  // Payment details
  paymentMethod: "cod" | "bank_transfer" | "gcash";
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;

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
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      max: [5, "Maximum quantity is 5"],
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

    // Payment details
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["cod", "bank_transfer", "gcash"],
        message: "Payment method must be COD, Bank Transfer, or GCash",
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
PurchaseSchema.index({ gameBarcode: 1 });
PurchaseSchema.index({ status: 1 });
PurchaseSchema.index({ submittedAt: -1 });
PurchaseSchema.index({ orderSource: 1 });

const PurchaseModel =
  mongoose.models.Purchase ||
  mongoose.model<IPurchase>("Purchase", PurchaseSchema);

export default PurchaseModel;
