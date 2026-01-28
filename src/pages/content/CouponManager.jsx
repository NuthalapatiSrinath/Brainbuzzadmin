import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCoupons,
  toggleCouponStatus,
  deleteCoupon,
} from "../../store/slices/couponSlice";
import CouponModal from "../../components/modals/CouponModal";
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Percent,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";

const CouponManager = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Local state for basic filtering (if needed, or pass params to fetch)
  const [filterActive, setFilterActive] = useState("all"); // 'all', 'active', 'inactive'

  const { items, loading, pagination } = useSelector((state) => state.coupons);

  useEffect(() => {
    // Fetch coupons based on filter
    const params = { page: 1, limit: 20 };
    if (filterActive !== "all") {
      params.isActive = filterActive === "active";
    }
    dispatch(fetchCoupons(params));
  }, [dispatch, filterActive]);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (
      confirm(
        "Are you sure you want to delete this coupon? This cannot be undone.",
      )
    ) {
      dispatch(deleteCoupon(id));
    }
  };

  const handleToggle = (id) => {
    dispatch(toggleCouponStatus(id));
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Coupon Manager
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Create and manage discount codes
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Create Coupon
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["all", "active", "inactive"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterActive(status)}
            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
              filterActive === status
                ? "bg-white text-indigo-600 shadow-sm border border-indigo-100"
                : "text-slate-500 hover:bg-white hover:text-slate-700"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* List */}
      {loading && items.length === 0 ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.length > 0 ? (
            items.map((coupon) => (
              <div
                key={coupon._id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
              >
                {/* Left: Info */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${coupon.isActive ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400"}`}
                  >
                    {coupon.discountType === "percentage" ? (
                      <Percent size={24} />
                    ) : (
                      <span className="text-xl font-bold">₹</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-black text-slate-800 tracking-wide font-mono">
                        {coupon.code}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${coupon.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mb-1">
                      {coupon.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={12} /> Expires:{" "}
                        {new Date(coupon.validUntil).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag size={12} /> {coupon.usedCount} used
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle: Value */}
                <div className="text-right md:text-center min-w-[120px]">
                  <span className="block text-2xl font-black text-slate-800">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}%`
                      : `₹${coupon.discountValue}`}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    OFF
                  </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => handleToggle(coupon._id)}
                    title={coupon.isActive ? "Deactivate" : "Activate"}
                    className={`p-2 rounded-lg transition-colors ${coupon.isActive ? "text-green-600 hover:bg-green-50" : "text-slate-400 hover:bg-slate-100"}`}
                  >
                    {coupon.isActive ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <XCircle size={20} />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No coupons found.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <CouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editData={editingCoupon}
      />
    </div>
  );
};

export default CouponManager;
