import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  fetchOrderDetails,
  updateOrderStatus,
  clearCurrentOrder,
} from "../../store/slices/orderSlice";
import OrderDetailsModal from "../../components/modals/OrderDetailsModal";
import CustomDropdown from "../../components/common/CustomDropdown";
import SearchBar from "../../components/common/SearchBar"; // NEW IMPORT
import {
  Loader2,
  Package,
  Filter,
  ArrowUpRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";

const OrderManager = () => {
  const dispatch = useDispatch();

  // State
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Stores user input
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redux
  const { items, currentOrder, loading, detailsLoading, pagination } =
    useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(
      fetchOrders({ page: 1, limit: 15, status: statusFilter || undefined }),
    );
  }, [dispatch, statusFilter]);

  // --- CLIENT-SIDE SEARCH LOGIC ---
  // Since the backend doesn't support 'search' param yet, we filter the loaded list.
  const filteredItems = items.filter((order) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const fullName =
      `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.toLowerCase();
    const email = (order.user?.email || "").toLowerCase();
    const orderId = (order.orderId || "").toLowerCase();
    const dbId = (order._id || "").toLowerCase();

    return (
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      orderId.includes(searchLower) ||
      dbId.includes(searchLower)
    );
  });

  const handleViewDetails = (id) => {
    dispatch(fetchOrderDetails(id));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(clearCurrentOrder());
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    if (
      window.confirm(
        `Are you sure you want to change the status to ${newStatus}?`,
      )
    ) {
      dispatch(updateOrderStatus({ orderId, status: newStatus }));
    }
  };

  const handleRefresh = () => {
    dispatch(
      fetchOrders({
        page: 1,
        limit: 15,
        status: statusFilter || undefined,
      }),
    );
  };

  // Helper Components
  const StatusBadge = ({ status }) => {
    const config = {
      completed: {
        bg: "bg-green-50",
        text: "text-green-700",
        icon: CheckCircle,
        border: "border-green-200",
      },
      pending: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        icon: Clock,
        border: "border-amber-200",
      },
      processing: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        icon: Activity,
        border: "border-blue-200",
      },
      cancelled: {
        bg: "bg-red-50",
        text: "text-red-700",
        icon: XCircle,
        border: "border-red-200",
      },
      refunded: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        icon: AlertCircle,
        border: "border-purple-200",
      },
    };

    const style = config[status] || {
      bg: "bg-slate-50",
      text: "text-slate-600",
      icon: Clock,
      border: "border-slate-200",
    };
    const Icon = style.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${style.bg} ${style.text} ${style.border}`}
      >
        <Icon size={12} strokeWidth={2.5} />
        {status}
      </span>
    );
  };

  const filterOptions = [
    { value: "", label: "All Statuses", icon: Filter },
    { value: "completed", label: "Completed", icon: CheckCircle },
    { value: "pending", label: "Pending", icon: Clock },
    { value: "processing", label: "Processing", icon: Activity },
    { value: "cancelled", label: "Cancelled", icon: XCircle },
    { value: "refunded", label: "Refunded", icon: AlertCircle },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50/30">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Order Management
          </h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            Monitor transactions and manage order fulfillment
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-5 py-2 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total Orders
            </span>
            <span className="text-lg font-black text-slate-800">
              {pagination.total || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-3 items-center">
        {/* Status Filter */}
        <div className="w-full sm:w-64">
          <CustomDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={filterOptions}
            placeholder="Filter by Status"
            icon={Filter}
          />
        </div>

        {/* NEW: Search Bar */}
        <div className="flex-1 min-w-[250px]">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by Name, Email or Order ID..."
          />
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
          title="Refresh List"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">
              Fetching orders...
            </p>
          </div>
        ) : filteredItems.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Order Details</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredItems.map((order) => (
                    <tr
                      key={order._id}
                      className="group hover:bg-slate-50/80 transition-colors duration-200"
                    >
                      {/* ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm group-hover:border-indigo-200 transition-colors">
                            <Package
                              size={16}
                              className="text-slate-400 group-hover:text-indigo-500"
                            />
                          </div>
                          <div>
                            <span className="block font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded w-fit mb-1">
                              #
                              {order.orderId ||
                                order._id.slice(-6).toUpperCase()}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">
                              {order.items?.length || 0} Items
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">
                          {order.user?.firstName} {order.user?.lastName}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          {order.user?.email}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <span className="font-black text-slate-900 text-base">
                          ₹{order.amount.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <div className="text-slate-600 font-medium">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewDetails(order._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm text-slate-600 text-xs font-bold rounded-lg transition-all"
                        >
                          Details <ArrowUpRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Showing Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    dispatch(
                      fetchOrders({
                        page: pagination.page - 1,
                        limit: 15,
                        status: statusFilter,
                      }),
                    )
                  }
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    dispatch(
                      fetchOrders({
                        page: pagination.page + 1,
                        limit: 15,
                        status: statusFilter,
                      }),
                    )
                  }
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-1"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-32 bg-white">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Package size={32} className="text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-bold text-lg mb-1">
              No Orders Found
            </h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              {searchTerm
                ? `No orders found matching "${searchTerm}".`
                : "We couldn't find any orders matching your current filters."}
            </p>
            <button
              onClick={() => {
                setStatusFilter("");
                setSearchTerm("");
                handleRefresh();
              }}
              className="mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        order={currentOrder}
        onStatusUpdate={handleStatusUpdate}
        loading={detailsLoading}
      />
    </div>
  );
};

export default OrderManager;
