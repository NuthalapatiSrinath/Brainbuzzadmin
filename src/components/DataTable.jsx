import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  Inbox,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DataTable = ({
  title = "Data List",
  columns = [],
  data = [],
  loading = false,
  pagination,
  onPageChange,
  onLimitChange,
  onSearch,
  hideSearch = false,
  actionButton,
  renderExpandedRow,
}) => {
  const isServer = !!(pagination && onPageChange);

  // ✅ FIX 1: Set default limit to 20
  const [localPage, setLocalPage] = useState(1);
  const [localLimit, setLocalLimit] = useState(20);
  const [localSearch, setLocalSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState([]);

  const handleSearch = (e) => {
    const value = e.target.value;
    if (isServer && onSearch) onSearch(value);
    else {
      setLocalSearch(value);
      setLocalPage(1);
    }
  };

  // Reset page when data changes (for instant search results)
  useEffect(() => {
    setLocalPage(1);
  }, [data]);

  const processed = useMemo(() => {
    if (!isServer && localSearch) {
      return data.filter((row) =>
        Object.values(row).some((v) =>
          String(v).toLowerCase().includes(localSearch.toLowerCase()),
        ),
      );
    }
    return data;
  }, [data, localSearch, isServer]);

  // ✅ FIX 2: Use 20 as fallback if pagination prop is missing
  const limit = isServer ? pagination?.limit || 20 : localLimit;
  const page = isServer ? pagination?.page || 1 : localPage;
  const total = isServer ? pagination?.total || 0 : processed.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const rows = isServer
    ? data
    : processed.slice((page - 1) * limit, page * limit);

  const changePage = (p) => {
    if (p < 1 || p > totalPages) return;
    if (isServer) onPageChange(p);
    else setLocalPage(p);
  };

  const changeLimit = (l) => {
    if (isServer && onLimitChange) onLimitChange(l);
    else {
      setLocalLimit(l);
      setLocalPage(1);
    }
  };

  const pages = (() => {
    const list = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) list.push(i);
    } else if (page <= 3) list.push(1, 2, 3, 4, "...", totalPages);
    else if (page >= totalPages - 2)
      list.push(
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    else list.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    return list;
  })();

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden relative">
      {/* HEADER */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4 flex-shrink-0 bg-white z-20">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Found <span className="text-indigo-600 font-bold">{total}</span>{" "}
            records
          </p>
        </div>

        <div className="flex gap-3 items-center w-full sm:w-auto">
          {!hideSearch && (
            <div className="relative flex-1 sm:flex-none group">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                placeholder="Search..."
                defaultValue={isServer ? "" : localSearch}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full sm:w-[260px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
          )}
          {actionButton}
        </div>
      </div>

      {/* TABLE AREA CONTAINER */}
      <div className="flex-1 relative w-full overflow-hidden flex flex-col bg-slate-50/30">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center"
            >
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <span className="text-sm font-bold text-slate-600">
                  Loading Data...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCROLLABLE TABLE WRAPPER */}
        <div className="flex-1 w-full overflow-auto custom-scrollbar">
          <table className="min-w-full whitespace-nowrap text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-md z-10 shadow-sm border-b border-slate-200">
              <tr>
                {columns.map((c, i) => (
                  <th
                    key={i}
                    className={`px-5 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider ${
                      c.className || ""
                    }`}
                  >
                    {c.header}
                  </th>
                ))}
                {renderExpandedRow && (
                  <th className="w-10 px-5 bg-transparent" />
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {!loading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + (renderExpandedRow ? 1 : 0)}
                    className="py-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Inbox className="w-10 h-10 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">
                        No Data Found
                      </h3>
                      <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                        We couldn't find any records matching your search or
                        filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {rows.map((row, i) => {
                const id = row._id || row.id || i;
                const expanded = expandedRows.includes(id);

                return (
                  <React.Fragment key={id}>
                    <tr
                      className={`group transition-all duration-200 hover:bg-slate-50/80 ${
                        expanded ? "bg-indigo-50/30" : ""
                      }`}
                    >
                      {columns.map((c, j) => (
                        <td
                          key={j}
                          className={`px-5 py-4 text-sm font-medium text-slate-700 border-b border-transparent group-hover:border-slate-100 ${
                            c.className || ""
                          }`}
                        >
                          {c.render ? c.render(row, i) : row[c.accessor]}
                        </td>
                      ))}

                      {renderExpandedRow && (
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() =>
                              setExpandedRows(
                                expanded
                                  ? expandedRows.filter((x) => x !== id)
                                  : [...expandedRows, id],
                              )
                            }
                            className={`p-2 rounded-lg transition-all ${
                              expanded
                                ? "bg-indigo-100 text-indigo-600"
                                : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            }`}
                          >
                            {expanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}
                    </tr>

                    {expanded && renderExpandedRow && (
                      <tr>
                        <td
                          colSpan={columns.length + 1}
                          className="p-0 border-b border-slate-100"
                        >
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-50/50 overflow-hidden"
                          >
                            <div className="p-6">
                              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                {renderExpandedRow(row)}
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-6 py-4 border-t border-slate-100 bg-white z-20 flex flex-col sm:flex-row gap-5 items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
          <span>Rows per page:</span>
          <select
            value={limit}
            onChange={(e) => changeLimit(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer text-sm font-bold text-slate-700"
          >
            {/* ✅ FIX 3: Include 20 in options */}
            {[20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
          <button
            disabled={page === 1 || loading}
            onClick={() => changePage(page - 1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex gap-1 px-2">
            {pages.map((p, i) => (
              <button
                key={i}
                disabled={p === "..." || loading}
                onClick={() => typeof p === "number" && changePage(p)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                  p === page
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "text-slate-600 hover:bg-white hover:shadow-sm hover:text-indigo-600"
                } ${
                  p === "..."
                    ? "hover:bg-transparent hover:shadow-none cursor-default"
                    : ""
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <span className="sm:hidden text-sm font-bold text-slate-700 px-4">
            {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages || loading}
            onClick={() => changePage(page + 1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-500"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
