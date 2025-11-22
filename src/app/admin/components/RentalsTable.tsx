"use client";

import { useEffect, useState } from "react";
import {
  HiSearch,
  HiChevronLeft,
  HiChevronRight,
  HiEye,
  HiPencil,
  HiPlus,
} from "react-icons/hi";
import RentalDetailsModal from "./RentalDetailsModal";
import UpdateRentalStatusModal from "./UpdateRentalStatusModal";
import AddRentalModal from "./AddRentalModal";
import Toast from "./Toast";

interface Rental {
  _id: string;
  referenceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  gameTitle: string;
  gameBarcode: string;
  startDate: string;
  endDate: string;
  rentalDays: number;
  rentalFee: number;
  deposit: number;
  totalDue: number;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  submittedAt: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryLandmark: string;
  deliveryNotes?: string;
  customerFacebookUrl?: string;
  customerIdImageUrl: string;
  gamePrice: number;
  appliedPlan: string;
}

interface RentalsTableProps {
  refreshTrigger: number;
  onRentalUpdated: () => void;
}

export default function RentalsTable({
  refreshTrigger,
  onRentalUpdated,
}: RentalsTableProps) {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [updatingRental, setUpdatingRental] = useState<Rental | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const itemsPerPage = 20;

  useEffect(() => {
    async function fetchRentals() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/rentals");
        const data = await response.json();
        setRentals(data.rentals || []);
        setFilteredRentals(data.rentals || []);
      } catch (error) {
        console.error("Error fetching rentals:", error);
        setToast({ message: "Failed to fetch rentals", type: "error" });
      } finally {
        setIsLoading(false);
      }
    }

    fetchRentals();
  }, [refreshTrigger]);

  useEffect(() => {
    let filtered = [...rentals];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (rental) =>
          rental.referenceNumber.toLowerCase().includes(searchLower) ||
          rental.customerName.toLowerCase().includes(searchLower) ||
          rental.customerEmail.toLowerCase().includes(searchLower) ||
          rental.gameTitle.toLowerCase().includes(searchLower),
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((rental) => rental.status === statusFilter);
    }

    setFilteredRentals(filtered);
    setCurrentPage(1);
  }, [rentals, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredRentals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRentals = filteredRentals.slice(startIndex, endIndex);

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  function getStatusBadge(status: string) {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
      active: { color: "bg-green-100 text-green-800", label: "Active" },
      completed: { color: "bg-gray-100 text-gray-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}
      >
        {config.label}
      </span>
    );
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatPrice(price: number) {
    return `₱${price.toLocaleString()}`;
  }

  function handleViewDetails(rental: Rental) {
    setSelectedRental(rental);
  }

  function handleUpdateStatus(rental: Rental) {
    setUpdatingRental(rental);
  }

  function handleUpdateSuccess() {
    setUpdatingRental(null);
    setToast({
      message: "Rental status updated successfully!",
      type: "success",
    });
    onRentalUpdated();
  }

  function handleAddSuccess() {
    setShowAddModal(false);
    setToast({
      message: "Rental created successfully!",
      type: "success",
    });
    onRentalUpdated();
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 rounded-xl animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {currentRentals.length} of {filteredRentals.length} rentals
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-funBlue text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <HiPlus className="w-5 h-5" />
          <span>Add Rental</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by reference, name, email, or game..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-funBlue focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Game
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentRentals.map((rental) => (
                <tr
                  key={rental._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewDetails(rental)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-funBlue">
                      {rental.referenceNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(rental.submittedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {rental.customerName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {rental.customerEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {rental.gameTitle}
                    </div>
                    <div className="text-xs text-gray-500">
                      {rental.gameBarcode}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(rental.startDate)} -{" "}
                      {formatDate(rental.endDate)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {rental.rentalDays} days
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(rental.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(rental.totalDue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(rental);
                        }}
                        className="text-funBlue hover:text-blue-600"
                      >
                        <HiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(rental);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <HiPencil className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredRentals.length)} of{" "}
              {filteredRentals.length} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedRental && (
        <RentalDetailsModal
          rental={selectedRental}
          onClose={() => setSelectedRental(null)}
          onStatusUpdate={() => {
            setSelectedRental(null);
            onRentalUpdated();
          }}
        />
      )}

      {updatingRental && (
        <UpdateRentalStatusModal
          rental={updatingRental}
          onClose={() => setUpdatingRental(null)}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {showAddModal && (
        <AddRentalModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
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
    </div>
  );
}
