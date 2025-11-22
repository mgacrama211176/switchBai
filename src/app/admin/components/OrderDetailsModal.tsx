"use client";

import { useState, useEffect } from "react";
import {
  HiX,
  HiPhone,
  HiMail,
  HiLocationMarker,
  HiCalendar,
  HiCash,
  HiUser,
  HiPencil,
  HiCheck,
  HiClipboardCopy,
} from "react-icons/hi";
import UpdateOrderStatusModal from "./UpdateOrderStatusModal";
import Toast from "./Toast";

interface OrderGame {
  gameBarcode: string;
  gameTitle: string;
  gamePrice: number;
  quantity: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerFacebookUrl?: string;
  games: OrderGame[];
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryLandmark?: string;
  deliveryNotes?: string;
  paymentMethod: "cod" | "bank_transfer" | "gcash" | "cash";
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  discountAmount?: number;
  totalCost?: number;
  totalProfit?: number;
  profitMargin?: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "shipped"
    | "delivered"
    | "cancelled";
  submittedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  orderSource: "website" | "manual";
  adminNotes?: string;
}

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onStatusUpdate: () => void;
}

export default function OrderDetailsModal({
  order,
  onClose,
  onStatusUpdate,
}: OrderDetailsModalProps) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order>(order);

  // Form state
  const [formData, setFormData] = useState({
    customerName: order.customerName,
    customerPhone: order.customerPhone || "",
    customerEmail: order.customerEmail || "",
    customerFacebookUrl: order.customerFacebookUrl || "",
    deliveryAddress: order.deliveryAddress || "",
    deliveryCity: order.deliveryCity || "",
    deliveryLandmark: order.deliveryLandmark || "",
    deliveryNotes: order.deliveryNotes || "",
    paymentMethod: order.paymentMethod,
    deliveryFee: order.deliveryFee,
    discountType: order.discountType || "",
    discountValue: order.discountValue || "",
  });

  // Update form data when order changes
  useEffect(() => {
    setCurrentOrder(order);
    setFormData({
      customerName: order.customerName,
      customerPhone: order.customerPhone || "",
      customerEmail: order.customerEmail || "",
      customerFacebookUrl: order.customerFacebookUrl || "",
      deliveryAddress: order.deliveryAddress || "",
      deliveryCity: order.deliveryCity || "",
      deliveryLandmark: order.deliveryLandmark || "",
      deliveryNotes: order.deliveryNotes || "",
      paymentMethod: order.paymentMethod,
      deliveryFee: order.deliveryFee,
      discountType: order.discountType || "",
      discountValue: order.discountValue || "",
    });
  }, [order]);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatPrice(price: number) {
    return `₱${price.toLocaleString()}`;
  }

  function getStatusBadge(status: string) {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
      preparing: {
        color: "bg-purple-100 text-purple-800",
        label: "Processing",
      },
      shipped: { color: "bg-indigo-100 text-indigo-800", label: "Shipped" },
      delivered: { color: "bg-green-100 text-green-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}
      >
        {config.label}
      </span>
    );
  }

  function getPaymentMethodDisplay(method: string) {
    const methods: { [key: string]: string } = {
      cod: "Cash on Delivery (COD)",
      bank_transfer: "Bank Transfer",
      gcash: "GCash",
      cash: "Cash (Meet-up)",
    };
    return methods[method] || method;
  }

  function calculateDiscount() {
    if (!formData.discountType || formData.discountValue === "") {
      return 0;
    }
    if (formData.discountType === "percentage") {
      return currentOrder.subtotal * (Number(formData.discountValue) / 100);
    } else {
      return Math.min(Number(formData.discountValue), currentOrder.subtotal);
    }
  }

  function calculateTotalAfterDiscount() {
    return currentOrder.subtotal - calculateDiscount();
  }

  function calculateTotal() {
    return calculateTotalAfterDiscount() + formData.deliveryFee;
  }

  function validateForm(): string | null {
    if (
      !formData.customerName.trim() ||
      formData.customerName.trim().length < 2
    ) {
      return "Customer name must be at least 2 characters";
    }

    // Validate phone if provided
    if (formData.customerPhone.trim()) {
      const phoneRegex = /^(\+639|09)\d{9}$/;
      const cleanPhone = formData.customerPhone.replace(/[-\s]/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        return "Please enter a valid Philippine phone number";
      }
    }

    // Validate email if provided
    if (formData.customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.customerEmail.trim())) {
        return "Invalid email address";
      }
    }

    // Validate Facebook URL if provided
    if (formData.customerFacebookUrl.trim()) {
      try {
        new URL(formData.customerFacebookUrl);
      } catch {
        return "Please enter a valid Facebook URL";
      }
    }

    // Validate address fields (all or none)
    const hasAddress =
      formData.deliveryAddress.trim() ||
      formData.deliveryCity.trim() ||
      formData.deliveryLandmark.trim();
    if (hasAddress) {
      if (
        !formData.deliveryAddress.trim() ||
        formData.deliveryAddress.trim().length < 10
      ) {
        return "If providing address, it must be at least 10 characters";
      }
      if (
        !formData.deliveryCity.trim() ||
        formData.deliveryCity.trim().length < 2
      ) {
        return "If providing address, city must be at least 2 characters";
      }
      if (
        !formData.deliveryLandmark.trim() ||
        formData.deliveryLandmark.trim().length < 3
      ) {
        return "If providing address, landmark must be at least 3 characters";
      }
    }

    if (formData.deliveryFee < 0) {
      return "Delivery fee cannot be negative";
    }

    return null;
  }

  async function handleSave() {
    const error = validateForm();
    if (error) {
      setToast({ message: error, type: "error" });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/purchases/${currentOrder._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: formData.customerName.trim(),
          customerPhone: formData.customerPhone.trim() || undefined,
          customerEmail: formData.customerEmail.trim() || undefined,
          customerFacebookUrl: formData.customerFacebookUrl.trim() || undefined,
          deliveryAddress: formData.deliveryAddress.trim() || undefined,
          deliveryCity: formData.deliveryCity.trim() || undefined,
          deliveryLandmark: formData.deliveryLandmark.trim() || undefined,
          deliveryNotes: formData.deliveryNotes.trim() || undefined,
          paymentMethod: formData.paymentMethod,
          deliveryFee: formData.deliveryFee,
          discountType: formData.discountType || undefined,
          discountValue:
            formData.discountValue !== ""
              ? Number(formData.discountValue)
              : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update order");
      }

      // Update current order with response
      setCurrentOrder(data.order);
      setToast({
        message: "Order details updated successfully!",
        type: "success",
      });
      setIsEditing(false);
      onStatusUpdate(); // Refresh parent component
    } catch (error) {
      console.error("Error updating order:", error);
      setToast({
        message:
          error instanceof Error ? error.message : "Failed to update order",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    // Reset form to original order values
    setFormData({
      customerName: currentOrder.customerName,
      customerPhone: currentOrder.customerPhone || "",
      customerEmail: currentOrder.customerEmail || "",
      customerFacebookUrl: currentOrder.customerFacebookUrl || "",
      deliveryAddress: currentOrder.deliveryAddress || "",
      deliveryCity: currentOrder.deliveryCity || "",
      deliveryLandmark: currentOrder.deliveryLandmark || "",
      deliveryNotes: currentOrder.deliveryNotes || "",
      paymentMethod: currentOrder.paymentMethod,
      deliveryFee: currentOrder.deliveryFee,
      discountType: currentOrder.discountType || "",
      discountValue: currentOrder.discountValue || "",
    });
    setIsEditing(false);
  }

  async function handleCopyTrackingLink() {
    try {
      const trackingUrl = `${window.location.origin}/track-order?ordernumber=${currentOrder.orderNumber}`;
      await navigator.clipboard.writeText(trackingUrl);
      setToast({
        message: "Tracking link copied to clipboard!",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to copy tracking link:", error);
      setToast({
        message: "Failed to copy tracking link. Please try again.",
        type: "error",
      });
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Order Details
              </h2>
              <p className="text-gray-600">Order: {order.orderNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiX className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Status and Order Number */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Status
                </h3>
                <div className="mt-2">
                  {getStatusBadge(currentOrder.status)}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <div className="text-2xl font-bold text-funBlue">
                    {currentOrder.orderNumber}
                  </div>
                  <button
                    onClick={handleCopyTrackingLink}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                    title="Copy tracking link"
                  >
                    <HiClipboardCopy className="w-5 h-5 text-funBlue group-hover:text-blue-600" />
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Submitted: {formatDate(currentOrder.submittedAt)}
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <HiUser className="w-5 h-5 mr-2" />
                  Customer Information
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-funBlue text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <HiPencil className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Name <span className="text-red-500">*</span>
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.customerName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customerName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {currentOrder.customerName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Phone {isEditing && "(Optional)"}
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.customerPhone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customerPhone: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                        />
                      ) : currentOrder.customerPhone ? (
                        <div className="flex items-center space-x-2">
                          <p className="text-gray-900">
                            {currentOrder.customerPhone}
                          </p>
                          <a
                            href={`tel:${currentOrder.customerPhone}`}
                            className="text-funBlue hover:text-blue-600"
                          >
                            <HiPhone className="w-4 h-4" />
                          </a>
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">Not provided</p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Email {isEditing && "(Optional)"}
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={formData.customerEmail}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customerEmail: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                        />
                      ) : currentOrder.customerEmail ? (
                        <div className="flex items-center space-x-2">
                          <p className="text-gray-900">
                            {currentOrder.customerEmail}
                          </p>
                          <a
                            href={`mailto:${currentOrder.customerEmail}`}
                            className="text-funBlue hover:text-blue-600"
                          >
                            <HiMail className="w-4 h-4" />
                          </a>
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">Not provided</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Facebook {isEditing && "(Optional)"}
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={formData.customerFacebookUrl}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customerFacebookUrl: e.target.value,
                            })
                          }
                          placeholder="https://facebook.com/..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                        />
                      ) : currentOrder.customerFacebookUrl ? (
                        <p className="text-gray-900">
                          <a
                            href={currentOrder.customerFacebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-funBlue hover:text-blue-600"
                          >
                            View Profile
                          </a>
                        </p>
                      ) : (
                        <p className="text-gray-400 italic">Not provided</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Games */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Games ({currentOrder.games.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                        Game Title
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                        Barcode
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                        Price
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentOrder.games.map((game, index) => (
                      <tr key={index} className="bg-white">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {game.gameTitle}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                          {game.gameBarcode}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {game.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {formatPrice(game.gamePrice)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {formatPrice(game.gamePrice * game.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delivery Information */}
            {(isEditing ||
              currentOrder.deliveryAddress ||
              currentOrder.deliveryCity ||
              currentOrder.deliveryLandmark ||
              currentOrder.deliveryNotes) && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <HiLocationMarker className="w-5 h-5 mr-2" />
                  Delivery Information {isEditing && "(Optional)"}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.deliveryAddress}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deliveryAddress: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                      />
                    ) : currentOrder.deliveryAddress ? (
                      <p className="text-gray-900">
                        {currentOrder.deliveryAddress}
                      </p>
                    ) : (
                      <p className="text-gray-400 italic">Not provided</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        City
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.deliveryCity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              deliveryCity: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                        />
                      ) : currentOrder.deliveryCity ? (
                        <p className="text-gray-900">
                          {currentOrder.deliveryCity}
                        </p>
                      ) : (
                        <p className="text-gray-400 italic">Not provided</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Landmark
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.deliveryLandmark}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              deliveryLandmark: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                        />
                      ) : currentOrder.deliveryLandmark ? (
                        <p className="text-gray-900">
                          {currentOrder.deliveryLandmark}
                        </p>
                      ) : (
                        <p className="text-gray-400 italic">Not provided</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Notes {isEditing && "(Optional)"}
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.deliveryNotes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deliveryNotes: e.target.value,
                          })
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                      />
                    ) : currentOrder.deliveryNotes ? (
                      <p className="text-gray-900">
                        {currentOrder.deliveryNotes}
                      </p>
                    ) : (
                      <p className="text-gray-400 italic">Not provided</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payment and Order Summary */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HiCash className="w-5 h-5 mr-2" />
                Payment & Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Payment Method
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.paymentMethod}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              paymentMethod: e.target.value as
                                | "cod"
                                | "bank_transfer"
                                | "gcash"
                                | "cash",
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
                        >
                          <option value="cod">Cash on Delivery (COD)</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="gcash">GCash</option>
                          <option value="cash">Cash (Meet-up)</option>
                        </select>
                      ) : (
                        <p className="text-gray-900">
                          {getPaymentMethodDisplay(currentOrder.paymentMethod)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Order Source
                      </label>
                      <p className="text-gray-900 capitalize">
                        {currentOrder.orderSource}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(currentOrder.subtotal)}
                      </span>
                    </div>
                    {currentOrder.discountType &&
                      currentOrder.discountAmount && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Discount (
                              {currentOrder.discountType === "percentage"
                                ? `${currentOrder.discountValue}%`
                                : "Fixed"}
                              ):
                            </span>
                            <span className="text-sm font-medium text-red-600">
                              -{formatPrice(currentOrder.discountAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-gray-200 pt-2">
                            <span className="text-sm text-gray-600">
                              Subtotal After Discount:
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatPrice(
                                currentOrder.subtotal -
                                  (currentOrder.discountAmount || 0),
                              )}
                            </span>
                          </div>
                        </>
                      )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Delivery Fee:
                      </span>
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={formData.deliveryFee}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              deliveryFee: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent text-right"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(currentOrder.deliveryFee)}
                        </span>
                      )}
                    </div>
                    <div className="border-t border-gray-300 pt-2 flex justify-between">
                      <span className="text-base font-semibold text-gray-900">
                        Total:
                      </span>
                      <span className="text-base font-bold text-funBlue">
                        {formatPrice(
                          isEditing
                            ? calculateTotal()
                            : currentOrder.totalAmount,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HiCalendar className="w-5 h-5 mr-2" />
                Timeline
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Submitted:</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(currentOrder.submittedAt)}
                  </span>
                </div>
                {currentOrder.confirmedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confirmed:</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(currentOrder.confirmedAt)}
                    </span>
                  </div>
                )}
                {currentOrder.shippedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Shipped:</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(currentOrder.shippedAt)}
                    </span>
                  </div>
                )}
                {currentOrder.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Delivered:</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(currentOrder.deliveredAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Profit Information */}
            {(currentOrder.totalCost !== undefined ||
              currentOrder.totalProfit !== undefined) && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <HiCash className="w-5 h-5 mr-2" />
                  Profit Analysis
                </h3>
                <div className="space-y-2">
                  {currentOrder.totalCost !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Cost:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(currentOrder.totalCost)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Total Revenue:
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(
                        currentOrder.subtotal -
                          (currentOrder.discountAmount || 0),
                      )}
                    </span>
                  </div>
                  {currentOrder.totalProfit !== undefined && (
                    <div className="flex justify-between pt-2 border-t border-green-300">
                      <span className="text-sm font-semibold text-gray-900">
                        Total Profit:
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          currentOrder.totalProfit > 0
                            ? "text-green-600"
                            : currentOrder.totalProfit < 0
                              ? "text-red-600"
                              : "text-yellow-600"
                        }`}
                      >
                        {formatPrice(currentOrder.totalProfit)}
                      </span>
                    </div>
                  )}
                  {currentOrder.profitMargin !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Profit Margin:
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          currentOrder.profitMargin > 0
                            ? "text-green-600"
                            : currentOrder.profitMargin < 0
                              ? "text-red-600"
                              : "text-yellow-600"
                        }`}
                      >
                        {currentOrder.profitMargin.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {currentOrder.adminNotes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Admin Notes
                </h3>
                <p className="text-gray-700">{currentOrder.adminNotes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-6 py-2 bg-funBlue text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <HiCheck className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setShowUpdateModal(true)}
                    className="flex items-center space-x-2 px-6 py-2 bg-funBlue text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <HiPencil className="w-4 h-4" />
                    <span>Update Status</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showUpdateModal && (
        <UpdateOrderStatusModal
          order={currentOrder}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={() => {
            setShowUpdateModal(false);
            onStatusUpdate();
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
