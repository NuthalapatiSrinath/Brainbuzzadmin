import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Upload,
  Type,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import CustomDropdown from "../common/CustomDropdown";

const GenericModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
  fields,
}) => {
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});

  useEffect(() => {
    if (isOpen) {
      const initial = {};
      const initialPreviews = {};

      fields.forEach((field) => {
        const val = initialData
          ? initialData[field.name]?._id || initialData[field.name]
          : "";
        initial[field.name] = val || "";

        if (
          field.type === "file" &&
          initialData &&
          initialData[field.previewKey || "thumbnailUrl"]
        ) {
          initialPreviews[field.name] =
            initialData[field.previewKey || "thumbnailUrl"];
        }
      });

      setFormData(initial);
      setPreviews(initialPreviews);
      setFiles({});
    }
  }, [isOpen, initialData, fields]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name, file) => {
    setFiles((prev) => ({ ...prev, [name]: file }));

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [name]: objectUrl }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, ...files });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="generic-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {fields.map((field, idx) => {
                const Icon = field.icon || Type;
                const isFullWidth =
                  field.fullWidth ||
                  field.type === "textarea" ||
                  field.type === "file";

                return (
                  <div
                    key={idx}
                    className={isFullWidth ? "md:col-span-2" : "col-span-1"}
                  >
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                      {field.label}
                    </label>

                    {/* INPUTS */}
                    {(field.type === "text" ||
                      field.type === "date" ||
                      field.type === "number") && (
                      <div className="relative">
                        <Icon className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input
                          type={field.type}
                          value={formData[field.name] || ""}
                          onChange={(e) =>
                            handleChange(field.name, e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                          placeholder={field.placeholder}
                          required={field.required}
                          disabled={field.disabled}
                        />
                      </div>
                    )}

                    {/* DROPDOWN */}
                    {field.type === "select" && (
                      <CustomDropdown
                        value={formData[field.name]}
                        onChange={(val) => handleChange(field.name, val)}
                        options={field.options || []}
                        placeholder={field.placeholder}
                        icon={field.icon}
                        searchable
                        required={field.required}
                        disabled={field.disabled}
                      />
                    )}

                    {/* TEXTAREA */}
                    {field.type === "textarea" && (
                      <textarea
                        rows={3}
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          handleChange(field.name, e.target.value)
                        }
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all resize-none text-slate-700"
                        placeholder={field.placeholder}
                      />
                    )}

                    {/* FILE WITH FULL IMAGE PREVIEW */}
                    {field.type === "file" && (
                      <div
                        className={`relative group border-2 border-dashed rounded-2xl p-4 text-center transition-all duration-300 ${
                          previews[field.name]
                            ? "border-indigo-300 bg-indigo-50/30"
                            : "hover:border-indigo-400 hover:bg-indigo-50/30"
                        }`}
                      >
                        {previews[field.name] ? (
                          // ✅ FIXED: Increased height (h-48) and object-contain for full image
                          <div className="mb-3 relative w-full h-48 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                            <img
                              src={previews[field.name]}
                              alt="Preview"
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <p className="text-white text-xs font-bold">
                                Click to Change
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-3">
                            <div className="w-12 h-12 mx-auto bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center">
                              <Upload className="w-6 h-6" />
                            </div>
                          </div>
                        )}

                        <p className="text-sm font-bold text-slate-700">
                          {files[field.name]?.name ||
                            (previews[field.name]
                              ? "Change Image"
                              : "Upload " + field.label)}
                        </p>
                        <input
                          type="file"
                          accept={field.accept}
                          onChange={(e) =>
                            handleFileChange(field.name, e.target.files[0])
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          required={field.required && !previews[field.name]}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="generic-form"
            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenericModal;
