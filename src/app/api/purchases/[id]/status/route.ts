import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PurchaseModel from "@/models/Purchase";
import GameModel from "@/models/Game";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 },
      );
    }

    const { status, notes } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Find the order
    const order = await PurchaseModel.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check valid status transitions
    const validTransitions: Record<string, string[]> = {
      pending: ["confirmed", "preparing", "shipped", "cancelled"],
      confirmed: ["preparing", "shipped", "cancelled"],
      preparing: ["shipped", "cancelled"],
      shipped: ["delivered", "cancelled"],
      delivered: [], // Terminal state
      cancelled: [], // Terminal state
    };

    const currentStatus = order.status;
    const availableTransitions = validTransitions[currentStatus] || [];

    if (status !== currentStatus && !availableTransitions.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status transition",
          currentStatus,
          availableTransitions,
        },
        { status: 400 },
      );
    }

    // Update the order status
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Set timestamps based on status
    if (status === "preparing" && !order.confirmedAt) {
      updateData.confirmedAt = new Date();
    }
    if (status === "shipped") {
      updateData.shippedAt = new Date();
    }
    if (status === "delivered") {
      updateData.deliveredAt = new Date();
    }

    // Add admin notes if provided
    if (notes) {
      updateData.adminNotes = notes;
    }

    // If status is changing to "delivered", deduct stock and increment sold count
    if (status === "delivered" && currentStatus !== "delivered") {
      // Loop through all games in the order
      for (const gameItem of order.games) {
        const game = await GameModel.findOne({
          gameBarcode: gameItem.gameBarcode,
        });

        if (!game) {
          return NextResponse.json(
            {
              error: `Game with barcode ${gameItem.gameBarcode} not found`,
            },
            { status: 404 },
          );
        }

        // Determine variant - if missing, check both stock types to infer the correct variant
        let variant: "withCase" | "cartridgeOnly";
        let variantStock: number;

        if (gameItem.variant) {
          // Variant is specified, use it
          variant = gameItem.variant;
          variantStock =
            variant === "cartridgeOnly"
              ? (game.stockCartridgeOnly ?? 0)
              : (game.stockWithCase ?? 0);
        } else {
          // Variant is missing - check both stock types to determine which one to use
          const stockWithCase = game.stockWithCase ?? 0;
          const stockCartridgeOnly = game.stockCartridgeOnly ?? 0;
          const hasEnoughWithCase = stockWithCase >= gameItem.quantity;
          const hasEnoughCartridgeOnly =
            stockCartridgeOnly >= gameItem.quantity;

          if (hasEnoughWithCase && hasEnoughCartridgeOnly) {
            // Both have sufficient stock - prefer "withCase" for backward compatibility
            variant = "withCase";
            variantStock = stockWithCase;
          } else if (hasEnoughCartridgeOnly) {
            // Only cartridge-only has sufficient stock
            variant = "cartridgeOnly";
            variantStock = stockCartridgeOnly;
          } else if (hasEnoughWithCase) {
            // Only with-case has sufficient stock
            variant = "withCase";
            variantStock = stockWithCase;
          } else {
            // Neither has sufficient stock
            return NextResponse.json(
              {
                error: `Insufficient stock for ${gameItem.gameTitle}. Available: withCase=${stockWithCase}, cartridgeOnly=${stockCartridgeOnly}, Required: ${gameItem.quantity}`,
              },
              { status: 400 },
            );
          }
        }

        // Check if stock is sufficient (redundant check but kept for safety)
        if (variantStock < gameItem.quantity) {
          return NextResponse.json(
            {
              error: `Insufficient stock for ${gameItem.gameTitle} (${variant}). Available: ${variantStock}, Required: ${gameItem.quantity}`,
            },
            { status: 400 },
          );
        }

        // Deduct from correct variant stock and increment sold count
        if (variant === "cartridgeOnly") {
          game.stockCartridgeOnly =
            (game.stockCartridgeOnly || 0) - gameItem.quantity;
        } else {
          game.stockWithCase = (game.stockWithCase || 0) - gameItem.quantity;
        }
        game.numberOfSold = (game.numberOfSold || 0) + gameItem.quantity;

        await game.save();
      }
    }

    // Update the order
    const updatedOrder = await PurchaseModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 },
    );
  }
}
