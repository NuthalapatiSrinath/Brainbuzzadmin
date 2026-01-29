import React from "react";
import { Calendar } from "lucide-react";

const DatePicker = ({
  label,
  value,
  onChange,
  type = "date", // 'date' or 'month'
  required = false,
  className = "",
  disabled = false,
  min,
  max,
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all ${
            disabled
              ? "bg-slate-50 text-slate-400 cursor-not-allowed"
              : "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          }`}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
        />
      </div>
    </div>
  );
};

export default DatePicker;
