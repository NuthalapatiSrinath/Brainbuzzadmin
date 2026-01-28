import React, { useState, useEffect, useRef } from "react";
import { Loader2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
// Assuming thunks
import {
  createSubCategory,
  updateSubCategory,
} from "../../store/slices/subCategorySlice";
import ModalManager from "./ModalManager";

const SubCategoryModal = ({
  isOpen,
  onClose,
  onSuccess,
  editData,
  categories = [],
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Form State
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setCategoryId(editData.category?._id || editData.category || "");
        setName(editData.name || "");
        setDescription(editData.description || "");
        setIsActive(editData.isActive ?? true);
        setThumbnailPreview(editData.thumbnailUrl || null);
        setThumbnail(null);
      } else {
        setCategoryId("");
        setName("");
        setDescription("");
        setIsActive(true);
        setThumbnail(null);
        setThumbnailPreview(null);
      }
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryId) {
      toast.error("Please select a parent category");
      return;
    }
    if (!name.trim()) {
      toast.error("SubCategory name is required");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("category", categoryId);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("isActive", isActive);

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      if (editData) {
        await dispatch(
          updateSubCategory({ id: editData._id, formData }),
        ).unwrap();
        toast.success("SubCategory updated");
      } else {
        await dispatch(createSubCategory(formData)).unwrap();
        toast.success("SubCategory created");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("❌ [SUBCATEGORY MODAL] Error:", error);
      toast.error(typeof error === "string" ? error : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalManager
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? "Edit SubCategory" : "Add SubCategory"}
      pageName="SUBCATEGORIES"
      modalType={editData ? "EDIT" : "CREATE"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Parent Category Select */}
        <div>
          <label className="text-sm font-medium text-slate-700">
            Parent Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Thumbnail */}
        <div className="flex flex-col items-center">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 relative overflow-hidden"
          >
            {thumbnailPreview ? (
              <img
                src={thumbnailPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Upload size={14} /> Upload Image
              </span>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files[0]) {
                  setThumbnail(e.target.files[0]);
                  setThumbnailPreview(URL.createObjectURL(e.target.files[0]));
                }
              }}
            />
          </div>
        </div>

        {/* Text Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <label className="text-sm text-slate-700">Active</label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {editData ? "Save" : "Create"}
          </button>
        </div>
      </form>
    </ModalManager>
  );
};

export default SubCategoryModal;
